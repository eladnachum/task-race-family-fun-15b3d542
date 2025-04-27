import React, { createContext, useState, useContext, useEffect } from 'react';
import { Avatar, Player, Task, avatars, familyMembers, syncPlayerTasks, checkWinner } from '@/lib/gameData';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';

interface GameContextType {
  players: Player[];
  currentPlayer: Player | null;
  showPlayerSelection: boolean;
  isGameActive: boolean;
  winner: Player | null;
  selectCurrentPlayer: (playerId: string) => void;
  completeTask: (taskId: string) => void;
  resetGame: () => void;
  setShowPlayerSelection: (show: boolean) => void;
  syncFromLocalStorage: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Database table name
const GAME_TABLE = 'morning_tasks_game';
const CURRENT_GAME_ID = 'current-game'; // We'll use a single game ID for simplicity

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(familyMembers);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showPlayerSelection, setShowPlayerSelection] = useState(true);
  const [isGameActive, setIsGameActive] = useState(true);
  const [winner, setWinner] = useState<Player | null>(null);
  
  // Initial data fetch from Supabase on mount
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const { data, error } = await supabase
          .from(GAME_TABLE)
          .select('*')
          .eq('id', CURRENT_GAME_ID)
          .single();
        
        if (error) {
          console.error('Error fetching game data:', error);
          // Create a new game if one doesn't exist
          if (error.code === 'PGRST116') { // Record not found
            await initializeGame();
          }
          return;
        }
        
        if (data) {
          const gameData = data.game_data;
          setPlayers(gameData.players || familyMembers);
          setIsGameActive(gameData.isGameActive !== undefined ? gameData.isGameActive : true);
          if (gameData.winner) {
            setWinner(gameData.winner);
          }
        }
      } catch (err) {
        console.error('Failed to fetch game data:', err);
      }
    };
    
    const initializeGame = async () => {
      try {
        const { error } = await supabase
          .from(GAME_TABLE)
          .insert({
            id: CURRENT_GAME_ID,
            game_data: {
              players: familyMembers,
              isGameActive: true,
              winner: null,
            },
            created_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Error initializing game:', error);
          return;
        }
        
        console.log('New game initialized');
      } catch (err) {
        console.error('Failed to initialize game:', err);
      }
    };
    
    fetchGameData();
    
    // Subscribe to real-time updates from Supabase
    const subscription = supabase
      .channel('game-updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: GAME_TABLE,
        filter: `id=eq.${CURRENT_GAME_ID}`
      }, (payload) => {
        console.log('Real-time update received:', payload);
        
        const gameData = payload.new.game_data;
        if (gameData) {
          setPlayers(gameData.players);
          setIsGameActive(gameData.isGameActive);
          
          // Update current player reference if it exists
          if (currentPlayer) {
            const updatedCurrentPlayer = gameData.players.find(p => p.id === currentPlayer.id);
            if (updatedCurrentPlayer) {
              setCurrentPlayer(updatedCurrentPlayer);
            }
          }
          
          // Check for winner updates
          if (gameData.winner && !winner) {
            setWinner(gameData.winner);
            
            // Play victory fanfare sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
            audio.play().catch(err => console.log('Audio play failed:', err));
            
            toast(`${gameData.winner.name} wins the Morning Tasks Race! 🎉`, {
              description: "All tasks completed! Great job!"
            });
          }
        }
      })
      .subscribe();
      
    // Clean up subscription on unmount
    return () => {
      supabase.channel('game-updates').unsubscribe();
    };
  }, [currentPlayer]);
  
  // Update Supabase with game state
  const updateGameState = async (gameData: any) => {
    try {
      const { error } = await supabase
        .from(GAME_TABLE)
        .update({ 
          game_data: gameData,
          updated_at: new Date().toISOString() 
        })
        .eq('id', CURRENT_GAME_ID);
      
      if (error) {
        console.error('Error updating game state:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Failed to update game state:', err);
      return false;
    }
  };
  
  // Legacy function now calling Supabase update
  const syncFromLocalStorage = async () => {
    // This function no longer pulls from localStorage, but we keep it for API compatibility
    try {
      const { data, error } = await supabase
        .from(GAME_TABLE)
        .select('*')
        .eq('id', CURRENT_GAME_ID)
        .single();
      
      if (error || !data) {
        console.error('Error syncing from Supabase:', error);
        return;
      }
      
      const gameData = data.game_data;
      if (gameData) {
        setPlayers(gameData.players);
        
        // Update current player if it's in the list
        if (currentPlayer) {
          const updatedCurrentPlayer = gameData.players.find(p => p.id === currentPlayer.id);
          if (updatedCurrentPlayer) {
            setCurrentPlayer(updatedCurrentPlayer);
          }
        }
        
        // Update winner state
        if (gameData.winner) {
          setWinner(gameData.winner);
          setIsGameActive(false);
        }
      }
    } catch (err) {
      console.error('Error syncing from Supabase:', err);
    }
  };

  const selectCurrentPlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId) || null;
    setCurrentPlayer(player);
    setShowPlayerSelection(false);
    
    toast(`Selected ${player?.name}`, {
      description: "Complete your tasks as fast as you can!"
    });
  };

  const completeTask = async (taskId: string) => {
    if (!currentPlayer) return;
    
    // Create a new array of tasks with the updated task
    const updatedTasks = currentPlayer.tasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    );
    
    // Create a new player object with updated tasks
    const updatedPlayer = {
      ...currentPlayer,
      tasks: updatedTasks
    };
    
    // Update the players array with the new player object
    const updatedPlayers = players.map(player => 
      player.id === currentPlayer.id ? updatedPlayer : player
    );
    
    setPlayers(updatedPlayers);
    setCurrentPlayer(updatedPlayer);
    
    // Check for winner
    const gameWinner = checkWinner(updatedPlayers);
    let updatedWinner = null;
    
    if (gameWinner && isGameActive) {
      // Update the player with isWinner flag
      const finalPlayers = updatedPlayers.map(player => 
        player.id === gameWinner.id ? { ...player, isWinner: true } : player
      );
      
      setPlayers(finalPlayers);
      setWinner(gameWinner);
      setIsGameActive(false);
      updatedWinner = gameWinner;
      
      // Update Supabase with the winner and final players
      await updateGameState({
        players: finalPlayers,
        isGameActive: false,
        winner: gameWinner
      });
      
      // Play victory fanfare sound - will be played on this client only
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
      
      toast(`${gameWinner.name} wins the Morning Tasks Race! 🎉`, {
        description: "All tasks completed! Great job!"
      });
    } else {
      // Update Supabase with just the updated players
      await updateGameState({
        players: updatedPlayers,
        isGameActive,
        winner: winner
      });
    }
    
    // Play sound effect for task completion - local client only
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3');
    audio.play().catch(err => console.log('Audio play failed', err));
  };

  const resetGame = async () => {
    const resetPlayers = players.map(player => ({
      ...player,
      tasks: player.tasks.map(task => ({ ...task, completed: false })),
      isWinner: false
    }));
    
    setPlayers(resetPlayers);
    setWinner(null);
    setIsGameActive(true);
    
    // Update Supabase with reset game state
    await updateGameState({
      players: resetPlayers,
      isGameActive: true,
      winner: null
    });
    
    toast("Game Reset! Ready, Set, Go!", {
      description: "Everyone's tasks have been reset. Good luck!"
    });
  };

  const value = {
    players,
    currentPlayer,
    showPlayerSelection,
    isGameActive,
    winner,
    selectCurrentPlayer,
    completeTask,
    resetGame,
    setShowPlayerSelection,
    syncFromLocalStorage
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
