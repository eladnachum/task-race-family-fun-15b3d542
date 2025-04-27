
import { useGame } from '@/context/GameContext';
import { calculateProgress } from '@/lib/gameData';
import TaskItem from './TaskItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const TaskList = () => {
  const { currentPlayer } = useGame();
  
  if (!currentPlayer) {
    return null;
  }

  const progress = calculateProgress(currentPlayer.tasks);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-game-purple/5 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: currentPlayer.avatar.backgroundColor }}
          >
            {currentPlayer.avatar.image}
          </div>
          <div>
            <CardTitle className="text-xl">{currentPlayer.name}'s Tasks</CardTitle>
            <div className="text-sm text-gray-500">
              {currentPlayer.tasks.filter(t => t.completed).length} of {currentPlayer.tasks.length} completed
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Progress value={progress} className="h-3" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto py-6">
        <div className="space-y-2">
          {currentPlayer.tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
