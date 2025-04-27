
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Task } from '@/lib/gameData';

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  const { completeTask, currentPlayer } = useGame();
  const [isAnimating, setIsAnimating] = useState(false);
  const [wasRecentlyCompleted, setWasRecentlyCompleted] = useState(false);
  
  // Track if this task was recently completed by someone else
  useEffect(() => {
    if (task.completed && !wasRecentlyCompleted && !isAnimating) {
      setWasRecentlyCompleted(true);
      
      // Flash effect for tasks completed by others
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }
  }, [task.completed, wasRecentlyCompleted, isAnimating]);
  
  const handleTaskComplete = () => {
    if (task.completed) return;
    
    setIsAnimating(true);
    completeTask(task.id);
    
    // Play cheerful completion sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');
    audio.play().catch(err => console.log('Audio play failed:', err));
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div 
      className={`task-item relative flex items-center p-4 mb-3 rounded-xl border-2 transition-all cursor-pointer
        ${task.completed ? 'border-green-300 bg-green-50 completed' : 'border-gray-200 hover:border-game-purple'}
        ${isAnimating ? 'transform scale-105' : ''}
        ${wasRecentlyCompleted && isAnimating ? 'animate-pulse bg-yellow-50' : ''}
      `}
      onClick={handleTaskComplete}
    >
      <div 
        className={`flex-shrink-0 w-7 h-7 mr-3 rounded-full flex items-center justify-center
          ${task.completed ? 'bg-green-500' : 'border-2 border-gray-300'}
        `}
      >
        {task.completed && <Check size={16} className="text-white" />}
      </div>
      
      <div className="flex-grow">
        <p className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {task.title}
        </p>
      </div>
      
      {task.completed && (
        <div className="absolute -right-1 -top-1 w-6 h-6 flex items-center justify-center bg-green-500 rounded-full text-white text-xs">
          ✓
        </div>
      )}
    </div>
  );
};

export default TaskItem;
