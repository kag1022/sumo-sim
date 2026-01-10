import { useState, useEffect } from 'react';
import { Wrestler } from '../../types';
import { useGame } from '../../context/GameContext';
import { useGameLoop } from '../../hooks/useGameLoop';
import { formatRank } from '../../utils/formatting';
import DailyMatchList from '../../features/match/components/DailyMatchList';
import Button from '../ui/Button';
import { calculateSeverance } from '../../features/wrestler/logic/retirement';
import { AlertTriangle, Scale, Edit2, BookOpen } from 'lucide-react';
import { ShikonaChangeModal } from '../../features/heya/components/ShikonaChangeModal';
import { SkillBookModal } from '../../features/wrestler/components/SkillBookModal';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
    selectedWrestler: Wrestler | null;
    onRetireWrestler: (wrestlerId: string) => void;
    onClearSelection: () => void;
}

/**
 * サイドバーコンポーネント
 * 力士詳細情報と取組リストを表示
 */
import { getWeekId } from '../../utils/time';

// ... existing imports

export const Sidebar = ({
    selectedWrestler,
    onRetireWrestler,
    onClearSelection,
}: SidebarProps) => {
    const {
        wrestlers,
        gamePhase,
        trainingPoints,
        todaysMatchups,
        currentDate // Added
    } = useGame();
    const { t, i18n } = useTranslation();

    const { doSpecialTraining, giveAdvice, renameWrestler } = useGameLoop();

    const [sidebarTab, setSidebarTab] = useState<'info' | 'matches'>('info');
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showSkillBookModal, setShowSkillBookModal] = useState(false);

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

    // Get active wrestler data (refreshed from state)
    const activeSelectedWrestler = selectedWrestler
        ? wrestlers.find(w => w.id === selectedWrestler.id) || selectedWrestler
        : null;

    // Display Name Logic: Use reading (Romaji) if English mode, else Name (Kanji)
    const displayName = activeSelectedWrestler
        ? (i18n.language === 'en' && activeSelectedWrestler.reading ? activeSelectedWrestler.reading : activeSelectedWrestler.name)
        : '';

    return (
        <div className="w-full md:w-80 shrink-0 flex flex-col h-[calc(100vh-100px)]">
            {/* Tabs (Tournament Only) */}
            {gamePhase === 'tournament' && (
                <div className="flex gap-1 shrink-0 mb-0 translate-y-[1px] z-10 px-1">
                    <button
                        onClick={() => setSidebarTab('matches')}
                        className={`flex-1 py-2 text-xs font-bold rounded-t-sm transition-all border-t border-x ${sidebarTab === 'matches' ? 'bg-white border-slate-200 border-b-white text-[#b7282e] shadow-sm -mb-px' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'}`}
                    >
                        {t('sidebar.matches_tab')}
                    </button>
                    <button
                        onClick={() => setSidebarTab('info')}
                        className={`flex-1 py-2 text-xs font-bold rounded-t-sm transition-all border-t border-x ${sidebarTab === 'info' ? 'bg-white border-slate-200 border-b-white text-[#b7282e] shadow-sm -mb-px' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'}`}
                    >
                        {t('sidebar.info_tab')}
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
                                <h3 className="font-serif font-bold text-slate-800">{t('sidebar.details_title')}</h3>
                                {activeSelectedWrestler && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">ID: {activeSelectedWrestler.id.slice(0, 4)}</span>}
                            </div>
                        )}

                        {activeSelectedWrestler ? (
                            <div className="space-y-5">
                                <div className="text-center relative">
                                    <div className="inline-block bg-[#2c1a1b] text-[#f2d07e] px-3 py-0.5 text-xs font-bold rounded-sm shadow-sm mb-2 font-serif">
                                        {formatRank(activeSelectedWrestler.rank, activeSelectedWrestler.rankSide, activeSelectedWrestler.rankNumber)}
                                    </div>
                                    <div className="relative inline-block">
                                        <div className="text-3xl font-bold font-serif text-slate-900 border-b-2 border-[#b7282e] inline-block px-4 pb-1 mb-2">
                                            {displayName}
                                        </div>
                                        {/* Rename Button */}
                                        {activeSelectedWrestler.heyaId === 'player_heya' && (
                                            <button
                                                onClick={() => setShowRenameModal(true)}
                                                className="absolute -right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#b7282e] p-1"
                                                title={t('modal.shikona_change.title', '改名')}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {activeSelectedWrestler.injuryStatus === 'injured' && (
                                        <div className="mt-2 inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 text-xs font-bold rounded-sm border border-red-200 animate-pulse">
                                            <AlertTriangle className="w-3 h-3" /> {t('sidebar.injury_status')}
                                        </div>
                                    )}
                                    {/* Current Basho Stats (if active) */}
                                    {gamePhase === 'tournament' && (
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                                            <div className="bg-red-50 p-2 rounded-sm border border-red-100">
                                                <div className="text-xl font-mono font-bold text-red-700">{activeSelectedWrestler.currentBashoStats.wins}</div>
                                                <div className="text-[10px] text-red-400 font-bold">{t('sidebar.win')}</div>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-sm border border-slate-100">
                                                <div className="text-xl font-mono font-bold text-slate-700">{activeSelectedWrestler.currentBashoStats.losses}</div>
                                                <div className="text-[10px] text-slate-400 font-bold">{t('sidebar.loss')}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Age and Tenure Info */}
                                    <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-bold">
                                        <div className={`px-2 py-1 rounded bg-slate-50 ${activeSelectedWrestler.age >= 35 ? 'text-red-600' : 'text-slate-600'}`}>
                                            {activeSelectedWrestler.age}{t('sidebar.age_suffix')}
                                        </div>
                                        <div className="px-2 py-1 rounded bg-slate-50 text-slate-500">
                                            {t('sidebar.tenure', { years: Math.floor((activeSelectedWrestler.timeInHeya || 0) / 12) })}
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
                                        <span className="font-serif font-bold text-slate-600 w-8">{t('sidebar.mind')}</span>
                                        <div className="flex-1 mx-2 bg-white rounded-full h-2 overflow-hidden border border-slate-100">
                                            <div className="bg-[#b7282e] h-full" style={{ width: `${activeSelectedWrestler.stats.mind}%` }}></div>
                                        </div>
                                        <span className="font-mono text-slate-700 w-6 text-right">{Math.floor(activeSelectedWrestler.stats.mind)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="font-serif font-bold text-slate-600 w-8">{t('sidebar.tech')}</span>
                                        <div className="flex-1 mx-2 bg-white rounded-full h-2 overflow-hidden border border-slate-100">
                                            <div className="bg-amber-500 h-full" style={{ width: `${activeSelectedWrestler.stats.technique}%` }}></div>
                                        </div>
                                        <span className="font-mono text-slate-700 w-6 text-right">{Math.floor(activeSelectedWrestler.stats.technique)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="font-serif font-bold text-slate-600 w-8">{t('sidebar.body')}</span>
                                        <div className="flex-1 mx-2 bg-white rounded-full h-2 overflow-hidden border border-slate-100">
                                            <div className="bg-slate-600 h-full" style={{ width: `${activeSelectedWrestler.stats.body}%` }}></div>
                                        </div>
                                        <span className="font-mono text-slate-700 w-6 text-right">{Math.floor(activeSelectedWrestler.stats.body)}</span>
                                    </div>
                                    {/* Divider */}
                                    <div className="h-px bg-slate-200 my-2"></div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="font-serif font-bold text-slate-500 w-8 text-xs">{t('sidebar.stress')}</span>
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
                                                <h4 className="font-bold text-slate-800 text-sm font-serif">{t('sidebar.special_training')}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold ${(function () {
                                                        if (!activeSelectedWrestler) return 'text-slate-400';
                                                        const currentWeekId = getWeekId(currentDate);
                                                        const history = activeSelectedWrestler.trainingHistory;
                                                        const weeklyCount = (history?.weekId === currentWeekId) ? history.count : 0;
                                                        return weeklyCount >= 5 ? 'text-red-600' : 'text-slate-500';
                                                    })()
                                                        }`}>
                                                        {(function () {
                                                            if (!activeSelectedWrestler) return '';
                                                            const currentWeekId = getWeekId(currentDate);
                                                            const history = activeSelectedWrestler.trainingHistory;
                                                            const weeklyCount = (history?.weekId === currentWeekId) ? history.count : 0;
                                                            return t('sidebar.training.limit_info', { current: weeklyCount, max: 5 });
                                                        })()}
                                                    </span>
                                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">{t('sidebar.remaining_tp', { tp: trainingPoints })}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {(function () {
                                                    const currentWeekId = getWeekId(currentDate);
                                                    const history = activeSelectedWrestler?.trainingHistory;
                                                    const weeklyCount = (history?.weekId === currentWeekId) ? history.count : 0;
                                                    const isLimitReached = weeklyCount >= 5;

                                                    return (
                                                        <>
                                                            <button
                                                                onClick={() => doSpecialTraining(selectedWrestler.id, 'shiko')}
                                                                disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured' || isLimitReached}
                                                                className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold py-2 px-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title={isLimitReached ? t('sidebar.training.limit_reached') : ''}
                                                            >
                                                                {t('sidebar.training.shiko')}
                                                            </button>
                                                            <button
                                                                onClick={() => doSpecialTraining(selectedWrestler.id, 'teppo')}
                                                                disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured' || isLimitReached}
                                                                className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold py-2 px-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title={isLimitReached ? t('sidebar.training.limit_reached') : ''}
                                                            >
                                                                {t('sidebar.training.teppo')}
                                                            </button>
                                                            <button
                                                                onClick={() => doSpecialTraining(selectedWrestler.id, 'moushi_ai')}
                                                                disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured' || isLimitReached}
                                                                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 text-xs font-bold py-2 px-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title={isLimitReached ? t('sidebar.training.limit_reached') : ''}
                                                            >
                                                                {t('sidebar.training.moushi_ai')}
                                                            </button>
                                                            <button
                                                                onClick={() => doSpecialTraining(selectedWrestler.id, 'meditation')}
                                                                disabled={trainingPoints <= 0 || selectedWrestler.injuryStatus === 'injured' || isLimitReached}
                                                                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold py-2 px-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title={isLimitReached ? t('sidebar.training.limit_reached') : ''}
                                                            >
                                                                {t('sidebar.training.meditation')}
                                                            </button>
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                            <button
                                                onClick={() => setShowSkillBookModal(true)}
                                                className="w-full mt-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-1 rounded-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                <BookOpen className="w-3 h-3" />
                                                <span>{t('dictionary.title_manage')}</span>
                                            </button>
                                        </div>

                                        <div className="bg-stone-50 p-3 rounded-sm border border-stone-200">
                                            <h4 className="font-bold text-stone-700 mb-1 text-xs">{t('sidebar.processing')}</h4>
                                            <p className="text-[10px] text-stone-500 mb-3 leading-tight">
                                                {t('sidebar.retire_desc')}
                                            </p>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                onClick={() => {
                                                    if (!selectedWrestler) return;
                                                    const severance = calculateSeverance(selectedWrestler);
                                                    if (window.confirm(t('sidebar.retire_confirm', { name: selectedWrestler.name, amount: severance.toLocaleString() }))) {
                                                        onRetireWrestler(selectedWrestler.id);
                                                        onClearSelection();
                                                    }
                                                }}
                                            >
                                                {t('sidebar.retire_btn')}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <Scale className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">{t('sidebar.list_hint')}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Rename Modal */}
            {activeSelectedWrestler && showRenameModal && (
                <ShikonaChangeModal
                    isOpen={showRenameModal}
                    onClose={() => setShowRenameModal(false)}
                    wrestler={activeSelectedWrestler}
                    currentTp={trainingPoints}
                    onRename={renameWrestler}
                />
            )}

            {showSkillBookModal && (
                <SkillBookModal
                    isOpen={showSkillBookModal}
                    onClose={() => setShowSkillBookModal(false)}
                    selectedWrestlerId={activeSelectedWrestler?.id}
                />
            )}

        </div>
    );
};

export default Sidebar;
