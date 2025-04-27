
import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { calculateProgress } from '@/lib/gameData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2 } from 'lucide-react';

const FamilyProgress = () => {
  const { players, currentPlayer, selectCurrentPlayer, syncFromLocalStorage } = useGame();
  
  // Check for updates more frequently for responsive real-time updates
  useEffect(() => {
    const checkForUpdates = () => {
      syncFromLocalStorage();
    };
    
    // Check every second for updates
    const intervalId = setInterval(checkForUpdates, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [syncFromLocalStorage]);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span>Family Progress</span>
          <Clock className="h-4 w-4 text-gray-500 animate-pulse" />
          <span className="text-xs font-normal text-gray-500">(Real-time)</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4 overflow-auto">
        {players.map((player) => {
          const progress = calculateProgress(player.tasks);
          const isCurrentPlayer = currentPlayer?.id === player.id;
          const completedTasks = player.tasks.filter(t => t.completed).length;
          const totalTasks = player.tasks.length;
          const isComplete = completedTasks === totalTasks;
          
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
                {!isCurrentPlayer && player.tasks.some(t => t.completed) && (
                  <div className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-auto">
                    Active
                  </div>
                )}
              </div>
              
              <Progress 
                value={progress} 
                className={`h-2 ${isComplete ? 'bg-green-100' : ''}`}
                color={isComplete ? 'green' : undefined}
              />
              
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>
                  {player.tasks.filter(t => t.completed).length}/{player.tasks.length} tasks
                </span>
                {isComplete && (
                  <span className="flex items-center text-green-600 font-medium">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default FamilyProgress;
