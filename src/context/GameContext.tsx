
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Avatar, Player, Task, avatars, createPlayer, checkWinner } from '@/lib/gameData';
import { toast } from '@/components/ui/sonner';

interface GameContextType {
  players: Player[];
  currentPlayer: Player | null;
  showAvatarSelection: boolean;
  isGameActive: boolean;
  winner: Player | null;
  avatars: Avatar[];
  addPlayer: (name: string, avatar: Avatar) => void;
  selectCurrentPlayer: (playerId: string) => void;
  completeTask: (taskId: string) => void;
  resetGame: () => void;
  setShowAvatarSelection: (show: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Local storage keys
const STORAGE_KEYS = {
  PLAYERS: 'morning-tasks-race-players',
  GAME_ACTIVE: 'morning-tasks-race-active',
  WINNER: 'morning-tasks-race-winner'
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  
  // Load game state from localStorage on initial mount
  useEffect(() => {
    const storedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    const storedGameActive = localStorage.getItem(STORAGE_KEYS.GAME_ACTIVE);
    const storedWinner = localStorage.getItem(STORAGE_KEYS.WINNER);
    
    if (storedPlayers) {
      const parsedPlayers = JSON.parse(storedPlayers) as Player[];
      setPlayers(parsedPlayers);
      
      // If we have players but no current player selected, show the avatar selection
      if (parsedPlayers.length > 0) {
        setShowAvatarSelection(true);
      }
    }
    
    if (storedGameActive) {
      setIsGameActive(JSON.parse(storedGameActive));
    }
    
    if (storedWinner) {
      setWinner(JSON.parse(storedWinner));
    }
  }, []);
  
  // Save players to localStorage whenever they change
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    }
  }, [players]);
  
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
        
        // Play victory fanfare sound (changed to a more cheerful sound)
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
        audio.play().catch(err => console.log('Audio play failed:', err));
        
        toast(`${gameWinner.name} wins the Morning Tasks Race! 🎉`, {
          description: "All tasks completed! Great job!"
        });
      }
    }
  }, [players, isGameActive]);

  const addPlayer = (name: string, avatar: Avatar) => {
    // Check if this player already exists
    const existingPlayer = players.find(p => p.name.toLowerCase() === name.toLowerCase());
    
    if (existingPlayer) {
      // Use existing player
      setCurrentPlayer(existingPlayer);
      setShowAvatarSelection(false);
      
      toast(`Welcome back, ${existingPlayer.name}!`, {
        description: "Continue completing your tasks!"
      });
      return;
    }
    
    // Create new player
    const newPlayer = createPlayer(name, avatar);
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    setCurrentPlayer(newPlayer);
    setShowAvatarSelection(false);
    
    // If this is the first player, start the game
    if (players.length === 0) {
      setIsGameActive(true);
    }
    
    toast(`${name} joined the game!`, {
      description: "Complete your tasks as fast as you can!"
    });
  };

  const selectCurrentPlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId) || null;
    setCurrentPlayer(player);
    setShowAvatarSelection(false);
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
    
    toast("Game Reset! Ready, Set, Go!", {
      description: "Everyone's tasks have been reset. Good luck!"
    });
  };

  const value = {
    players,
    currentPlayer,
    showAvatarSelection,
    isGameActive,
    winner,
    avatars,
    addPlayer,
    selectCurrentPlayer,
    completeTask,
    resetGame,
    setShowAvatarSelection
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
