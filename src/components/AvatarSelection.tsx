
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SoundManager from '@/lib/sounds';

const AvatarSelection = () => {
  const { players, selectCurrentPlayer } = useGame();

  const handlePlayerSelect = (playerId: string) => {
    SoundManager.playSound('click');
    selectCurrentPlayer(playerId);
  };

  return (
    <Card className="w-full max-w-xl mx-auto animate-scale-up">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-game-purple">Morning Tasks Race</CardTitle>
        <div className="text-lg mt-2">Choose who you are:</div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {players.map((player) => (
            <Button
              key={player.id}
              onClick={() => handlePlayerSelect(player.id)}
              className="flex flex-col items-center p-8 h-auto"
              style={{ backgroundColor: player.avatar.backgroundColor, color: '#333' }}
            >
              <div className="text-5xl mb-4">{player.avatar.image}</div>
              <span className="text-xl font-bold">{player.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSelection;
