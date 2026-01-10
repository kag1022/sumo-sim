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
// New Imports for Design
import { ChevronRight, Dumbbell, Zap, Swords, Coffee } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useTranslation } from 'react-i18next';

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
 * Updated to "Sumo Modern Dashboard"
 */
export const MainGameScreen = () => {
    const { wrestlers, setWrestlers, setHeyas, gamePhase } = useGame();
    const { advanceTime, recruitWrestler, retireWrestler } = useGameLoop();
    const { t } = useTranslation();

    // UI State
    const [selectedWrestler, setSelectedWrestler] = useState<Wrestler | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
    const [showScout, setShowScout] = useState(false);
    const [showManagement, setShowManagement] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showEncyclopedia, setShowEncyclopedia] = useState(false);
    const [showHeyaList, setShowHeyaList] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showLog, setShowLog] = useState(false); // Default hidden
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

    // Mukofuda (Wood Tag) Card Component
    const MukofudaCard = ({ type, label, subLabel, icon: Icon }: any) => {
        const isSelected = trainingType === type;
        return (
            <button
                onClick={() => setTrainingType(type)}
                className={`
                    relative group flex flex-col items-center justify-center p-3 rounded-sm transition-all duration-300 w-full
                    ${isSelected
                        ? 'bg-[#f0e6d2] shadow-md -translate-y-1 z-10'
                        : 'bg-[#fcf9f2] hover:bg-[#fffdf9] hover:shadow-sm hover:-translate-y-0.5'
                    }
                    border-2 ${isSelected ? 'border-[#b7282e]' : 'border-[#d4c5a9]'}
                `}
            >
                {/* Wood Texture Overlay (CSS Pattern) */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 10px)' }}></div>

                {/* Hole for string (Visual) */}
                <div className="w-2 h-2 rounded-full bg-[#5c4a3d] absolute top-1.5 left-1/2 -translate-x-1/2 shadow-inner"></div>

                <div className={`mb-1 mt-1 ${isSelected ? 'text-[#b7282e]' : 'text-slate-400'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`font-serif font-bold text-sm mb-0.5 ${isSelected ? 'text-[#2c1a1b]' : 'text-slate-600'}`}>
                    {label}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                    {subLabel}
                </div>

                {/* Selection Badge */}
                {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#b7282e] rounded-full shadow-sm"></div>
                )}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#fcf9f2] text-slate-800 font-sans flex flex-col overflow-hidden relative">
            {/* Header */}
            <Header
                onShowScout={() => setShowScout(true)}
                onShowManagement={() => setShowManagement(true)}
                onShowHistory={() => setShowHistory(true)}
                onShowEncyclopedia={() => setShowEncyclopedia(true)}
                onShowHeyaList={() => setShowHeyaList(true)}
                onShowHelp={() => setShowHelp(true)}
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-4 flex-1 overflow-hidden flex flex-col relative z-0">
                <div className="flex flex-col md:flex-row gap-4 h-full relative">

                    {/* Left Column: Training & List */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden h-full pb-16 md:pb-0"> {/* Added padding for mobile action bar */}

                        {/* Training Selector (Mukofuda Style) */}
                        <div className={`transition-all duration-500 shrink-0 ${gamePhase === 'tournament' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <span className="w-1.5 h-4 bg-[#b7282e] rounded-full"></span>
                                <h3 className="font-serif font-bold text-slate-800">{t('training.title')}</h3>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <MukofudaCard
                                    type="shiko"
                                    label={t('training.modes.shiko.label')}
                                    subLabel={t('training.modes.shiko.sub')}
                                    icon={Dumbbell}
                                />
                                <MukofudaCard
                                    type="teppo"
                                    label={t('training.modes.teppo.label')}
                                    subLabel={t('training.modes.teppo.sub')}
                                    icon={Zap}
                                />
                                <MukofudaCard
                                    type="moushi_ai"
                                    label={t('training.modes.moushi_ai.label')}
                                    subLabel={t('training.modes.moushi_ai.sub')}
                                    icon={Swords}
                                />
                                <MukofudaCard
                                    type="rest"
                                    label={t('training.modes.rest.label')}
                                    subLabel={t('training.modes.rest.sub')}
                                    icon={Coffee}
                                />
                            </div>
                        </div>

                        {/* Roster List */}
                        <div className="flex-1 flex flex-col bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden relative">
                            {/* Japanese Pattern Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b7282e 20%, transparent 20%)', backgroundSize: '10px 10px' }}></div>

                            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm z-10">
                                <h2 className="font-bold font-serif text-slate-800 flex items-center gap-2">
                                    <span className="text-[#b7282e]">◆</span>
                                    {t('heya.roster')}
                                </h2>
                                <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                                    {playerWrestlers.length} / {MAX_PLAYERS_PER_HEYA}
                                </span>
                            </div>

                            <div className="flex-1 overflow-hidden p-2 z-10">
                                <WrestlerList wrestlers={playerWrestlers} onSelect={setSelectedWrestler} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar (Drawer) */}
                    <Sidebar
                        selectedWrestler={selectedWrestler}
                        onRetireWrestler={retireWrestler}
                        onClearSelection={() => setSelectedWrestler(null)}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </div>
            </main>

            {/* Floating Action Bar (Bottom Right) */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
                {/* Re-enable pointer events for buttons */}

                {/* Next Turn Button */}
                <div className="pointer-events-auto">
                    <Button
                        variant={gamePhase === 'tournament' ? 'primary' : 'action'}
                        size="lg"
                        onClick={handleAdvance}
                        className="shadow-xl border-2 border-white/20 transform hover:-translate-y-1 transition-transform"
                    >
                        <div className="flex items-center gap-3 px-2">
                            <span className="font-serif font-bold text-lg">
                                {gamePhase === 'tournament' ? t('cmd.next_day') : t('cmd.next_week')}
                            </span>
                            <ChevronRight className="w-5 h-5 animate-pulse" />
                        </div>
                    </Button>
                </div>

                {/* Log Toggle Button (Above Action) */}
                <div className="pointer-events-auto">
                    <button
                        onClick={() => setShowLog(!showLog)}
                        className={`
                            rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white/20 transition-all hover:scale-105 active:scale-95
                            ${showLog ? 'bg-slate-700 text-white' : 'bg-white text-slate-600'}
                        `}
                        title={t('log_btn.tooltip')}
                    >
                        <span className="font-serif font-bold text-xs writing-vertical-rl">{t('log_btn.label')}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Placeholder (if Sidebar is hidden on mobile, need drawer) */}
            {/* NOTE: Sidebar is 'hidden md:flex'. We need a mobile solution. For now sticking to desktop layout focus, but maybe add a 'Show Detail' button for mobile later? */}

            {/* Log Window - Side Drawer */}
            <LogWindow isOpen={showLog} onClose={() => setShowLog(false)} />

            {/* Systems */}
            <AchievementSystem />

            {/* Modals */}
            <GameModals
                showManagement={showManagement}
                showHistory={showHistory}
                showScout={showScout}
                showEncyclopedia={showEncyclopedia}
                showHeyaList={showHeyaList}
                showHelp={showHelp}
                onCloseManagement={() => setShowManagement(false)}
                onCloseHistory={() => setShowHistory(false)}
                onCloseScout={() => setShowScout(false)}
                onCloseEncyclopedia={() => setShowEncyclopedia(false)}
                onCloseHeyaList={() => setShowHeyaList(false)}
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
