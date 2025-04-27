
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

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  
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
        
        // Play victory sound
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
        audio.play().catch(err => console.log('Audio play failed', err));
        
        toast(`${gameWinner.name} wins the Morning Tasks Race! 🎉`, {
          description: "All tasks completed! Great job!"
        });
      }
    }
  }, [players, isGameActive]);

  const addPlayer = (name: string, avatar: Avatar) => {
    const newPlayer = createPlayer(name, avatar);
    setPlayers([...players, newPlayer]);
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
    setPlayers(players.map(player => 
      player.id === currentPlayer.id ? updatedPlayer : player
    ));
    
    // Update the current player
    setCurrentPlayer(updatedPlayer);
    
    // Play sound effect for task completion
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3');
    audio.play().catch(err => console.log('Audio play failed', err));
  };

  const resetGame = () => {
    setPlayers(players.map(player => ({
      ...player,
      tasks: player.tasks.map(task => ({ ...task, completed: false })),
      isWinner: false
    })));
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
