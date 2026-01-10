import { useState } from 'react';
import { Wrestler } from '../../types';
import { useGame } from '../../context/GameContext';
import { useGameLoop } from '../../hooks/useGameLoop';
import { formatRank } from '../../utils/formatting';
import DailyMatchList from '../../features/match/components/DailyMatchList';
import Button from '../ui/Button';
import { Edit2, BookOpen, X } from 'lucide-react';
import { ShikonaChangeModal } from '../../features/heya/components/ShikonaChangeModal';
import { SkillBookModal } from '../../features/wrestler/components/SkillBookModal';
import { useTranslation } from 'react-i18next';
import { calculateSeverance } from '../../features/wrestler/logic/retirement'; // Re-added as it is used logic

interface SidebarProps {
    selectedWrestler: Wrestler | null;
    onRetireWrestler: (wrestlerId: string) => void;
    onClearSelection: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

// Simple Radar Chart Component
const RadarChart = ({ stats, labels }: { stats: { m: number, t: number, b: number }, labels: [string, string, string] }) => {
    // 0-100 scale. Center 50,50. Radius 40.
    const r = 40;

    // Axis 1: Top (Mind) - Angle -90 deg (or 270)
    // Axis 2: Bottom Right (Tech) - Angle 30 deg
    // Axis 3: Bottom Left (Body) - Angle 150 deg

    // Helper to get coords
    const getPoint = (value: number, angleDeg: number) => {
        // Actually typical svg: 0 is right. -90 is top.
        // wait, let's use standard trig with offset.
        // Angle 0 = Top: (c, c-r)
        // Let's manually calculcate for Triangle
        // Top: (50, 10)
        // Bot Right: (50 + r*sin(120), 50 - r*cos(120)) -> (50 + 34.6, 50 - (-20)) = (84.6, 70)
        // Bot Left: (50 - 34.6, 70) = (15.4, 70)

        // Let's use clean rotation.
        // 0 deg = Up. 120 deg = Right Down. 240 deg = Left Down.
        const normalized = Math.min(100, Math.max(0, value)) / 100;
        const dist = normalized * r;

        // Up (Mind)
        if (angleDeg === 0) return { x: 50, y: 50 - dist };
        // Right Down (Tech)
        if (angleDeg === 120) return { x: 50 + dist * 0.866, y: 50 + dist * 0.5 };
        // Left Down (Body)
        if (angleDeg === 240) return { x: 50 - dist * 0.866, y: 50 + dist * 0.5 };
        return { x: 50, y: 50 };
    };

    const pM = getPoint(stats.m, 0);
    const pT = getPoint(stats.t, 120);
    const pB = getPoint(stats.b, 240);

    const polyPoints = `${pM.x},${pM.y} ${pT.x},${pT.y} ${pB.x},${pB.y}`;

    const bgM = getPoint(100, 0);
    const bgT = getPoint(100, 120);
    const bgB = getPoint(100, 240);
    const bgPoly = `${bgM.x},${bgM.y} ${bgT.x},${bgT.y} ${bgB.x},${bgB.y}`;

    return (
        <div className="relative w-32 h-32 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                {/* Background Triangle */}
                <polygon points={bgPoly} fill="#fcf9f2" stroke="#e2e8f0" strokeWidth="1" />
                {/* Mid lines */}
                <line x1="50" y1="50" x2={bgM.x} y2={bgM.y} stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1="50" y1="50" x2={bgT.x} y2={bgT.y} stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1="50" y1="50" x2={bgB.x} y2={bgB.y} stroke="#e2e8f0" strokeWidth="0.5" />

                {/* Data Polygon */}
                <polygon points={polyPoints} fill="rgba(183, 40, 46, 0.2)" stroke="#b7282e" strokeWidth="1.5" />

                {/* Dots */}
                <circle cx={pM.x} cy={pM.y} r="2" fill="#b7282e" />
                <circle cx={pT.x} cy={pT.y} r="2" fill="#amber-500" />
                <circle cx={pB.x} cy={pB.y} r="2" fill="#475569" />
            </svg>

            {/* Labels */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 bg-white/80 px-1 rounded">{labels[0]} {Math.floor(stats.m)}</div>
            <div className="absolute bottom-2 right-0 text-[10px] font-bold text-slate-500 bg-white/80 px-1 rounded">{labels[1]} {Math.floor(stats.t)}</div>
            <div className="absolute bottom-2 left-0 text-[10px] font-bold text-slate-500 bg-white/80 px-1 rounded">{labels[2]} {Math.floor(stats.b)}</div>
        </div>
    );
};

export const Sidebar = ({
    selectedWrestler,
    onRetireWrestler,
    // onClearSelection, // unused
    isOpen = false,
    onClose,
}: SidebarProps) => {
    const {
        wrestlers,
        gamePhase,
        todaysMatchups,
        trainingPoints // used for cost checks
    } = useGame();
    const { t, i18n } = useTranslation();

    const { renameWrestler } = useGameLoop();

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

    // Display Name Logic: Use reading (Romaji) if English mode, else Name (Kanji)
    const displayName = activeSelectedWrestler
        ? (i18n.language === 'en' && activeSelectedWrestler.reading ? activeSelectedWrestler.reading : activeSelectedWrestler.name)
        : '';

    // Drawer Logic
    const sidebarClasses = `
        fixed inset-y-0 right-0 z-[60]
        w-full sm:w-[26rem] md:w-[22rem] lg:w-[26rem]
        bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none md:shadow-none md:border-l md:border-slate-200
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
    `;

    // Overlay logic (Mobile only)
    const overlayClasses = `
        fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300
        md:hidden
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `;



    return (
        <>
            {/* Mobile Overlay */}
            <div className={overlayClasses} onClick={onClose} aria-hidden="true" />

            <div className={sidebarClasses}>
                <div className="h-full flex flex-col bg-slate-50 relative">

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full shadow-sm hover:bg-slate-100"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    {activeSelectedWrestler ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                            {/* Header Image / Background Pattern */}
                            <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/japanese-sayagata.png')]"></div>
                                <div className="absolute -bottom-12 left-6">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 shadow-md flex items-center justify-center text-4xl overflow-hidden">
                                        {/* Avatar Placeholder */}
                                        <span className="opacity-50">力</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-14 px-6 pb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold font-serif text-slate-800">{displayName}</h2>
                                        <div className="text-sm text-slate-500 font-mono mb-2">
                                            {formatRank(activeSelectedWrestler.rank)}
                                            <span className="mx-2">•</span>
                                            {activeSelectedWrestler.origin}
                                            <span className="mx-2">•</span>
                                            {activeSelectedWrestler.age || 18}{t('common.age_suffix')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowRenameModal(true)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                        title={t('cmd.rename')}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-white p-3 rounded-sm shadow-sm border border-slate-100">
                                        <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">{t('stats.height_weight')}</div>
                                        <div className="font-mono text-lg font-bold text-slate-700">
                                            {activeSelectedWrestler.height}cm / {activeSelectedWrestler.weight}kg
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-sm shadow-sm border border-slate-100">
                                        <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">{t('common.career_record')}</div>
                                        <div className="font-mono text-lg font-bold text-slate-700">
                                            {/* Placeholder for career record */}
                                            ---
                                        </div>
                                    </div>
                                </div>

                                {/* Radar Chart */}
                                <div className="mt-6">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">{t('stats.attributes')}</div>
                                    <RadarChart
                                        stats={{
                                            m: activeSelectedWrestler.stats.mind,
                                            t: activeSelectedWrestler.stats.technique,
                                            b: activeSelectedWrestler.stats.body
                                        }}
                                        labels={[t('stats.mind'), t('stats.technique'), t('stats.body')]}
                                    />
                                </div>

                                {/* Skills */}
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-xs font-bold text-slate-400 uppercase">{t('wrestler.skills')}</div>
                                        <button
                                            onClick={() => setShowSkillBookModal(true)}
                                            className="text-xs flex items-center gap-1 text-slate-500 hover:text-[#b7282e] transition-colors"
                                        >
                                            <BookOpen className="w-3 h-3" />
                                            {t('wrestler.skill_book')}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {activeSelectedWrestler.skills && activeSelectedWrestler.skills.length > 0 ? (
                                            activeSelectedWrestler.skills.map((skill, idx) => (
                                                <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">{t('wrestler.no_skills')}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Retirement Action */}
                                <div className="mt-8 pt-6 border-t border-slate-200">
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
