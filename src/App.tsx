import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WrestlerList from './features/wrestler/components/WrestlerList';
import LogWindow from './features/match/components/LogWindow';
import BashoResultModal from './features/banzuke/components/BashoResultModal';
import YushoModal from './features/banzuke/components/YushoModal';
import ScoutPanel from './features/wrestler/components/ScoutPanel';
import { IntroScreen } from './components/IntroScreen';
import ManagementModal from './features/heya/components/ManagementModal';
import { TitleScreen } from './components/TitleScreen';
import { HistoryModal } from './features/banzuke/components/HistoryModal';
import { DanpatsuModal } from './features/wrestler/components/DanpatsuModal';
import { RetirementConsultationModal } from './components/RetirementConsultationModal';
import { HelpModal } from './components/HelpModal';
import DailyMatchList from './features/match/components/DailyMatchList';
import { EventModal } from './features/events/components/EventModal';
import Button from './components/ui/Button';
import { TrainingType, Wrestler, GameMode } from './types';
import { GameProvider, useGame } from './context/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import { formatHybridDate } from './utils/time';
import { generateFullRoster, generateHeyas } from './features/wrestler/logic/generator';
import { updateBanzuke } from './features/banzuke/logic/banzuke';
import { formatRank } from './utils/formatting';
import { MAX_PLAYERS_PER_HEYA, MAX_TP } from './utils/constants';
import { calculateSeverance } from './features/wrestler/logic/retirement';

// Dummy data generation
const generateDummyWrestlers = (): Wrestler[] => {
  return [
    {
      id: 'player-1',
      heyaId: 'player_heya',
      name: '雷電 為右衛門',
      reading: 'Raiden Tameemon',
      origin: 'Nagano',
      rank: 'Yokozuna',
      rankSide: 'East',
      rankNumber: 1,
      stats: { mind: 95, technique: 90, body: 99 },
      isSekitori: true,
      injuryStatus: 'healthy',
      history: [],
      currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
      nextBoutDay: null,

      potential: 100,
      flexibility: 100,
      weight: 160,
      height: 185,
      background: '伝説の横綱',
      // New Init
      age: 29,
      maxRank: 'Yokozuna',
      historyMaxLength: 0,
      timeInHeya: 120,
      injuryDuration: 0,
      consecutiveLoseOrAbsent: 0,
      stress: 0,
      skills: [],
      retirementStatus: 'None'
    },
    {
      id: 'player-2',
      heyaId: 'player_heya',
      name: '千代の富士',
      reading: 'Chiyonofuji',
      origin: 'Hokkaido',
      rank: 'Yokozuna',
      rankSide: 'West',
      rankNumber: 1,
      stats: { mind: 98, technique: 95, body: 90 },
      isSekitori: true,
      injuryStatus: 'healthy',
      history: [],
      currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
      nextBoutDay: null,

      potential: 90,
      flexibility: 80,
      weight: 155,
      height: 182,
      background: 'ウルフ',
      // New Init
      age: 26,
      maxRank: 'Yokozuna',
      historyMaxLength: 0,
      timeInHeya: 80,
      injuryDuration: 0,
      consecutiveLoseOrAbsent: 0,
      stress: 0,
      skills: [],
      retirementStatus: 'None'
    },
    {
      id: 'player-3',
      heyaId: 'player_heya',
      name: '貴乃花',
      reading: 'Takanohana',
      origin: 'Tokyo',
      rank: 'Ozeki',
      rankSide: 'East',
      rankNumber: 1,
      stats: { mind: 92, technique: 92, body: 92 },
      isSekitori: true,
      injuryStatus: 'healthy',
      history: [],
      currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
      nextBoutDay: null,

      potential: 85,
      flexibility: 60,
      weight: 170,
      height: 180,
      background: '平成の大横綱',
      // New Init
      age: 24,
      maxRank: 'Ozeki',
      historyMaxLength: 0,
      timeInHeya: 60,
      injuryDuration: 0,
      consecutiveLoseOrAbsent: 0,
      stress: 0,
      skills: [],
      retirementStatus: 'None'
    },
    {
      id: 'player-4',
      heyaId: 'player_heya',
      name: '若天龍',
      reading: 'Wakatenryu',
      origin: 'Osaka',
      rank: 'Makushita',
      rankSide: 'East',
      rankNumber: 5,
      stats: { mind: 60, technique: 62, body: 70 },
      isSekitori: false,
      injuryStatus: 'healthy',
      history: [],
      currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
      nextBoutDay: null,

      potential: 70,
      flexibility: 60,
      weight: 120,
      height: 175,
      background: '期待の新人',
      // New Init
      age: 18,
      maxRank: 'Makushita',
      historyMaxLength: 0,
      timeInHeya: 12,
      injuryDuration: 0,
      consecutiveLoseOrAbsent: 0,
      stress: 0,
      skills: [],
      retirementStatus: 'None'
    }
  ];
};

