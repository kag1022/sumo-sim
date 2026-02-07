import { useState } from 'react';
import { Wrestler } from '../../types';
import { useGame } from '../../context/GameContext';
import { useGameLoop } from '../../hooks/useGameLoop';
import { getWeekId } from '../../utils/time';
import { formatRank } from '../../utils/formatting';
import DailyMatchList from '../../features/match/components/DailyMatchList';
import Button from '../ui/Button';
import { RadarChart } from '../ui/RadarChart';
import { Edit2, BookOpen, X, Trash2 } from 'lucide-react';
import { ShikonaChangeModal } from '../../features/heya/components/ShikonaChangeModal';
import { SkillBookModal } from '../../features/wrestler/components/SkillBookModal';
import { useTranslation } from 'react-i18next';
import { calculateSeverance } from '../../features/wrestler/logic/retirement'; // Re-added as it is used logic

interface SidebarProps {
    selectedWrestler: Wrestler | null;
    onRetireWrestler: (wrestlerId: string) => void;
    onClearSelection?: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar = ({
    selectedWrestler,
    onRetireWrestler,
    // onClearSelection, // unused
    isOpen = false,
    onClose,
}: SidebarProps) => {
    const { gamePhase, trainingPoints, todaysMatchups, wrestlers, heyas } = useGame();
    const { t, i18n } = useTranslation();

    const { renameWrestler, doSpecialTraining } = useGameLoop();

    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showSkillBookModal, setShowSkillBookModal] = useState(false);
    const [isRetiring, setIsRetiring] = useState(false); // Added missing state

    // Determine Severance Pay
    const severancePay = selectedWrestler
        ? calculateSeverance(selectedWrestler) // Use the imported function
        : 0;

    // Get active wrestler data (refreshed from state)
    const activeSelectedWrestler = selectedWrestler
        ? wrestlers.find(w => w.id === selectedWrestler.id) || selectedWrestler
        : null;

    // Resolve Heya Name
    const heyaName = activeSelectedWrestler
        ? heyas.find(h => h.id === activeSelectedWrestler.heyaId)?.name || activeSelectedWrestler.heyaId
        : '';

    // Display Name Logic: Use reading (Romaji) if English mode, else Name (Kanji)
    const displayName = activeSelectedWrestler
        ? (i18n.language === 'en' && activeSelectedWrestler.reading ? activeSelectedWrestler.reading : activeSelectedWrestler.name)
        : '';

    // Drawer Logic
    const sidebarClasses = `
        fixed inset-y-0 right-0 z-[60]
        w-full sm:w-[26rem] md:w-[22rem] lg:w-[26rem]
        h-[100dvh]
        bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none md:shadow-none md:border-l md:border-slate-200
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
    `;

    // Overlay logic (Mobile only)
    const overlayClasses = `
        fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] transition-opacity duration-300
        md:hidden
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `;



    const sectionLabelClass = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

