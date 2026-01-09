import { useState, useEffect } from 'react';
import { TrainingType, Wrestler } from '../../../types';
import { useGame } from '../../../context/GameContext';
import { useGameLoop } from '../../../hooks/useGameLoop';
import { Header } from '../../../components/layout/Header';
import { Sidebar } from '../../../components/layout/Sidebar';
import { GameModals } from './GameModals';
import WrestlerList from '../../wrestler/components/WrestlerList';
import LogWindow from '../../match/components/LogWindow';
import { generateFullRoster, generateHeyas } from '../../wrestler/logic/generator';
import { updateBanzuke } from '../../banzuke/logic/banzuke';
import { MAX_PLAYERS_PER_HEYA } from '../../../utils/constants';
import { AchievementSystem } from '../../collection/components/AchievementSystem';

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

/**
 * メインゲーム画面コンポーネント
 * Header, Sidebar, GameModals を組み合わせてゲームUIを構成
 */
export const MainGameScreen = () => {
    const { wrestlers, setWrestlers, setHeyas, gamePhase } = useGame();
    const { advanceTime, recruitWrestler, retireWrestler } = useGameLoop();

    // UI State
    const [selectedWrestler, setSelectedWrestler] = useState<Wrestler | null>(null);
    const [showScout, setShowScout] = useState(false);
    const [showManagement, setShowManagement] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showEncyclopedia, setShowEncyclopedia] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [trainingType, setTrainingType] = useState<TrainingType>('shiko');

    // Initialize Data once
    useEffect(() => {
        if (wrestlers.length === 0) {
            // 1. Generate Heyas
            const newHeyas = generateHeyas();
            setHeyas(newHeyas);

            // 2. Get Player Wrestlers
            const playerWrestlers = generateDummyWrestlers();

            // 3. Generate CPU Roster
            let roster = [...playerWrestlers, ...generateFullRoster(newHeyas)];

            // 4. Normalize Ranks
            roster = updateBanzuke(roster);

            setWrestlers(roster);
        }
    }, [wrestlers.length, setWrestlers, setHeyas]);

    const handleAdvance = () => {
        advanceTime(trainingType);
    };

    // Filter for Display: Only Player's Heya
    const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');

    return (
        <div className="min-h-screen bg-[#fcf9f2] text-slate-800 font-sans flex flex-col">
            {/* Header */}
            <Header
                onShowScout={() => setShowScout(true)}
                onShowManagement={() => setShowManagement(true)}
                onShowHistory={() => setShowHistory(true)}
                onShowEncyclopedia={() => setShowEncyclopedia(true)}
                onShowHelp={() => setShowHelp(true)}
                onAdvance={handleAdvance}
            />

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
                    <Sidebar
                        selectedWrestler={selectedWrestler}
                        onRetireWrestler={retireWrestler}
                        onClearSelection={() => setSelectedWrestler(null)}
                    />
                </div>
            </main>

            {/* Log Window Area */}
            <LogWindow />

            {/* Systems */}
            <AchievementSystem />

            {/* Modals */}
            <GameModals
                showManagement={showManagement}
                showHistory={showHistory}
                showScout={showScout}
                showEncyclopedia={showEncyclopedia}
                showHelp={showHelp}
                onCloseManagement={() => setShowManagement(false)}
                onCloseHistory={() => setShowHistory(false)}
                onCloseScout={() => setShowScout(false)}
                onCloseEncyclopedia={() => setShowEncyclopedia(false)}
                onCloseHelp={() => setShowHelp(false)}
                onRecruit={(candidate, name) => {
                    recruitWrestler(candidate, name);
                    setShowScout(false);
                }}
            />
        </div>
    );
};

export default MainGameScreen;
