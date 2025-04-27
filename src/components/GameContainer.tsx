
import React, { useEffect } from 'react';  // Explicitly import React and useEffect
import { useGame } from '@/context/GameContext';
import AvatarSelection from './AvatarSelection';
import TaskList from './TaskList';
import FamilyProgress from './FamilyProgress';
import WinnerCelebration from './WinnerCelebration';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const GameContainer = () => {
  const { showPlayerSelection, players, currentPlayer, resetGame, winner, setShowPlayerSelection, syncFromLocalStorage } = useGame();
  
  // More frequent sync for real-time updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      syncFromLocalStorage();
    }, 2000); // Check every 2 seconds instead of 5
    
    return () => clearInterval(intervalId);
  }, [syncFromLocalStorage]);
  
  // Show player selection on initial load or when explicitly requested
  if (showPlayerSelection) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <AvatarSelection />
      </div>
    );
  }
  
  // Show loading if players aren't loaded yet
  if (players.length === 0) {
    return (
      <div className="container h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-game-purple" />
          <p className="text-xl">Connecting to game session...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-game-purple">Morning Tasks Race</h1>
          <p className="text-sm text-gray-500">
            {currentPlayer ? `Playing as ${currentPlayer.name}` : 'Select a player to start'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowPlayerSelection(true)}
            className="border-game-purple text-game-purple hover:bg-game-purple/5"
          >
            Switch Player
          </Button>
          
          <Button
            variant="outline"
            onClick={resetGame}
            className="border-game-orange text-game-orange hover:bg-game-orange/5"
          >
            Reset Game
          </Button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[calc(100vh-150px)]">
        <div className="md:col-span-3">
          {currentPlayer ? (
            <TaskList />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Button onClick={() => setShowPlayerSelection(true)}>
                Select a Player
              </Button>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <FamilyProgress />
        </div>
      </div>
      
      {winner && <WinnerCelebration />}
    </div>
  );
};

export default GameContainer;
