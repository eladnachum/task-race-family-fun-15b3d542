
import { GameProvider } from '@/context/GameContext';
import GameContainer from '@/components/GameContainer';

const Index = () => {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
};

export default Index;