const GameAppContent = () => {
  const { isInitialized, loadGameData } = useGame();
  const [showIntro, setShowIntro] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('Establish');

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

  return <MainGameInterface />;
};

const MainGameInterface = () => {
  const { currentDate, funds, setFunds, wrestlers, setWrestlers, heyas, setHeyas, gamePhase, bashoFinished, lastMonthBalance, yushoWinners, setYushoWinners, okamiLevel, reputation, trainingPoints, yushoHistory, retiringQueue, consultingWrestlerId, todaysMatchups } = useGame();
  const { advanceTime, closeBashoModal, candidates, recruitWrestler, inspectCandidate, retireWrestler, completeRetirement, upgradeOkami, doSpecialTraining, handleRetirementConsultation, giveAdvice } = useGameLoop();
  const { t, i18n } = useTranslation();

  const [selectedWrestler, setSelectedWrestler] = useState<Wrestler | null>(null);
  const [showScout, setShowScout] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [trainingType, setTrainingType] = useState<TrainingType>('shiko');
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'info' | 'matches'>('info');

  // Auto-switch tabs based on phase
  useEffect(() => {
    if (gamePhase === 'tournament') {
      setSidebarTab('matches');
    } else {
      setSidebarTab('info');
    }
  }, [gamePhase]);

  // Auto-switch to Info when wrestler is selected
  useEffect(() => {
    if (selectedWrestler) {
      setSidebarTab('info');
    }
  }, [selectedWrestler]);


  // Initialize Data once
  useEffect(() => {
    if (wrestlers.length === 0) {
      // 1. Generate Heyas
      const newHeyas = generateHeyas();
      setHeyas(newHeyas);

      // 2. Get Player Wrestlers (Ensure they have a valid heyaId or create a Player Heya)
      // For now, Player Wrestlers are hardcoded with 'player_heya'.
      const playerWrestlers = generateDummyWrestlers();

      // 3. Generate CPU Roster using the new Heyas
      // We want CPUs to compete but NOT duplicate positions if possible.
      // But strict quota checks are hard if we manually insert players.
      // Simplified: Generate full CPU roster, then "Insert/Replace" players?
      // Or just append.
      // If we append 4 players to 940, total 944. Valid.

      let roster = [...playerWrestlers, ...generateFullRoster(newHeyas)]; // Pass heyas

      // 4. Normalize Ranks (Re-sort and Assign)
      // This ensures players get properly slotted into the hierarchy based on their initial ranks (seed) or logic.
      // Wait, updateBanzuke recalculates based on SCORE.
      // Initial score = Rank Base.
      // So if I set Player to 'Yokozuna', they will sort to top.
      roster = updateBanzuke(roster);

      setWrestlers(roster);
    }
  }, [wrestlers.length, setWrestlers, setHeyas]);

  const activeSelectedWrestler = selectedWrestler
    ? wrestlers.find(w => w.id === selectedWrestler.id) || selectedWrestler
    : null;

  const handleAdvance = () => {
    advanceTime(trainingType);
  };

  // Filter for Display: Only Player's Heya
  const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-slate-800 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-[#b7282e] text-white py-3 shadow-md sticky top-0 z-50 border-b border-[#a02027]">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-widest leading-none drop-shadow-sm">{t('app.title')}</h1>
            <p className="text-xs opacity-90 tracking-wide font-light">{t('app.subtitle')}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Status & Date Group */}
            <div className="flex items-center gap-4 bg-[#8c1c22] px-4 py-1.5 rounded-sm border border-[#a02027]/50 shadow-inner">
              {/* Status Badge */}
              <div className={`px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider uppercase border ${gamePhase === 'tournament' ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-blue-800 text-blue-100 border-blue-700'}`}>
                {gamePhase === 'tournament' ? t('ui.tournament') : t('ui.training')}
              </div>

              {/* Date */}
              <div className="text-center leading-tight">
                <span className="font-serif font-bold text-lg">{formatHybridDate(currentDate, gamePhase)}</span>
              </div>
            </div>

            <div className="w-px h-8 bg-white/20"></div>

            {/* Funds */}
            <div className="flex flex-col items-end min-w-[120px]">
              <div className={`text-[10px] font-bold ${lastMonthBalance && lastMonthBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {lastMonthBalance !== null && (
                  <span>(先月: {lastMonthBalance >= 0 ? '+' : ''}{lastMonthBalance.toLocaleString()})</span>
                )}
              </div>
              <div className={`text-3xl font-mono font-bold tracking-tighter leading-none ${funds < 0 ? 'text-red-300' : 'text-[#f2d07e]'} drop-shadow-sm`}>
                ¥ {funds.toLocaleString()}
              </div>
            </div>

            <div className="w-px h-8 bg-white/20"></div>

            {/* Okami & Management */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-[10px] font-mono mb-0.5 opacity-90">
                <span>{t('ui.okami')} LV:</span>
                <span className="font-bold text-amber-300 text-xs">{okamiLevel}</span>
                <span className="opacity-50">|</span>
                <span>{t('ui.reputation')}:</span>
                <span className="font-bold text-white text-xs">{reputation}</span>
                <span className="opacity-50">|</span>
                <span>TP:</span>
                <span className={`font-bold text-xs ${trainingPoints < 10 ? 'text-red-300' : 'text-amber-300'}`}>
                  {trainingPoints}/{MAX_TP}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(true)}
                  className="text-[10px] font-bold px-2 py-1 rounded-sm border border-white/30 hover:bg-white/10 transition-colors uppercase tracking-wider"
                >
                  {t('cmd.history')}
                </button>
                <button
                  onClick={() => setShowManagement(true)}
                  className="bg-[#8c1c22] hover:bg-[#7a181d] text-white text-[10px] font-bold px-3 py-1 rounded-sm shadow-sm border border-white/10 transition-colors uppercase tracking-wider"
                >
                  {t('cmd.manage')}
                </button>
              </div>
            </div>

            <div className="w-px h-8 bg-white/20"></div>

            {/* Action Group */}
            <div className="flex items-center gap-3">
              {gamePhase === 'training' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowScout(true)}
                >
                  スカウト
                </Button>
              )}

              <Button
                variant={gamePhase === 'tournament' ? 'primary' : 'action'}
                size="md"
                onClick={handleAdvance}
                className="shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span>{gamePhase === 'tournament' ? '翌日へ' : '翌週へ'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              </Button>

              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ja' : 'en')}
                  className="w-6 h-6 flex items-center justify-center rounded-sm bg-black/20 hover:bg-black/40 text-[10px] font-bold text-amber-300/80 border border-white/10 transition-colors"
                >
                  {i18n.language === 'en' ? 'EN' : 'JP'}
                </button>
                <button
                  onClick={() => setShowHelp(true)}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all"
                >
                  ?
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-1 overflow-hidden flex flex-col">
        <div className="flex flex-col md:flex-row gap-6 items-start h-full">
          {/* Left Column: Controls & List */}
          <div className="flex-1 w-full space-y-4 flex flex-col h-full overflow-hidden">

            {/* Training Control Panel */}
            <div className={`transition-all duration-500 shrink-0 ${gamePhase === 'tournament' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              <div className="bg-white p-4 rounded-sm shadow-sm border-t-4 border-[#b7282e] relative">
                <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                  {/* Decorative Icon or Pattern stub */}
                  <span className="font-serif text-4xl">稽古</span>
                </div>

                <h3 className="font-serif font-bold text-lg mb-3 flex items-center gap-2 text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-[#b7282e]"></span>
                  今週の育成方針
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <label className={`
                      group relative overflow-hidden flex flex-col px-3 py-2 rounded-sm border cursor-pointer transition-all hover:shadow-md
                      ${trainingType === 'shiko'
                      ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'}
                  `}>
                    <input type="radio" value="shiko" checked={trainingType === 'shiko'} onChange={() => setTrainingType('shiko')} className="accent-[#b7282e] absolute top-2 right-2" />
                    <div className="font-serif font-bold text-slate-800 mb-1">基礎固め週</div>
                    <div className="text-xs text-slate-500">体+ (リスク:極低)</div>
                    {trainingType === 'shiko' && <div className="absolute inset-0 border-2 border-amber-400 pointer-events-none rounded-sm"></div>}
                  </label>

                  <label className={`
                      group relative overflow-hidden flex flex-col px-3 py-2 rounded-sm border cursor-pointer transition-all hover:shadow-md
                       ${trainingType === 'teppo'
                      ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'}
                  `}>
                    <input type="radio" value="teppo" checked={trainingType === 'teppo'} onChange={() => setTrainingType('teppo')} className="accent-[#b7282e] absolute top-2 right-2" />
                    <div className="font-serif font-bold text-slate-800 mb-1">鉄砲特訓週</div>
                    <div className="text-xs text-slate-500">技+ (リスク:極低)</div>
                    {trainingType === 'teppo' && <div className="absolute inset-0 border-2 border-amber-400 pointer-events-none rounded-sm"></div>}
                  </label>

                  <label className={`
                      group relative overflow-hidden flex flex-col px-3 py-2 rounded-sm border cursor-pointer transition-all hover:shadow-md
                       ${trainingType === 'moushi_ai'
                      ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'}
                  `}>
                    <input type="radio" value="moushi_ai" checked={trainingType === 'moushi_ai'} onChange={() => setTrainingType('moushi_ai')} className="accent-[#b7282e] absolute top-2 right-2" />
                    <div className="font-serif font-bold text-slate-800 mb-1">強化合宿</div>
                    <div className="text-xs text-slate-500">全++ (リスク:5%)</div>
                    {trainingType === 'moushi_ai' && <div className="absolute inset-0 border-2 border-amber-400 pointer-events-none rounded-sm"></div>}
                  </label>

                  <label className={`
                      group relative overflow-hidden flex flex-col px-3 py-2 rounded-sm border cursor-pointer transition-all hover:shadow-md
                       ${trainingType === 'rest'
                      ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'}
                  `}>
                    <input type="radio" value="rest" checked={trainingType === 'rest'} onChange={() => setTrainingType('rest')} className="accent-blue-500 absolute top-2 right-2" />
                    <div className="font-serif font-bold text-slate-800 mb-1">積極的休養</div>
                    <div className="text-xs text-slate-500">怪我回復</div>
                    {trainingType === 'rest' && <div className="absolute inset-0 border-2 border-blue-400 pointer-events-none rounded-sm"></div>}
                  </label>
                </div>
              </div>
            </div>

            {/* List - SHOW PLAYER WRESTLERS ONLY */}
            <div className="flex flex-col flex-1 overflow-hidden bg-white rounded-sm shadow-sm border border-slate-200">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold font-serif text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#b7282e]"></span>
                  所属力士一覧
                </h2>
                <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                  {playerWrestlers.length} / {MAX_PLAYERS_PER_HEYA}
                </span>
              </div>

              <div className="flex-1 overflow-hidden p-2">
                <WrestlerList wrestlers={playerWrestlers} onSelect={setSelectedWrestler} />
              </div>
            </div>
          </div>

          {/* Info Panel (Sidebar) */}
          <div className="w-full md:w-80 shrink-0 flex flex-col h-[calc(100vh-100px)]">
            {/* Tabs (Tournament Only) */}
            {gamePhase === 'tournament' && (
              <div className="flex gap-1 shrink-0 mb-0 translate-y-[1px] z-10 px-1">
                <button
                  onClick={() => setSidebarTab('matches')}
                  className={`flex-1 py-2 text-xs font-bold rounded-t-sm transition-all border-t border-x ${sidebarTab === 'matches' ? 'bg-white border-slate-200 border-b-white text-[#b7282e] shadow-sm -mb-px' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'}`}
                >
                  本日の取組
                </button>
                <button
                  onClick={() => setSidebarTab('info')}
                  className={`flex-1 py-2 text-xs font-bold rounded-t-sm transition-all border-t border-x ${sidebarTab === 'info' ? 'bg-white border-slate-200 border-b-white text-[#b7282e] shadow-sm -mb-px' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'}`}
                >
                  力士情報
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className={`flex-1 overflow-hidden flex flex-col min-h-0 bg-white shadow-md border border-slate-200 ${gamePhase === 'tournament' ? 'rounded-b-sm rounded-tr-sm' : 'rounded-sm border-t-4 border-t-[#b7282e] sticky top-24'}`}>

              {/* Matches View */}
              {sidebarTab === 'matches' && gamePhase === 'tournament' && (
                <div className="flex-1 min-h-0 overflow-hidden">
                  <DailyMatchList
                    matchups={todaysMatchups}
                    onAdvice={giveAdvice}
                    currentTp={trainingPoints}
                  />
                </div>
              )}

              {/* Info View */}
              {(sidebarTab === 'info' || gamePhase !== 'tournament') && (
                <div className="h-full overflow-y-auto p-5 scrollbar-thin">
                  {/* Header of Info Panel */}
                  {gamePhase !== 'tournament' && (
                    <div className="mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-serif font-bold text-slate-800">力士詳細</h3>
                      {activeSelectedWrestler && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">ID: {activeSelectedWrestler.id.slice(0, 4)}</span>}
                    </div>
                  )}

                  {activeSelectedWrestler ? (
                    <div className="space-y-5">
                      <div className="text-center relative">
                        <div className="inline-block bg-[#2c1a1b] text-[#f2d07e] px-3 py-0.5 text-xs font-bold rounded-sm shadow-sm mb-2 font-serif">
                          {formatRank(activeSelectedWrestler.rank, activeSelectedWrestler.rankSide, activeSelectedWrestler.rankNumber)}
                        </div>
                        <div className="text-3xl font-bold font-serif text-slate-900 border-b-2 border-[#b7282e] inline-block px-4 pb-1 mb-2">
                          {activeSelectedWrestler.name}
                        </div>

                        {activeSelectedWrestler.injuryStatus === 'injured' && (
                          <div className="mt-2 inline-block bg-red-50 text-red-600 px-3 py-1 text-xs font-bold rounded-sm border border-red-200 animate-pulse">
                            ⚠️ 怪我療養中
                          </div>
                        )}
                        {/* Current Basho Stats (if active) */}
                        {gamePhase === 'tournament' && (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                            <div className="bg-red-50 p-2 rounded-sm border border-red-100">
                              <div className="text-xl font-mono font-bold text-red-700">{activeSelectedWrestler.currentBashoStats.wins}</div>
                              <div className="text-[10px] text-red-400 font-bold">勝</div>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-sm border border-slate-100">
                              <div className="text-xl font-mono font-bold text-slate-700">{activeSelectedWrestler.currentBashoStats.losses}</div>
                              <div className="text-[10px] text-slate-400 font-bold">敗</div>
                            </div>
                          </div>
                        )}

                        {/* Age and Tenure Info */}
                        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-bold">
                          <div className={`px-2 py-1 rounded bg-slate-50 ${activeSelectedWrestler.age >= 35 ? 'text-red-600' : 'text-slate-600'}`}>
                            {activeSelectedWrestler.age}歳
                          </div>
                          <div className="px-2 py-1 rounded bg-slate-50 text-slate-500">
                            在籍 {Math.floor((activeSelectedWrestler.timeInHeya || 0) / 12)}年
                          </div>
                          <div className="px-2 py-1 rounded bg-slate-50 text-slate-600">
                            {activeSelectedWrestler.height}cm
                          </div>
                          <div className="px-2 py-1 rounded bg-slate-50 text-slate-600">
                            {activeSelectedWrestler.weight}kg
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 bg-slate-50 p-3 rounded-sm border border-slate-100">
                        <div className="flex justify-between text-sm items-center">
                          <span className="font-serif font-bold text-slate-600 w-8">心</span>
                          <div className="flex-1 mx-2 bg-white rounded-full h-2 overflow-hidden border border-slate-100">
                            <div className="bg-[#b7282e] h-full" style={{ width: `${activeSelectedWrestler.stats.mind}%` }}></div>
                          </div>
                          <span className="font-mono text-slate-700 w-6 text-right">{Math.floor(activeSelectedWrestler.stats.mind)}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                          <span className="font-serif font-bold text-slate-600 w-8">技</span>
                          <div className="flex-1 mx-2 bg-white rounded-full h-2 overflow-hidden border border-slate-100">
                            <div className="bg-amber-500 h-full" style={{ width: `${activeSelectedWrestler.stats.technique}%` }}></div>
                          </div>
                          <span className="font-mono text-slate-700 w-6 text-right">{Math.floor(activeSelectedWrestler.stats.technique)}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                          <span className="font-serif font-bold text-slate-600 w-8">体</span>
                          <div className="flex-1 mx-2 bg-white rounded-full h-2 overflow-hidden border border-slate-100">
                            <div className="bg-slate-600 h-full" style={{ width: `${activeSelectedWrestler.stats.body}%` }}></div>
                          </div>
                          <span className="font-mono text-slate-700 w-6 text-right">{Math.floor(activeSelectedWrestler.stats.body)}</span>
                        </div>
                        {/* Divider */}
                        <div className="h-px bg-slate-200 my-2"></div>
                        <div className="flex justify-between text-sm items-center">
                          <span className="font-serif font-bold text-slate-500 w-8 text-xs">疲労</span>
                          <div className="flex-1 mx-2 bg-white rounded-full h-2 overflow-hidden border border-slate-100">
                            <div className={`h-full ${activeSelectedWrestler.stress > 80 ? 'bg-red-500' : 'bg-blue-400'}`} style={{ width: `${activeSelectedWrestler.stress || 0}%` }}></div>
                          </div>
                          <span className="font-mono text-slate-500 w-6 text-right">{Math.floor(activeSelectedWrestler.stress || 0)}</span>
                        </div>
                      </div>

                      {/* Retire Button (Only for Player Wrestlers) */}
                      {selectedWrestler && selectedWrestler.heyaId === 'player_heya' && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          {/* Special Training Section */}
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-slate-800 text-sm font-serif">特別指導</h4>
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">残り {trainingPoints}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => doSpecialTraining(selectedWrestler.id, 'shiko')}
                                disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured'}
                                className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold py-2 px-1 rounded-sm disabled:opacity-50 transition-colors"
                              >
                                四股 (体++)
                              </button>
                              <button
                                onClick={() => doSpecialTraining(selectedWrestler.id, 'teppo')}
                                disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured'}
                                className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold py-2 px-1 rounded-sm disabled:opacity-50 transition-colors"
                              >
                                鉄砲 (技+ 体+)
                              </button>
                              <button
                                onClick={() => doSpecialTraining(selectedWrestler.id, 'moushi_ai')}
                                disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured'}
                                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 text-xs font-bold py-2 px-1 rounded-sm disabled:opacity-50 transition-colors"
                              >
                                申し合い (技++ 心+)
                              </button>
                              <button
                                onClick={() => doSpecialTraining(selectedWrestler.id, 'meditation')}
                                disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured'}
                                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold py-2 px-1 rounded-sm disabled:opacity-50 transition-colors"
                              >
                                瞑想 (心++ 休)
                              </button>
                            </div>
                          </div>

                          <div className="bg-stone-50 p-3 rounded-sm border border-stone-200">
                            <h4 className="font-bold text-stone-700 mb-1 text-xs">引退処理</h4>
                            <p className="text-[10px] text-stone-500 mb-3 leading-tight">
                              引退させるとご祝儀を受け取り、力士は部屋を去ります。
                            </p>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              onClick={() => {
                                if (!selectedWrestler) return;
                                const severance = calculateSeverance(selectedWrestler);
                                if (window.confirm(`${selectedWrestler.name}を引退させますか？\n\n予想されるご祝儀: ¥${severance.toLocaleString()}`)) {
                                  retireWrestler(selectedWrestler.id);
                                  setSelectedWrestler(null);
                                }
                              }}
                            >
                              引退勧告を行う
                            </Button>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <span className="text-4xl mb-2 opacity-50">⚖️</span>
                      <p className="text-sm">リストから力士を選択</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main >

      {/* Log Window Area */}
      < LogWindow />

      {/* Modals */}
      {showManagement && (
        <ManagementModal
          okamiLevel={okamiLevel}
          funds={funds}
          lastMonthBalance={lastMonthBalance}
          currentHeyaLevel={heyas.find(h => h.id === 'player_heya')?.facilityLevel || 1}
          onUpgradeOkami={() => {
            upgradeOkami();
          }}
          onUpgradeFacility={(level, cost, mod) => {
            if (funds < cost) {
              alert("資金が不足しています");
              return;
            }
            setFunds(prev => prev - cost);
            setHeyas(prev => prev.map(h =>
              h.id === 'player_heya'
                ? { ...h, facilityLevel: level, strengthMod: mod }
                : h
            ));
          }}
          onClose={() => setShowManagement(false)}
        />
      )}

      {showHistory && (
        <HistoryModal
          history={yushoHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {
        bashoFinished && (
          <BashoResultModal
            wrestlers={wrestlers}
            onClose={closeBashoModal}
          />
        )
      }
      {
        yushoWinners && bashoFinished === false && (
          <YushoModal
            winners={yushoWinners}
            onClose={() => setYushoWinners(null)}
          />
        )
      }

      {/* Retirement Ceremony Overlay */}
      {retiringQueue.length > 0 && (
        <DanpatsuModal
          wrestler={retiringQueue[0]}
          onSnip={() => {
            if (retiringQueue.length > 0) {
              completeRetirement(retiringQueue[0].id);
            }
          }}
        />
      )}

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Retirement Consultation Modal */}
      {consultingWrestlerId && (() => {
        const consultingWrestler = wrestlers.find(w => w.id === consultingWrestlerId);
        return consultingWrestler ? (
          <RetirementConsultationModal
            wrestler={consultingWrestler}
            onAccept={() => handleRetirementConsultation(consultingWrestlerId, 'accept')}
            onPersuade={() => handleRetirementConsultation(consultingWrestlerId, 'persuade')}
          />
        ) : null;
      })()}

      <EventModal />

      {
        showScout && (
          <ScoutPanel
            candidates={candidates}
            funds={funds}
            currentCount={playerWrestlers.length}
            limit={MAX_PLAYERS_PER_HEYA}
            onRecruit={(c, name) => {
              recruitWrestler(c, name);
              setShowScout(false);
            }}
            onInspect={inspectCandidate}
            onClose={() => setShowScout(false)}
          />
        )
      }
    </div >
  );
};

function App() {
  return (
    <GameProvider>
      <GameAppContent />
    </GameProvider>
  );
}

export default App;
