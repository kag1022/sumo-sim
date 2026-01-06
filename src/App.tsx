import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WrestlerList from './components/WrestlerList';
import LogWindow from './components/LogWindow';
import BashoResultModal from './components/BashoResultModal';
import YushoModal from './components/YushoModal';
import ScoutPanel from './components/ScoutPanel';
import { IntroScreen } from './components/IntroScreen';
import ManagementModal from './components/ManagementModal';
import { TitleScreen } from './components/TitleScreen'; // New Import
import { HistoryModal } from './components/HistoryModal'; // New Import
import { DanpatsuModal } from './components/DanpatsuModal';
import { HelpModal } from './components/HelpModal';
import { TrainingType, Wrestler } from './types';
import { GameProvider, useGame } from './context/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import { formatHybridDate } from './utils/time';
import { generateFullRoster, generateHeyas } from './utils/dummyGenerator';
import { updateBanzuke } from './utils/banzuke';
import { formatRank } from './utils/formatting';
import { MAX_PLAYERS_PER_HEYA } from './utils/constants';
import { calculateSeverance } from './utils/retirement';

// Dummy data generation
const generateDummyWrestlers = (): Wrestler[] => {
  return [
    {
      id: 'player-1',
      heyaId: 'player_heya',
      name: '雷電 為右衛門',
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
      stress: 0
    },
    {
      id: 'player-2',
      heyaId: 'player_heya',
      name: '千代の富士',
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
      stress: 0
    },
    {
      id: 'player-3',
      heyaId: 'player_heya',
      name: '貴乃花',
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
      stress: 0
    },
    {
      id: 'player-4',
      heyaId: 'player_heya',
      name: '若天龍',
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
      flexibility: 40,
      weight: 140,
      height: 175,
      background: '期待の若手',
      // New Init
      age: 20,
      maxRank: 'Makushita',
      historyMaxLength: 0,
      timeInHeya: 24,
      injuryDuration: 0,
      consecutiveLoseOrAbsent: 0,
      stress: 0
    }
  ];
};

// GameScreen was refactored into MainGameInterface and GameAppContent layout.
// Removed to avoid confusion and unused vars.



const GameAppContent = () => {
  const { isInitialized, loadGameData } = useGame();
  const [showIntro, setShowIntro] = useState(false);

  if (!isInitialized) {
    if (showIntro) {
      return <IntroScreen onBack={() => setShowIntro(false)} />;
    }
    return (
      <TitleScreen
        onNewGame={() => setShowIntro(true)}
        onLoadGame={(data) => loadGameData(data)}
      />
    );
  }

  return <MainGameInterface />;
};

