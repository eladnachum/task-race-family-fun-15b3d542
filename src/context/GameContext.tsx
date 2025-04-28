import React, { createContext, useState, useContext, useEffect } from 'react';
import { Avatar, Player, Task, avatars, familyMembers, syncPlayerTasks, checkWinner } from '@/lib/gameData';
import { toast } from '@/components/ui/sonner';

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

// Local storage keys
const STORAGE_KEYS = {
  PLAYERS: 'morning-tasks-race-players',
  CURRENT_PLAYER: 'morning-tasks-race-current-player',
  GAME_ACTIVE: 'morning-tasks-race-active',
  WINNER: 'morning-tasks-race-winner'
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(familyMembers);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showPlayerSelection, setShowPlayerSelection] = useState(true);
  const [isGameActive, setIsGameActive] = useState(true);
  const [winner, setWinner] = useState<Player | null>(null);
  
  // Load game state from localStorage on initial mount
  useEffect(() => {
    const storedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    const storedCurrentPlayer = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER);
    const storedGameActive = localStorage.getItem(STORAGE_KEYS.GAME_ACTIVE);
    const storedWinner = localStorage.getItem(STORAGE_KEYS.WINNER);
    
    if (storedPlayers) {
      try {
        const parsedPlayers = JSON.parse(storedPlayers) as Player[];
        // Merge saved tasks with default player structure
        const syncedPlayers = syncPlayerTasks(parsedPlayers);
        setPlayers(syncedPlayers);
      } catch (err) {
        console.error('Error parsing stored players:', err);
        // Fallback to default players
        setPlayers(familyMembers);
      }
    }
    
    if (storedCurrentPlayer) {
      try {
        const playerId = JSON.parse(storedCurrentPlayer);
        const player = players.find(p => p.id === playerId);
        if (player) {
          setCurrentPlayer(player);
          setShowPlayerSelection(false);
        }
      } catch (err) {
        console.error('Error parsing current player:', err);
      }
    }
    
    if (storedGameActive) {
      setIsGameActive(JSON.parse(storedGameActive));
    }
    
    if (storedWinner) {
      setWinner(JSON.parse(storedWinner));
    }
    
    // Set up polling to sync data between browsers
    const syncInterval = setInterval(syncFromLocalStorage, 2000);
    
    return () => {
      clearInterval(syncInterval);
    };
  }, []);
  
  // Save players to localStorage whenever they change
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    }
  }, [players]);
  
  // Save current player to localStorage
  useEffect(() => {
    if (currentPlayer) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(currentPlayer.id));
    }
  }, [currentPlayer]);
  
  // Save game active state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAME_ACTIVE, JSON.stringify(isGameActive));
  }, [isGameActive]);
  
  // Save winner to localStorage
  useEffect(() => {
    if (winner) {
      localStorage.setItem(STORAGE_KEYS.WINNER, JSON.stringify(winner));
    } else {
      localStorage.removeItem(STORAGE_KEYS.WINNER);
    }
  }, [winner]);
  
  // Check for winner whenever tasks are updated
  useEffect(() => {
    if (isGameActive && players.length > 0) {
      const gameWinner = checkWinner(players);
      
      if (gameWinner) {
        // Update the player with isWinner flag
        setPlayers(players.map(player => 
          player.id === gameWinner.id ? { ...player, isWinner: true } : player
        ));
        
        setWinner(gameWinner);
        setIsGameActive(false);
        
        // Play victory fanfare sound
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
        audio.play().catch(err => console.log('Audio play failed:', err));
        
        toast(`${gameWinner.name} wins the Morning Tasks Race! 🎉`, {
          description: "All tasks completed! Great job!"
        });
      }
    }
  }, [players, isGameActive]);

  const syncFromLocalStorage = () => {
    const storedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (storedPlayers) {
      try {
        const parsedPlayers = JSON.parse(storedPlayers) as Player[];
        
        // Check if stored data is newer than current state
        let hasChanges = false;
        
        const updatedPlayers = players.map(currentPlayer => {
          const storedPlayer = parsedPlayers.find(p => p.id === currentPlayer.id);
          if (storedPlayer) {
            // Check if stored player has different task completion state
            const hasTaskChanges = JSON.stringify(storedPlayer.tasks) !== JSON.stringify(currentPlayer.tasks);
            if (hasTaskChanges) {
              hasChanges = true;
              return {
                ...currentPlayer,
                tasks: storedPlayer.tasks,
                isWinner: storedPlayer.isWinner
              };
            }
          }
          return currentPlayer;
        });
        
        if (hasChanges) {
          setPlayers(updatedPlayers);
          
          // Update current player if it's in the list
          if (currentPlayer) {
            const updatedCurrentPlayer = updatedPlayers.find(p => p.id === currentPlayer.id) || null;
            if (updatedCurrentPlayer) {
              setCurrentPlayer(updatedCurrentPlayer);
            }
          }
        }
        
        // Check for winner status changes
        const storedWinner = localStorage.getItem(STORAGE_KEYS.WINNER);
        if (storedWinner && !winner) {
          setWinner(JSON.parse(storedWinner));
          setIsGameActive(false);
        }
      } catch (err) {
        console.error('Error syncing from localStorage:', err);
      }
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

  const completeTask = (taskId: string) => {
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
    
    // Update the current player
    setCurrentPlayer(updatedPlayer);
    
    // Play sound effect for task completion
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3');
    audio.play().catch(err => console.log('Audio play failed', err));
  };

  const resetGame = () => {
    const resetPlayers = players.map(player => ({
      ...player,
      tasks: player.tasks.map(task => ({ ...task, completed: false })),
      isWinner: false
    }));
    
    setPlayers(resetPlayers);
    setWinner(null);
    setIsGameActive(true);
    setCurrentPlayer(null);
    setShowPlayerSelection(true);
    
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
