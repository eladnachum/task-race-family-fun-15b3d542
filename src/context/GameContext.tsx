
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Avatar, Player, Task, avatars, familyMembers, syncPlayerTasks, checkWinner } from '@/lib/gameData';
import { toast } from '@/components/ui/sonner';
import SoundManager from '@/lib/sounds';

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
  const [players, setPlayers] = useState<Player[]>([...familyMembers]); // Create a fresh copy
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
        setPlayers([...familyMembers]);
      }
    }
    
    // Load current player after players are set
    if (storedCurrentPlayer) {
      try {
        const playerId = JSON.parse(storedCurrentPlayer);
        // We need to defer this to ensure players are loaded first
        setTimeout(() => {
          const player = players.find(p => p.id === playerId);
          if (player) {
            setCurrentPlayer({...player}); // Use deep copy to avoid reference issues
            setShowPlayerSelection(false);
          }
        }, 0);
      } catch (err) {
        console.error('Error parsing current player:', err);
      }
    }
    
    if (storedGameActive) {
      setIsGameActive(JSON.parse(storedGameActive));
    }
    
    if (storedWinner) {
      try {
        setWinner(JSON.parse(storedWinner));
      } catch (err) {
        console.error('Error parsing winner:', err);
        setWinner(null);
      }
    }
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
        SoundManager.playSound('victory');
        
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
                tasks: storedPlayer.tasks.map(task => ({...task})), // Deep clone tasks
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
              setCurrentPlayer({...updatedCurrentPlayer}); // Deep copy
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
    // Find player by ID and create a deep copy to avoid reference issues
    const selectedPlayer = players.find(p => p.id === playerId);
    
    if (selectedPlayer) {
      // Create a fresh copy to avoid reference issues
      const playerCopy = {
        ...selectedPlayer,
        tasks: selectedPlayer.tasks.map(task => ({...task}))
      };
      
      setCurrentPlayer(playerCopy);
      setShowPlayerSelection(false);
      
      toast(`Selected ${playerCopy.name}`, {
        description: "Complete your tasks as fast as you can!"
      });
      
      // Play click sound
      SoundManager.playSound('click');
    } else {
      console.error(`Player with ID ${playerId} not found`);
    }
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
    SoundManager.playSound('taskComplete');
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
