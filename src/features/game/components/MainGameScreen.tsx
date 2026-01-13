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
import { AchievementSystem } from '../../collection/components/AchievementSystem';
// New Imports for Design
import { ChevronRight, Dumbbell, Zap, Swords, Coffee, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import DailyMatchList from '../../match/components/DailyMatchList';

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
 * メインゲーム画面コンポーネント (Refactored for Robustness & Mobile)
 */
export const MainGameScreen = () => {
    const { wrestlers, setWrestlers, setHeyas, gamePhase, todaysMatchups, trainingPoints } = useGame();
    const { advanceTime, recruitWrestler, retireWrestler, giveAdvice } = useGameLoop();
    const { t } = useTranslation();

    // UI State
    const [selectedWrestler, setSelectedWrestler] = useState<Wrestler | null>(null);
    
    // Panel States - layout control
    const [isListOpen, setIsListOpen] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Responsive: Initial Check
    useEffect(() => {
        const handleResize = () => {
             // Mobile/Tablet Landscape or Portrait logic
             if (window.innerWidth < 1024) {
                 // On smaller screens, default to focused view (panels closed or overlay)
                 // But for "3-column" requirement on desktop, we keep defaults.
                 // Let start with Sidebar closed on mobile?
                 setIsSidebarOpen(false);
                 setIsListOpen(false); // Let user open list
             } else {
                 setIsSidebarOpen(true);
                 setIsListOpen(true);
             }
        };
        handleResize(); // Run once
    }, []);

    const [showScout, setShowScout] = useState(false);
    const [showManagement, setShowManagement] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showEncyclopedia, setShowEncyclopedia] = useState(false);
    const [showHeyaList, setShowHeyaList] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showLog, setShowLog] = useState(false);
    const [trainingType, setTrainingType] = useState<TrainingType>('shiko');

    // Initialize Data once
    useEffect(() => {
        if (wrestlers.length === 0) {
            const newHeyas = generateHeyas();
            setHeyas(newHeyas);
            const playerWrestlers = generateDummyWrestlers();
            let roster = [...playerWrestlers, ...generateFullRoster(newHeyas)];
            roster = updateBanzuke(roster);
            setWrestlers(roster);
        }
    }, [wrestlers.length, setWrestlers, setHeyas]);

    const handleAdvance = () => {
        advanceTime(trainingType);
    };

    const handleAdvice = (index: number, side: 'east' | 'west') => {
        giveAdvice(index, side);
    };

    // Filter for Display: Only Player's Heya
    const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');

    // Training Mukofuda Component
    const MukofudaCard = ({ type, label, subLabel, icon: Icon }: any) => {
        const isSelected = trainingType === type;
        return (
             <button
                onClick={() => setTrainingType(type)}
                className={`
                    flex flex-col items-center justify-center p-4 rounded-sm transition-all duration-200 w-full min-h-[100px]
                    ${isSelected
                        ? 'bg-[#f0e6d2] border-2 border-[#b7282e] shadow-md transform -translate-y-1'
                        : 'bg-white border border-slate-300 hover:bg-slate-50'
                    }
                `}
            >
                <div className={`mb-2 ${isSelected ? 'text-[#b7282e]' : 'text-slate-400'}`}>
                    <Icon className="w-8 h-8" />
                </div>
                <div className={`font-serif font-bold text-sm md:text-base leading-tight text-center break-words w-full ${isSelected ? 'text-[#2c1a1b]' : 'text-slate-600'}`}>
                    {label}
                </div>
                <div className="hidden md:block text-xs font-mono text-slate-500 mt-1 text-center break-words w-full">
                    {subLabel}
                </div>
            </button>
        );
    };

    return (
        <div className="h-screen w-screen bg-[#fcf9f2] text-slate-800 font-sans flex flex-col overflow-hidden">
            {/* Header */}
            <Header
                onShowScout={() => setShowScout(true)}
                onShowManagement={() => setShowManagement(true)}
                onShowHistory={() => setShowHistory(true)}
                onShowEncyclopedia={() => setShowEncyclopedia(true)}
                onShowHeyaList={() => setShowHeyaList(true)}
                // Toggles
                onToggleLeftPanel={() => setIsListOpen(!isListOpen)}
                onToggleRightPanel={() => setIsSidebarOpen(!isSidebarOpen)}
                isLeftPanelOpen={isListOpen}
                isRightPanelOpen={isSidebarOpen}
            />

            {/* Main Content Layout (Flex Row) */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* 1. LEFT PANEL: Roster List */}
                <div className={`
                    bg-[#fcf9f2] border-r border-slate-200 flex flex-col z-20
                    transition-all duration-300 ease-in-out
                    ${isListOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'}
                    absolute md:relative h-full shadow-lg md:shadow-none
                `}>
                     <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                        <h2 className="font-bold font-serif text-slate-800 flex items-center gap-2">
                            <span className="text-[#b7282e]">◆</span>
                            {t('heya.roster')}
                        </h2>
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                                {playerWrestlers.length}
                            </span>
                            {/* Mobile Close */}
                            <button onClick={() => setIsListOpen(false)} className="md:hidden p-1 text-slate-400">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        <WrestlerList wrestlers={playerWrestlers} onSelect={setSelectedWrestler} />
                    </div>
                </div>


                {/* 2. CENTER PANEL: Main Game Area */}
                <div className="flex-1 flex flex-col relative min-w-0 bg-[#f4f1e8] z-0">
                    
                    {/* Background Visuals */}
                     <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
                        
                        {/* Phase 1: Training Mode */}
                        {gamePhase === 'training' && (
                            <div className="max-w-4xl mx-auto animate-fadeIn">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-[#b7282e] text-white rounded-sm">
                                        <Dumbbell className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-slate-800 leading-none">{t('training.title')}</h2>
                                        <p className="text-sm text-slate-500 mt-1">{t('training.description', 'Select training regimen for the week')}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                                <div className="mt-8 p-4 bg-white/60 border border-slate-200 rounded text-sm text-slate-600">
                                   <h3 className="font-bold mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                        Overview
                                   </h3>
                                   <p>{t('training.advisor_msg', 'Focus on Shiko to build base stats safely, or risk injury with Moushi-ai for higher gains.')}</p>
                                </div>
                            </div>
                        )}

                        {/* Phase 2: Tournament Mode (Basho) */}
                        {gamePhase === 'tournament' && (
                            <div className="max-w-4xl mx-auto animate-fadeIn pb-12">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-amber-500 text-amber-950 rounded-sm">
                                        <Swords className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-slate-800 leading-none">{t('basho.title', 'Hon-Basho in Progress')}</h2>
                                        <p className="text-sm text-slate-500 mt-1">{t('basho.subtitle', 'Daily Matches')}</p>
                                    </div>
                                </div>

                                {/* Match List Component */}
                                <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden">
                                     <DailyMatchList
                                        matchups={todaysMatchups}
                                        onAdvice={(index, side) => {
                                            // Handle Advice
                                            // We need to map the filtered index to actual ID, but DailyMatchList
                                            // now passes index of the filtered list.
                                            // Ideally DailyMatchList should return the MATCH OBJECT or ID.
                                            // But for now, assuming refactor kept index consistent?
                                            // Wait, refactor logic: onAdvice(matchups.indexOf(m), ...)
                                            // So it passes the index in the ORIGINAL array if `matchups` is todaysMatchups.
                                            // Yes, `matchups.indexOf(m)` ensures correct index.
                                            handleAdvice(index, side);
                                        }}
                                        currentTp={trainingPoints}
                                        mode="full"
                                    />
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Bottom Action Bar (Fixed at bottom right of Center Panel) */}
                    <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-3">
                         <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowLog(!showLog)}
                                className={`
                                    rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white/20 transition-transform active:scale-95
                                    ${showLog ? 'bg-slate-700 text-white' : 'bg-white text-slate-600'}
                                `}
                                title={t('log_btn.tooltip')}
                            >
                                <span className="font-serif font-bold text-xs writing-vertical-rl">{t('log_btn.label')}</span>
                            </button>

                            <Button
                                variant={gamePhase === 'tournament' ? 'secondary' : 'action'} // Use Secondary/Gold for tournament? Or Action?
                                size="lg"
                                onClick={handleAdvance}
                                className={`
                                    shadow-xl min-w-[200px] h-14 flex items-center justify-between px-6 text-lg
                                    ${gamePhase === 'tournament' ? 'bg-amber-400 text-amber-950 hover:bg-amber-300' : ''}
                                `}
                            >
                                <span className="font-serif font-bold">
                                    {gamePhase === 'tournament' ? t('cmd.next_day') : t('cmd.next_week')}
                                </span>
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>


                {/* 3. RIGHT PANEL: Sidebar (Details) */}
                {/* Mobile Overlay for Sidebar */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
                
                <div className={`
                    fixed md:relative top-0 right-0 h-full z-40 md:z-20
                    bg-white border-l border-slate-200 shadow-2xl md:shadow-none
                    transition-transform duration-300 ease-in-out flex flex-col
                    ${isSidebarOpen ? 'translate-x-0 w-80 md:w-96' : 'translate-x-full w-0 md:w-0 overflow-hidden border-none'}
                `}>
                     {/* Close Button (Mobile Only, or if needed on Desktop) */}
                     {isSidebarOpen && (
                        <div className="md:hidden absolute top-2 right-2 z-50">
                             <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                                 <X className="w-5 h-5"/>
                             </button>
                        </div>
                     )}

                    <Sidebar
                        selectedWrestler={selectedWrestler}
                        onRetireWrestler={retireWrestler}
                        onClearSelection={() => setSelectedWrestler(null)}
                        isOpen={true}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </div>

            </div>

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