const MainGameInterface = () => {
  const { currentDate, funds, setFunds, wrestlers, setWrestlers, heyas, setHeyas, gameMode, bashoFinished, lastMonthBalance, yushoWinners, setYushoWinners, okamiLevel, reputation, trainingPoints, yushoHistory, retiringQueue } = useGame();
  const { advanceTime, closeBashoModal, candidates, recruitWrestler, inspectCandidate, retireWrestler, completeRetirement, upgradeOkami, doSpecialTraining } = useGameLoop();
  const { t, i18n } = useTranslation();

  const [selectedWrestler, setSelectedWrestler] = useState<Wrestler | null>(null);
  const [showScout, setShowScout] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [trainingType, setTrainingType] = useState<TrainingType>('shiko');
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // ... rest of the main game UI ...
  // Note: I will need to replace the massive block of UI code carefully or structure it.
  // For this 'replace_file_content', I will focus on injecting the 'showHistory' state and the new Menu items.

  // ...


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
      <header className="bg-[#b7282e] text-white py-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-widest leading-none">{t('app.title')}</h1>
            <p className="text-xs opacity-80 tracking-wide">{t('app.subtitle')}</p>
          </div>

          <div className="flex items-center gap-6 bg-white/10 px-6 py-2 rounded-sm backdrop-blur-sm border border-white/20">
            {/* Lang Toggle */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ja' : 'en')}
              className="px-2 py-1 bg-black/20 hover:bg-black/40 rounded text-[10px] font-bold border border-white/20 text-amber-300"
            >
              {i18n.language === 'en' ? 'EN' : 'JP'}
            </button>

            {/* Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-all border border-white/10"
              title={t('cmd.help')}
            >
              ?
            </button>

            {/* Status Badge */}
            <div className={`px-2 py-1 rounded text-xs font-bold ${gameMode === 'tournament' ? 'bg-amber-400 text-amber-950' : 'bg-blue-800 text-blue-200'}`}>
              {gameMode === 'tournament' ? t('ui.tournament') : t('ui.training')}
            </div>

            {/* Date */}
            <div className="text-center">
              <span className="block text-[10px] opacity-70">{t('ui.date')}</span>
              <span className="font-serif font-bold text-lg">{formatHybridDate(currentDate, gameMode)}</span>
            </div>

            <div className="w-px h-8 bg-white/30"></div>

            {/* Funds */}
            <div className="flex flex-col items-end min-w-[120px]">
              {lastMonthBalance !== null && (
                <div className={`text-xs font-bold mb-1 ${lastMonthBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  (先月: {lastMonthBalance >= 0 ? '+' : ''}{lastMonthBalance.toLocaleString()})
                </div>
              )}
              <div className={`text-4xl font-mono font-bold tracking-tighter ${funds < 0 ? 'text-red-400' : 'text-[#f2d07e]'}`}>
                ¥ {funds.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                {t('ui.funds')}
              </div>
            </div>

            <div className="w-px h-8 bg-white/30"></div>

            {/* Okami & Management Button */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-xs font-mono mb-1">
                <span className="opacity-70">{t('ui.okami')} LV:</span>
                <span className="font-bold text-amber-300">{okamiLevel}</span>
                <span className="opacity-50">|</span>
                <span className="opacity-70">{t('ui.reputation')}:</span>
                <span className="font-bold text-white">{reputation}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(true)}
                  className="bg-stone-700 hover:bg-stone-600 text-white text-[10px] font-bold px-3 py-1 rounded border border-white/20 transition-colors uppercase tracking-wider"
                >
                  {t('cmd.history')}
                </button>
                <button
                  onClick={() => setShowManagement(true)}
                  className="bg-[#8c1c22] hover:bg-[#a02027] text-white text-[10px] font-bold px-3 py-1 rounded border border-white/20 transition-colors uppercase tracking-wider"
                >
                  {t('cmd.manage')}
                </button>
              </div>
            </div>

            <div className="w-px h-8 bg-white/30"></div>


            {/* Action */}
            <div className="flex flex-col items-center gap-2">
              {gameMode === 'training' && (
                <button
                  onClick={() => setShowScout(true)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1 rounded text-xs font-bold border border-slate-500 transition-all active:scale-95"
                >
                  スカウト
                </button>
              )}

              <button
                onClick={handleAdvance}
                className={`
                                    px-6 py-2 rounded shadow-md font-bold transition-all active:scale-95 flex items-center gap-2
                                    ${gameMode === 'tournament'
                    ? 'bg-red-600 hover:bg-red-500 text-white border border-red-400'
                    : 'bg-amber-400 hover:bg-amber-300 text-amber-950'}
                                `}
              >
                <span>{gameMode === 'tournament' ? '翌日へ' : '翌週へ'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Removed Sub Header (Okami & Rep moved to top right) */}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1 overflow-hidden flex flex-col">
        <div className="flex flex-col md:flex-row gap-8 items-start h-full">
          {/* Left Column: Controls & List */}
          <div className="flex-1 w-full space-y-4 flex flex-col h-full overflow-hidden">

            {/* Training Control Panel */}
            <div className={`transition-opacity duration-500 shrink-0 ${gameMode === 'tournament' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              <div className="bg-white p-4 rounded shadow-sm border border-slate-200">
                <h3 className="font-serif font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#b7282e]"></span>
                  今週の育成方針
                </h3>
                <div className="flex flex-wrap gap-4">
                  <label className={`
                                        flex items-center gap-2 px-4 py-3 rounded border cursor-pointer transition-colors flex-1
                                        ${trainingType === 'shiko' ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}
                                    `}>
                    <input type="radio" value="shiko" checked={trainingType === 'shiko'} onChange={() => setTrainingType('shiko')} className="accent-[#b7282e]" />
                    <div>
                      <div className="font-bold">基礎固め週</div>
                      <div className="text-xs opacity-70">体+ (リスク:極低)</div>
                    </div>
                  </label>
                  <label className={`
                                        flex items-center gap-2 px-4 py-3 rounded border cursor-pointer transition-colors flex-1
                                        ${trainingType === 'teppo' ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}
                                    `}>
                    <input type="radio" value="teppo" checked={trainingType === 'teppo'} onChange={() => setTrainingType('teppo')} className="accent-[#b7282e]" />
                    <div>
                      <div className="font-bold">鉄砲特訓週</div>
                      <div className="text-xs opacity-70">技+ (リスク:極低)</div>
                    </div>
                  </label>
                  <label className={`
                                        flex items-center gap-2 px-4 py-3 rounded border cursor-pointer transition-colors flex-1
                                        ${trainingType === 'moushi_ai' ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}
                                    `}>
                    <input type="radio" value="moushi_ai" checked={trainingType === 'moushi_ai'} onChange={() => setTrainingType('moushi_ai')} className="accent-[#b7282e]" />
                    <div>
                      <div className="font-bold">強化合宿</div>
                      <div className="text-xs opacity-70">全++ (リスク:５％)</div>
                    </div>
                  </label>
                  <label className={`
                                        flex items-center gap-2 px-4 py-3 rounded border cursor-pointer transition-colors flex-1
                                        ${trainingType === 'rest' ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}
                                    `}>
                    <input type="radio" value="rest" checked={trainingType === 'rest'} onChange={() => setTrainingType('rest')} className="accent-blue-600" />
                    <div>
                      <div className="font-bold">積極的休養</div>
                      <div className="text-xs opacity-70">怪我回復</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* List - SHOW PLAYER WRESTLERS ONLY */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="mb-2 flex justify-between items-end border-b border-slate-300 pb-2">
                <h2 className="text-2xl font-bold font-serif border-l-4 border-[#b7282e] pl-3">
                  所属力士一覧
                </h2>
                <span className="text-sm text-slate-500">
                  {playerWrestlers.length} 名 (全体: {wrestlers.length}名)
                </span>
              </div>
              <WrestlerList wrestlers={playerWrestlers} onSelect={setSelectedWrestler} />
            </div>
          </div>

          {/* Info Panel (Sidebar) */}
          <div className="w-full md:w-80 shrink-0 space-y-6">
            {/* Selected Wrestler Info */}
            <div className="bg-white p-6 shadow-xl border-t-4 border-[#b7282e] rounded-b-sm sticky top-24">
              <h3 className="text-lg font-bold mb-4 border-b pb-2">選択中の力士</h3>
              {activeSelectedWrestler ? (
                <div className="space-y-4">
                  <div className="text-center relative">
                    <div className="text-xs text-slate-500 mb-1 font-bold">
                      {formatRank(activeSelectedWrestler.rank, activeSelectedWrestler.rankSide, activeSelectedWrestler.rankNumber)}
                    </div>
                    <div className="text-2xl font-bold font-serif">{activeSelectedWrestler.name}</div>
                    {activeSelectedWrestler.injuryStatus === 'injured' && (
                      <div className="mt-2 inline-block bg-red-100 text-red-600 px-2 py-1 text-xs font-bold rounded">
                        怪我のため療養中
                      </div>
                    )}
                    {/* Current Basho Stats (if active) */}
                    {gameMode === 'tournament' && (
                      <div className="mt-4 p-2 bg-slate-100 rounded font-mono text-xl font-bold text-center">
                        {activeSelectedWrestler.currentBashoStats.wins} 勝 {activeSelectedWrestler.currentBashoStats.losses} 敗
                      </div>
                    )}

                    {/* Age and Tenure Info */}
                    <div className="mt-3 flex justify-center gap-4 text-sm font-bold border-t border-slate-100 pt-2">
                      <div className={`${activeSelectedWrestler.age >= 35 ? 'text-red-500' :
                        activeSelectedWrestler.age >= 30 ? 'text-amber-600' :
                          'text-slate-600'
                        }`}>
                        {activeSelectedWrestler.age}歳
                      </div>
                      <div className="text-slate-500">
                        在籍 {Math.floor((activeSelectedWrestler.timeInHeya || 0) / 12)}年
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>心</span>
                      <div className="w-32 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-[#b7282e] h-full transition-all duration-500" style={{ width: `${activeSelectedWrestler.stats.mind}%` }}></div>
                      </div>
                      <span className="font-mono">{Math.floor(activeSelectedWrestler.stats.mind)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>技</span>
                      <div className="w-32 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-amber-600 h-full transition-all duration-500" style={{ width: `${activeSelectedWrestler.stats.technique}%` }}></div>
                      </div>
                      <span className="font-mono">{Math.floor(activeSelectedWrestler.stats.technique)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>体</span>
                      <div className="w-32 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-slate-700 h-full transition-all duration-500" style={{ width: `${activeSelectedWrestler.stats.body}%` }}></div>
                      </div>
                      <span className="font-mono">{Math.floor(activeSelectedWrestler.stats.body)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>疲労</span>
                      <div className="w-32 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${activeSelectedWrestler.stress || 0}%` }}></div>
                      </div>
                      <span className="font-mono">{Math.floor(activeSelectedWrestler.stress || 0)}</span>
                    </div>
                  </div>
                  {/* Retire Button (Only for Player Wrestlers) */}
                  {selectedWrestler && selectedWrestler.heyaId === 'player_heya' && (
                    <div className="mt-8 pt-8 border-t border-slate-200">
                      {/* Special Training Section */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-slate-900">特別指導 (残り: {trainingPoints})</h4>
                          <span className="text-xs text-slate-500">週に3回まで</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => doSpecialTraining(selectedWrestler.id, 'shiko')}
                            disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured'}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-2 px-1 rounded disabled:opacity-50 transition-colors"
                          >
                            四股 (体++)
                          </button>
                          <button
                            onClick={() => doSpecialTraining(selectedWrestler.id, 'teppo')}
                            disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured'}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-2 px-1 rounded disabled:opacity-50 transition-colors"
                          >
                            鉄砲 (技+ 体+)
                          </button>
                          <button
                            onClick={() => doSpecialTraining(selectedWrestler.id, 'moushi_ai')}
                            disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured'}
                            className="bg-red-100 hover:bg-red-200 text-red-900 text-xs font-bold py-2 px-1 rounded disabled:opacity-50 transition-colors"
                          >
                            申し合い (技++ 心+)
                          </button>
                          <button
                            onClick={() => doSpecialTraining(selectedWrestler.id, 'meditation')}
                            disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured'}
                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 text-xs font-bold py-2 px-1 rounded disabled:opacity-50 transition-colors"
                          >
                            瞑想 (心++ 休)
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 mb-2">引退処理</h4>
                      <p className="text-xs text-slate-500 mb-4">
                        引退させると、最高位と在籍期間に応じた「ご祝儀」を受け取り、力士は部屋を去ります。
                        この操作は取り消せません。
                      </p>
                      <button
                        onClick={() => {
                          if (!selectedWrestler) return; // Should not happen if button is visible
                          const severance = calculateSeverance(selectedWrestler);
                          if (window.confirm(`${selectedWrestler.name}を引退させますか？\n\n予想されるご祝儀: ¥${severance.toLocaleString()}`)) {
                            retireWrestler(selectedWrestler.id);
                            setSelectedWrestler(null);
                          }
                        }}
                        className="w-full bg-stone-200 hover:bg-stone-300 text-stone-600 px-4 py-2 rounded text-sm font-bold transition-colors"
                      >
                        引退勧告を行う
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">
                  リストから力士を選択してください
                </p>
              )}
            </div>
          </div>
          {/* Removed Okami Management Panel from here */}
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
          onSnip={() => completeRetirement(retiringQueue[0])}
        />
      )}

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

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
