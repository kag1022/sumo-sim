import { useState, useEffect } from 'react';
import WrestlerList from './components/WrestlerList';
import LogWindow from './components/LogWindow';
import BashoResultModal from './components/BashoResultModal';
import ScoutPanel from './components/ScoutPanel';
import { TrainingType, Wrestler } from './types';
import { GameProvider, useGame } from './context/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import { formatHybridDate } from './utils/time';
import { generateFullRoster } from './utils/dummyGenerator';
import { updateBanzuke } from './utils/banzuke';
import { formatRank } from './utils/formatting';
import { MAX_PLAYERS_PER_HEYA } from './utils/constants';

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
      currentBashoStats: { wins: 0, losses: 0 },
      potential: 90,
      flexibility: 80,
      weight: 155,
      height: 185,
      background: '伝説の横綱'
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
      currentBashoStats: { wins: 0, losses: 0 },
      potential: 95,
      flexibility: 90,
      weight: 127,
      height: 183,
      background: 'ウルフ'
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
      currentBashoStats: { wins: 0, losses: 0 },
      potential: 92,
      flexibility: 85,
      weight: 160,
      height: 185,
      background: '平成の大横綱'
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
      currentBashoStats: { wins: 0, losses: 0 },
      potential: 70,
      flexibility: 60,
      weight: 140,
      height: 178,
      background: '期待の若手'
    }
  ];
};

// Inner Component to use Hooks
const GameScreen = () => {
  const { currentDate, funds, wrestlers, setWrestlers, gameMode, bashoFinished } = useGame();
  const { advanceTime, closeBashoModal, candidates, recruitWrestler } = useGameLoop();
  const [selectedWrestler, setSelectedWrestler] = useState<Wrestler | null>(null);
  const [trainingType, setTrainingType] = useState<TrainingType>('shiko');
  const [showScout, setShowScout] = useState(false);

  // Initialize Data once
  useEffect(() => {
    if (wrestlers.length === 0) {
      // 1. Get Player Wrestlers
      const playerWrestlers = generateDummyWrestlers();

      // 2. Generate CPU Roster
      // We want CPUs to compete but NOT duplicate positions if possible.
      // But strict quota checks are hard if we manually insert players.
      // Simplified: Generate full CPU roster, then "Insert/Replace" players?
      // Or just append.
      // If we append 4 players to 940, total 944. Valid.

      let roster = [...playerWrestlers, ...generateFullRoster()];

      // 3. Normalize Ranks (Re-sort and Assign)
      // This ensures players get properly slotted into the hierarchy based on their initial ranks (seed) or logic.
      // Wait, updateBanzuke recalculates based on SCORE.
      // Initial score = Rank Base.
      // So if I set Player to 'Yokozuna', they will sort to top.
      roster = updateBanzuke(roster);

      setWrestlers(roster);
    }
  }, [wrestlers.length, setWrestlers]);

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
            <h1 className="text-2xl font-bold font-serif tracking-widest leading-none">大相撲部屋経営</h1>
            <p className="text-xs opacity-80 tracking-wide">Sumo Stable Management</p>
          </div>

          <div className="flex items-center gap-6 bg-white/10 px-6 py-2 rounded-sm backdrop-blur-sm border border-white/20">
            {/* Status Badge */}
            <div className={`px-2 py-1 rounded text-xs font-bold ${gameMode === 'tournament' ? 'bg-amber-400 text-amber-950' : 'bg-blue-800 text-blue-200'}`}>
              {gameMode === 'tournament' ? '本場所中' : '育成期間'}
            </div>

            {/* Date */}
            <div className="text-center">
              <span className="block text-[10px] opacity-70">現在の日付</span>
              <span className="font-serif font-bold text-lg">{formatHybridDate(currentDate, gameMode)}</span>
            </div>

            <div className="w-px h-8 bg-white/30"></div>

            {/* Funds */}
            <div className="text-center min-w-[120px]">
              <span className="block text-[10px] opacity-70">所持金</span>
              <span className={`font-mono font-bold text-xl ${funds < 0 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                {funds.toLocaleString()}
                <span className="text-xs ml-1 font-sans font-normal">円</span>
              </span>
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
                    {/* Show Basho Stats if in Tournament */}
                    {gameMode === 'tournament' && (
                      <div className="mt-4 p-2 bg-slate-100 rounded font-mono text-xl font-bold text-center">
                        {activeSelectedWrestler.currentBashoStats.wins} 勝 {activeSelectedWrestler.currentBashoStats.losses} 敗
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>心</span>
                      <div className="w-32 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-[#b7282e] h-full transition-all duration-500" style={{ width: `${activeSelectedWrestler.stats.mind}%` }}></div>
                      </div>
                      <span className="font-mono">{activeSelectedWrestler.stats.mind}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>技</span>
                      <div className="w-32 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-amber-600 h-full transition-all duration-500" style={{ width: `${activeSelectedWrestler.stats.technique}%` }}></div>
                      </div>
                      <span className="font-mono">{activeSelectedWrestler.stats.technique}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>体</span>
                      <div className="w-32 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-slate-700 h-full transition-all duration-500" style={{ width: `${activeSelectedWrestler.stats.body}%` }}></div>
                      </div>
                      <span className="font-mono">{activeSelectedWrestler.stats.body}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">
                  リストから力士を選択してください
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Log Window Area */}
      <LogWindow />
      {/* Modal */}
      {bashoFinished && (
        <BashoResultModal wrestlers={wrestlers} onClose={closeBashoModal} />
      )}

      {showScout && (
        <ScoutPanel
          candidates={candidates}
          funds={funds}
          currentCount={playerWrestlers.length}
          limit={MAX_PLAYERS_PER_HEYA}
          onRecruit={(c) => {
            recruitWrestler(c);
            setShowScout(false);
          }}
          onClose={() => setShowScout(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}

export default App;
