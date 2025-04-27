
import { useGame } from '@/context/GameContext';
import AvatarSelection from './AvatarSelection';
import TaskList from './TaskList';
import FamilyProgress from './FamilyProgress';
import WinnerCelebration from './WinnerCelebration';
import { Button } from '@/components/ui/button';

const GameContainer = () => {
  const { showAvatarSelection, players, currentPlayer, resetGame, winner, setShowAvatarSelection } = useGame();
  
  // Show avatar selection on initial load or when explicitly requested
  if (showAvatarSelection) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <AvatarSelection />
      </div>
    );
  }
  
  // If no players yet, show avatar selection
  if (players.length === 0) {
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
            onClick={() => setShowAvatarSelection(true)}
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
              <Button onClick={() => setShowAvatarSelection(true)}>
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
