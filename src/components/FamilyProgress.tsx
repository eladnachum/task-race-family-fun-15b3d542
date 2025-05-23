
import { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { calculateProgress } from '@/lib/gameData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const FamilyProgress = () => {
  const { players, currentPlayer, selectCurrentPlayer, syncFromLocalStorage } = useGame();
  
  // Check for updates more frequently in this component
  useEffect(() => {
    const checkForUpdates = () => {
      syncFromLocalStorage();
    };
    
    // Check every second for updates in this component
    const intervalId = setInterval(checkForUpdates, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [syncFromLocalStorage]);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">
          <span>Family Progress</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4 overflow-auto">
        {players.map((player) => {
          const progress = calculateProgress(player.tasks);
          const isCurrentPlayer = currentPlayer?.id === player.id;
          
          return (
            <div 
              key={player.id}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                isCurrentPlayer ? 'bg-game-purple/10 ring-1 ring-game-purple' : 'hover:bg-gray-50'
              }`}
              onClick={() => selectCurrentPlayer(player.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: player.avatar.backgroundColor }}
                >
                  {player.avatar.image}
                </div>
                <div className="font-medium">{player.name}</div>
                {isCurrentPlayer && (
                  <div className="text-xs bg-game-purple/20 text-game-purple px-1.5 py-0.5 rounded ml-auto">
                    Current
                  </div>
                )}
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="text-right text-xs text-gray-500 mt-1">
                {player.tasks.filter(t => t.completed).length}/{player.tasks.length} tasks
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default FamilyProgress;
