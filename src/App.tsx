
import { AnimatePresence } from 'framer-motion';
import { GameProvider, useGame } from './state/GameContext';
import { TitleScreen } from './components/screens/TitleScreen';
import { LevelSelect } from './components/screens/LevelSelect';
import { GameScreen } from './components/screens/GameScreen';
import { ClickerScreen } from './components/screens/ClickerScreen';
import { GalleryScreen } from './components/screens/GalleryScreen';
import { MilestoneScreen } from './components/screens/MilestoneScreen';
import { FinalScreen } from './components/screens/FinalScreen';
import { LevelIntro } from './components/overlays/LevelIntro';
import { GameOverOverlay } from './components/overlays/GameOverOverlay';
import { PhotoReveal } from './components/overlays/PhotoReveal';

function ScreenRouter() {
  const { state } = useGame();

  return (
    <>
      <AnimatePresence mode="wait">
        {state.screen === 'title' && <TitleScreen key="title" />}
        {state.screen === 'levelSelect' && <LevelSelect key="levelSelect" />}
        {state.screen === 'levelIntro' && <LevelIntro key="levelIntro" />}
        {state.screen === 'game' && <GameScreen key="game" />}
        {state.screen === 'milestone' && <MilestoneScreen key="milestone" />}
        {state.screen === 'clicker' && <ClickerScreen key="clicker" />}
        {state.screen === 'gallery' && <GalleryScreen key="gallery" />}
        {state.screen === 'final' && <FinalScreen key="final" />}
      </AnimatePresence>

      {/* Overlays */}
      {state.screen === 'gameOver' && <GameOverOverlay />}
      {state.pendingMemory && <PhotoReveal />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <ScreenRouter />
    </GameProvider>
  );
}
