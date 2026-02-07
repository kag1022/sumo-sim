import { useEffect, useState } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { TitleScreen } from './components/TitleScreen';
import { MainGameScreen } from './features/game/components/MainGameScreen';
import { GameProvider, useGame } from './context/GameContext';
import { GameMode } from './types';
import { OrientationGuard } from './components/common/OrientationGuard';

/**
 * ゲームのルーティングを管理するコンポーネント
 * 初期化状態に基づいて TitleScreen / IntroScreen / MainGameScreen を切り替え
 */
const GameAppContent = () => {
  const { isInitialized, loadGameData, startGame } = useGame();
  const [showIntro, setShowIntro] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('Establish');
  const shouldAutoStart = import.meta.env.DEV && new URLSearchParams(window.location.search).has('autostart');

  useEffect(() => {
    if (shouldAutoStart && !isInitialized) {
      startGame({
        oyakataName: 'テスト親方',
        stableName: 'テスト部屋',
        shikonaPrefix: 'テ',
        shikonaPrefixReading: 'Te',
        hometown: '東京都',
        specialty: 'power',
        location: '東京都',
        mode: 'Establish'
      });
    }
  }, [shouldAutoStart, isInitialized, startGame]);

  if (!isInitialized) {
    if (showIntro) {
      return <IntroScreen onBack={() => setShowIntro(false)} initialMode={selectedMode} />;
    }
    return (
      <TitleScreen
        onNewGame={(mode) => {
          setSelectedMode(mode);
          setShowIntro(true);
        }}
        onLoadGame={(data) => loadGameData(data)}
      />
    );
  }

  return <MainGameScreen />;
};

/**
 * アプリケーションのルートコンポーネント
 * GameProvider でゲーム全体の状態を提供
 */
function App() {
  return (
    <GameProvider>
      <OrientationGuard />
      <GameAppContent />
    </GameProvider>
  );
}

export default App;