    return (
        <>
            {/* Mobile Overlay */}
            <div className={overlayClasses} onClick={onClose} aria-hidden="true" />

            <div className={sidebarClasses}>
                <div className="h-full flex flex-col bg-slate-50 relative">

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full shadow-sm hover:bg-slate-100"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    {activeSelectedWrestler ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 pb-safe">
                            <div className="sticky top-0 bg-[#fcf9f2]/95 backdrop-blur-sm z-10 px-6 py-4 border-b border-stone-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-bold text-[#b7282e] tracking-widest uppercase mb-1">{heyaName}</div>
                                        <h2 className="text-3xl font-bold font-serif text-slate-900 leading-tight tracking-tight">{displayName}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider">{formatRank(activeSelectedWrestler.rank)}</span>
                                            <span className="text-xs text-slate-500 font-mono">{activeSelectedWrestler.origin} • {activeSelectedWrestler.age || 18}{t('common.age_suffix')}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                         <button
                                            onClick={() => setShowRenameModal(true)}
                                            className="p-1.5 text-slate-400 hover:text-[#b7282e] hover:bg-red-50 rounded-sm transition-colors border border-transparent hover:border-red-100"
                                            title={t('cmd.rename')}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                         <button
                                            onClick={() => {
                                                // Ideally scroll to bottom or show retire modal directly? 
                                                // For now, let's keep it near the bottom action but maybe add a shortcut?
                                                // Actually, user wants "better UI/UX". Let's put Retire in a "Settings" or "Management" dropdown?
                                                // Or just keep it at bottom for safety.
                                                const element = document.getElementById('retire-section');
                                                element?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
                                            title={t('cmd.retire')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-4 pb-32">
                                {/* Quick Actions */}
                                <div className="bg-white p-4 rounded-sm shadow-sm border border-stone-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={sectionLabelClass}>{t('sidebar.quick_actions', 'Quick Actions')}</span>
                                        <span className="text-xs text-slate-400">{t('sidebar.quick_actions_hint', 'Manage this wrestler')}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setShowRenameModal(true)}
                                            className="flex flex-col items-center justify-center gap-1 rounded-sm border border-slate-200 bg-slate-50 px-2 py-3 text-xs font-bold text-slate-600 hover:border-[#b7282e] hover:bg-red-50 hover:text-[#b7282e]"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            {t('cmd.rename')}
                                        </button>
                                        <button
                                            onClick={() => setShowSkillBookModal(true)}
                                            className="flex flex-col items-center justify-center gap-1 rounded-sm border border-slate-200 bg-slate-50 px-2 py-3 text-xs font-bold text-slate-600 hover:border-[#b7282e] hover:bg-red-50 hover:text-[#b7282e]"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            {t('wrestler.skill_book')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                const element = document.getElementById('retire-section');
                                                element?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="flex flex-col items-center justify-center gap-1 rounded-sm border border-slate-200 bg-slate-50 px-2 py-3 text-xs font-bold text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {t('cmd.retire')}
                                        </button>
                                    </div>
                                </div>

                                {/* Profile Card */}
                                <div className="bg-white p-4 rounded-sm shadow-sm border border-stone-200">
                                    <div className="flex gap-4">
                                         {/* Simple Avatar Representation */}
                                        <div className="w-20 h-24 bg-slate-100 rounded-sm flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden relative">
                                            {/* Pattern or Initial */}
                                             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/japanese-sayagata.png')]"></div>
                                             <span className="font-serif text-4xl text-slate-300 font-bold opacity-30">{displayName.charAt(0)}</span>
                                        </div>
                                        
                                        <div className="flex-1 grid grid-cols-2 gap-y-2 gap-x-4 content-center">
                                            <div>
                                                 <div className="text-[10px] uppercase text-slate-400 font-bold">{t('wrestler.weight')}</div>
                                                 <div className="font-mono text-base font-bold text-slate-700">{activeSelectedWrestler.weight}kg</div>
                                            </div>
                                            <div>
                                                 <div className="text-[10px] uppercase text-slate-400 font-bold">{t('wrestler.height')}</div>
                                                 <div className="font-mono text-base font-bold text-slate-700">{activeSelectedWrestler.height}cm</div>
                                            </div>
                                             <div className="col-span-2 mt-1">
                                                 <div className="text-[10px] uppercase text-slate-400 font-bold">{t('wrestler.injury')}</div>
                                                 <div className={`font-bold text-sm ${activeSelectedWrestler.injuryStatus === 'injured' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {activeSelectedWrestler.injuryStatus === 'injured' ? t('sidebar.injury_status') : t('wrestler.healthy')}
                                                 </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <RadarChart
                                            stats={{
                                                m: activeSelectedWrestler.stats.mind,
                                                t: activeSelectedWrestler.stats.technique,
                                                b: activeSelectedWrestler.stats.body
                                            }}
                                            labels={[t('stats.mind'), t('stats.tech'), t('stats.body')]}
                                        />
                                    </div>
                                </div>

                                {/* Special Training Card (Highlighted) */}
                                <div className="bg-white rounded-sm shadow-sm border-t-4 border-[#b7282e] overflow-hidden">
                                    <div className="bg-red-50/50 px-4 py-2 border-b border-red-100 flex justify-between items-center">
                                         <h3 className="font-serif font-bold text-[#b7282e] flex items-center gap-2">
                                            <span className="text-lg">⚡</span> {t('sidebar.special_training')}
                                         </h3>
                                         <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            {t('sidebar.training.limit_info', {
                                                current: activeSelectedWrestler.trainingHistory?.weekId === getWeekId(useGame().currentDate) ? activeSelectedWrestler.trainingHistory.count : 0,
                                                max: 5
                                            })}
                                        </span>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'shiko', cost: 1, label: t('sidebar.training.shiko'), icon: '' },
                                            { id: 'teppo', cost: 1, label: t('sidebar.training.teppo'), icon: '' },
                                            { id: 'moushi_ai', cost: 1, label: t('sidebar.training.moushi_ai'), icon: '' },
                                            { id: 'meditation', cost: 1, label: t('sidebar.training.meditation'), icon: '' }
                                        ].map((menu) => {
                                            const currentCount = activeSelectedWrestler.trainingHistory?.weekId === getWeekId(useGame().currentDate) ? activeSelectedWrestler.trainingHistory.count : 0;
                                            const isLimitReached = currentCount >= 5;
                                            const hasTp = trainingPoints >= menu.cost;
                                            const canTrain = !isLimitReached && hasTp && !isRetiring;

                                            return (
                                                <button
                                                    key={menu.id}
                                                    onClick={() => doSpecialTraining(activeSelectedWrestler.id, menu.id)}
                                                    disabled={!canTrain}
                                                    className={`
                                                        relative p-3 rounded-sm text-center transition-all border group
                                                        ${canTrain 
                                                            ? 'bg-white hover:bg-[#b7282e] border-slate-200 hover:border-[#b7282e] text-slate-700 hover:text-white shadow-sm hover:shadow-md' 
                                                            : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}
                                                    `}
                                                >
                                                    <div className="text-sm font-bold mb-1">{menu.label}</div>
                                                    <div className={`text-[10px] font-mono ${canTrain ? 'text-slate-400 group-hover:text-red-100' : ''}`}>
                                                        TP -{menu.cost}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Skills Card */}
                                <div className="bg-white p-4 rounded-sm shadow-sm border border-stone-200">
                                     <div className="flex justify-between items-center mb-3">
                                        <span className={sectionLabelClass}>{t('wrestler.skills')}</span>
                                        <button
                                            onClick={() => setShowSkillBookModal(true)}
                                            className="text-xs flex items-center gap-1 text-[#b7282e] hover:text-red-700 hover:underline decoration-red-200 underline-offset-4 transition-colors"
                                        >
                                            <BookOpen className="w-3.5 h-3.5" />
                                            {t('wrestler.skill_book')}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {activeSelectedWrestler.skills && activeSelectedWrestler.skills.length > 0 ? (
                                            activeSelectedWrestler.skills.map((skill, idx) => (
                                                <span key={idx} className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-sm text-xs border border-stone-200 font-medium">
                                                    {t(`skills.${skill}.name`, { defaultValue: skill })}
                                                </span>
                                            ))
                                        ) : (
                                            <div className="w-full text-center py-4 text-slate-300 italic text-sm border-2 border-dashed border-slate-100 rounded-sm">
                                                {t('wrestler.no_skills')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Matches Card (Preview) */}
                                <div className="bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden">
                                    <div className="px-4 py-2 bg-stone-50 border-b border-stone-100">
                                        <span className={sectionLabelClass}>{t('sidebar.matches_tab')}</span>
                                    </div>
                                    {/* Sidebar only shows relevant match for this wrestler */}
                                    <DailyMatchList 
                                        matchups={todaysMatchups.filter(m => (m.east.id === activeSelectedWrestler.id || m.west.id === activeSelectedWrestler.id))}
                                        onAdvice={() => {}} // No-op for sidebar view currently
                                        currentTp={trainingPoints}
                                    />
                                </div>

                                {/* Retirement Section */}
                                <div id="retire-section" className="mt-8 pt-4">
                                    {!isRetiring ? (
                                        <Button
                                            variant="primary"
                                            className="w-full text-sm py-2 opacity-80 hover:opacity-100 bg-red-600 hover:bg-red-700 border-red-700"
                                            onClick={() => setIsRetiring(true)}
                                        >
                                            {t('cmd.retire')}
                                        </Button>
                                    ) : (
                                        <div className="bg-red-50 p-4 rounded-sm border border-red-100 animate-fadeIn">
                                            <h4 className="font-bold text-red-800 text-sm mb-2">{t('wrestler.retire_confirm_title')}</h4>
                                            <p className="text-xs text-red-600 mb-4">
                                                {t('wrestler.retire_confirm_msg')}
                                                <br />
                                                {t('wrestler.severance_pay')}: <strong className="font-mono">¥{severancePay.toLocaleString()}</strong>
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1 text-xs"
                                                    onClick={() => setIsRetiring(false)}
                                                >
                                                    {t('common.cancel')}
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    className="flex-1 text-xs bg-red-600 hover:bg-red-700 border-red-700 text-white"
                                                    onClick={() => {
                                                        if (activeSelectedWrestler) onRetireWrestler(activeSelectedWrestler.id);
                                                        setIsRetiring(false);
                                                    }}
                                                >
                                                    {t('cmd.retire_confirm')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <span className="text-2xl opacity-50">?</span>
                            </div>
                            <p className="text-sm">{t('sidebar.no_selection')}</p>
                            <p className="text-xs mt-2 opacity-70">{t('sidebar.select_instruction')}</p>

                            {/* Daily Matches Tab Content */}
                            {gamePhase === 'tournament' && (
                                <div className="mt-8 w-full">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2">{t('sidebar.todays_matches')}</div>
                                    <DailyMatchList
                                        matchups={todaysMatchups}
                                        onAdvice={() => { }}
                                        currentTp={trainingPoints}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {activeSelectedWrestler && (
                <>
                    <ShikonaChangeModal
                        isOpen={showRenameModal}
                        onClose={() => setShowRenameModal(false)}
                        wrestler={activeSelectedWrestler}
                        currentTp={trainingPoints}
                        onRename={(id, newName, newReading) => {
                            renameWrestler(id, newName, newReading);
                            setShowRenameModal(false);
                        }}
                    />
                    <SkillBookModal
                        isOpen={showSkillBookModal}
                        onClose={() => setShowSkillBookModal(false)}
                        selectedWrestlerId={activeSelectedWrestler.id}
                    />
                </>
            )}
        </>
    );
};
