import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import AvatarSelection from './AvatarSelection';
import TaskList from './TaskList';
import FamilyProgress from './FamilyProgress';
import WinnerCelebration from './WinnerCelebration';
import { Button } from '@/components/ui/button';
import SoundManager from '@/lib/sounds';

const GameContainer = () => {
  const { showPlayerSelection, players, currentPlayer, resetGame, winner, setShowPlayerSelection, syncFromLocalStorage } = useGame();
  
  // Preload sounds and play intro music on mount
  useEffect(() => {
    SoundManager.preloadSounds();
    SoundManager.playIntroMusic();
  }, []);

  // Regular sync for multiplayer - every 5 seconds check for updates from other browsers
  useEffect(() => {
    const intervalId = setInterval(() => {
      syncFromLocalStorage();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [syncFromLocalStorage]);
  
  // Show player selection when game is completely reset or when there's a winner
  useEffect(() => {
    // Only force player selection when there's a winner or when no tasks are completed
    // AND no player is selected (meaning we're in a fresh game state)
    if ((winner || !players.some(p => p.tasks.some(t => t.completed))) && !currentPlayer) {
      setShowPlayerSelection(true);
    }
  }, [winner, players, setShowPlayerSelection, currentPlayer]);
  
  // Show player selection on initial load or when explicitly requested
  if (showPlayerSelection) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <AvatarSelection />
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-game-purple">Morning Tasks Race</h1>
        
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
