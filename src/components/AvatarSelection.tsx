
import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/lib/gameData';

const AvatarSelection = () => {
  const { avatars, addPlayer } = useGame();
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [playerName, setPlayerName] = useState('');

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAvatar || !playerName.trim()) return;
    
    addPlayer(playerName, selectedAvatar);
    setPlayerName('');
    setSelectedAvatar(null);
  };

  return (
    <Card className="w-full max-w-xl mx-auto animate-scale-up">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-game-purple">Morning Tasks Race</CardTitle>
        <CardDescription className="text-lg">Choose your avatar to begin!</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Your Name
            </label>
            <Input
              id="name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full text-lg p-6"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleAvatarSelect(avatar)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  selectedAvatar?.id === avatar.id 
                    ? 'ring-4 ring-game-purple scale-105' 
                    : 'hover:scale-105 hover:bg-gray-50'
                }`}
                style={{ backgroundColor: selectedAvatar?.id === avatar.id ? avatar.backgroundColor : '' }}
              >
                <div className="text-5xl mb-2">{avatar.image}</div>
                <span className="font-medium">{avatar.name}</span>
              </button>
            ))}
          </div>
          
          <Button 
            type="submit"
            disabled={!selectedAvatar || !playerName.trim()}
            className="w-full py-6 text-xl bg-game-purple hover:bg-game-purple/90"
          >
            Start Playing!
          </Button>
        </form>
      </CardContent>
      
      {players?.length > 0 && (
        <CardFooter className="flex flex-col">
          <div className="text-sm text-gray-500 mb-2">
            {players.length} player(s) already in the game
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAvatarSelection(false)}
            className="w-full"
          >
            Return to Game
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AvatarSelection;
