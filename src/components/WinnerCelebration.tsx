import { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import SoundManager from '@/lib/sounds';

interface Confetti {
  id: number;
  x: number;
  y: number;
  color: string;
  animationDuration: string;
}

const colors = [
  '#FDE1D3', '#D3E4FD', '#FEF7CD', '#FFDEE2', 
  '#F2FCE2', '#D6BCFA', '#F97316', '#D946EF', '#33C3F0'
];

const WinnerCelebration = () => {
  const { winner, resetGame } = useGame();
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  
  useEffect(() => {
    if (!winner) return;
    
    // Play victory sound when winner is determined
    SoundManager.playSound('victory');
    
    // Create confetti pieces
    const newConfetti = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20, // Start above viewport
      color: colors[Math.floor(Math.random() * colors.length)],
      animationDuration: `${Math.random() * 3 + 2}s`
    }));
    
    setConfetti(newConfetti);
    
    // Clean up confetti after animation ends
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, [winner]);

  if (!winner) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      {/* Confetti animation */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.x}vw`,
            top: `${piece.y}vh`,
            backgroundColor: piece.color,
            animation: `confetti ${piece.animationDuration} linear forwards`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
      
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-scale-up">
        <div className="text-6xl animate-bounce mb-4">🏆</div>
        <h2 className="text-3xl font-bold mb-2">
          {winner.name} Wins!
        </h2>
        <div 
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl mb-4"
          style={{ backgroundColor: winner.avatar.backgroundColor }}
        >
          {winner.avatar.image}
        </div>
        <p className="text-xl mb-6">
          Congratulations! You finished all your morning tasks first!
        </p>
        <Button 
          onClick={resetGame} 
          className="bg-game-purple hover:bg-game-purple/90 text-xl px-8 py-6"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default WinnerCelebration;
