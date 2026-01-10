
import React, { useState } from 'react';
import { Candidate } from '../../../types';
import { getGrade } from '../logic/scouting';
import { useGame } from '../../../context/GameContext';
import { useTranslation } from 'react-i18next';
import { Leaf } from 'lucide-react';

interface ScoutPanelProps {
    candidates: Candidate[];
    funds: number;
    currentCount: number;
    limit: number;
    onRecruit: (candidate: Candidate, customName?: string) => void;
    onInspect: (cost: number) => void;
    onClose: () => void;
}

const ScoutPanel: React.FC<ScoutPanelProps> = ({ candidates, funds, currentCount, limit, onRecruit, onInspect, onClose }) => {
    // Modal State
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isExamining, setIsExamining] = useState(false);
    const [examPassed, setExamPassed] = useState(false);
    const [customName, setCustomName] = useState('');
    const INSPECTION_FEE = 300000;

    const { heyas, reputation } = useGame();
    const { t, i18n } = useTranslation();
    const playerHeya = heyas.find(h => h.id === 'player_heya');
    const stablePrefix = playerHeya ? playerHeya.shikonaPrefix : '';

    const handleInspectClick = (candidate: Candidate) => {
        if (funds < INSPECTION_FEE) return;

        // Pay Fee
        onInspect(INSPECTION_FEE);

        // Start Exam UI
        setIsExamining(true);
        setSelectedCandidate(candidate);
        setCustomName(candidate.name);

        // Simulate Exam Delay
        setTimeout(() => {
            setExamPassed(true);
        }, 1500);
    };

    const handleConfirmJoin = () => {
        if (selectedCandidate) {
            onRecruit(selectedCandidate, customName);
            setSelectedCandidate(null);
            setIsExamining(false);
            setExamPassed(false);
        }
    };

    const handleCancel = () => {
        setSelectedCandidate(null);
        setIsExamining(false);
        setExamPassed(false);
    };

    const getFlexibilityText = (val: number, revealed: boolean) => {
        if (!revealed) return t('flexibility.unknown');
        if (val >= 80) return t('flexibility.very_soft');
        if (val >= 60) return t('flexibility.soft');
        if (val >= 40) return t('flexibility.normal');
        return t('flexibility.stiff');
    };

    const renderPotential = (val: number, revealed: boolean, large: boolean = false) => {
        if (!revealed) return <span className="text-stone-300 font-bold">???</span>;
        const grade = getGrade(val);
        let color = "text-stone-500";
        if (grade === 'S') color = "text-[#b7282e]";
        if (grade === 'A') color = "text-amber-600";
        if (grade === 'B') color = "text-amber-500";
        return <span className={`font-black font-serif ${color} ${large ? 'text-5xl' : 'text-xl'}`}>{grade}</span>;
    };

    // --- Modal Content (Recruitment Form) ---
    const renderModal = () => {
        if (!selectedCandidate) return null;

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
                <div className="bg-[#fcf9f2] rounded-sm shadow-2xl max-w-lg w-full overflow-hidden border-2 border-slate-300 relative">

                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

                    {/* Header: File Tab Style */}
                    <div className="bg-[#b7282e] p-4 text-center border-b-4 border-[#8c1c22]">
                        <h3 className="text-2xl font-black font-serif text-white tracking-widest">{t('scout.inspection_report')}</h3>
                        <div className="text-white/60 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">Inspection Record</div>
                    </div>

                    {!examPassed ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 border-8 border-stone-200 border-t-[#b7282e] rounded-full animate-spin mx-auto mb-8" />
                            <h3 className="text-xl font-serif font-bold text-slate-700 mb-2">{t('scout.inspection_underway')}</h3>
                            <p className="text-slate-400 text-sm">{t('scout.checking_health')}</p>
                        </div>
                    ) : (
                        <div className="p-8 animate-fadeIn">
                            {/* Stamp */}
                            <div className="absolute top-20 right-8 w-24 h-24 border-4 border-[#b7282e] rounded-full flex flex-col items-center justify-center -rotate-12 opacity-80 mask-stamp">
                                <span className="text-[#b7282e] font-black font-serif text-3xl">{t('scout.passed')}</span>
                                <span className="text-[#b7282e] text-[10px] font-bold uppercase border-t border-[#b7282e] w-16 text-center mt-1">PASSED</span>
                            </div>

                            {/* Candidate Info Grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-stone-700 text-sm border-b-2 border-stone-200 pb-6 border-dashed">
                                <div>
                                    <div className="text-[10px] font-bold text-[#b7282e] uppercase mb-1">NAME</div>
                                    <div className="font-serif font-bold text-xl leading-none">{i18n.language === 'en' ? selectedCandidate.reading : selectedCandidate.name}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-[#b7282e] uppercase mb-1">AGE / ORIGIN</div>
                                    <div className="font-bold">{selectedCandidate.age}{i18n.language === 'en' ? '' : '歳'} / {t(`origin.${selectedCandidate.origin}`)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-[#b7282e] uppercase mb-1">PHYSIQUE</div>
                                    <div className="font-mono font-bold text-lg">{selectedCandidate.height}cm / {selectedCandidate.weight}kg</div>
                                </div>
                                <div className="col-span-2 mt-2 bg-stone-100 p-3 rounded-sm border border-stone-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 mb-1">{t('scout.current_rank')}</div>
                                            {renderPotential(selectedCandidate.potential, true, true)}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-stone-500 uppercase">FLEXIBILITY</div>
                                            <div className="font-bold text-stone-700">{getFlexibilityText(selectedCandidate.flexibility, true)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Naming Section */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                    {t('scout.shikona_registration')}
                                    <span className="ml-2 text-[#b7282e] font-normal normal-case text-[10px]">
                                        {t('scout.shikona_prefix_hint', { prefix: stablePrefix })}
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-white border-b-2 border-stone-300 px-4 py-2 text-slate-900 font-serif font-bold text-2xl focus:outline-none focus:border-[#b7282e] transition-colors text-center placeholder:text-stone-200"
                                    placeholder={t('scout.placeholder_example')}
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 py-3 px-4 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-sm transition-colors border border-transparent hover:border-slate-200"
                                >
                                    {t('scout.reject')}
                                </button>
                                <button
                                    onClick={handleConfirmJoin}
                                    disabled={!customName}
                                    className="flex-1 bg-[#b7282e] text-white font-bold py-3 px-4 rounded-sm shadow-md hover:bg-[#a01e23] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <span>{t('scout.approve_join')}</span>
                                    <span className="text-xs">→</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            {isExamining && renderModal()}

            <div className="bg-[#fcf9f2] w-full max-w-6xl h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col border border-stone-400 relative">

                {/* Header Section */}
                <div className="bg-white p-6 shrink-0 border-b border-stone-300 flex justify-between items-end shadow-sm z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="bg-[#b7282e] text-white text-xs font-bold px-2 py-0.5 rounded-sm">{t('scout.dept_name')}</span>
                            <h2 className="text-3xl font-black font-serif text-slate-900 tracking-tight">{t('scout.title')}</h2>
                        </div>
                        <p className="text-xs text-slate-500 font-bold tracking-[0.15em] uppercase pl-1">{t('scout.subtitle')}</p>
                    </div>

                    {/* Reputation Rank Display */}
                    <div className="flex-1 flex justify-center items-end pb-1">
                        <div className="bg-stone-50 px-6 py-2 rounded-sm border border-stone-200 text-center">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t('scout.current_rank_label')}</div>
                            <div className="flex items-baseline gap-2 justify-center">
                                <span className={`font-serif font-black text-3xl leading-none ${getGrade(reputation) === 'S' ? 'text-amber-500 drop-shadow-sm' : getGrade(reputation) === 'A' ? 'text-[#b7282e]' : getGrade(reputation) === 'B' ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {getGrade(reputation)}
                                </span>
                                <span className="font-bold text-slate-600 text-sm">{t('scout.rank_suffix')}</span>
                                <span className="text-xs text-slate-400 ml-1">{t('scout.reputation_prefix')} {reputation}{t('scout.reputation_suffix')}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 font-bold">
                                {t(`scout.rank_desc.${getGrade(reputation).toLowerCase()}`)}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-end gap-4 mb-1">
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right">{t('scout.funds_label')}</div>
                                <div className={`font-mono font-bold text-2xl leading-none ${funds < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                    ¥{funds.toLocaleString()}
                                </div>
                            </div>
                            <div className="w-px h-8 bg-stone-200"></div>
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right">{t('scout.members_label')}</div>
                                <div className="font-mono font-bold text-xl leading-none text-slate-600">
                                    {currentCount} <span className="text-sm text-slate-400">/ {limit}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                    {candidates.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Leaf className="w-16 h-16 mb-4 text-green-200/50" />
                            <div className="font-serif font-bold text-xl mb-2">{t('scout.no_candidates')}</div>
                            <p className="text-sm">{t('scout.wait_next_week')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {candidates.map(c => {
                                const canAffordFee = funds >= INSPECTION_FEE;
                                const isFull = currentCount >= limit;
                                const isRevealed = false;

                                return (
                                    <div key={c.id} className="bg-white rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 group ring-1 ring-slate-200 hover:ring-[#b7282e] flex flex-col relative overflow-hidden">

                                        {/* Top Accent Line */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#b7282e] transition-colors"></div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1 uppercase tracking-wider border border-slate-200">
                                                        {t(`scout.background.${c.background}`)}
                                                    </span>
                                                    <h3 className="text-xl font-bold font-serif text-slate-900 leading-tight group-hover:text-[#b7282e] transition-colors">
                                                        {i18n.language === 'en' ? c.reading : c.name}
                                                    </h3>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-slate-200 font-serif leading-none italic select-none">??</div>
                                                </div>
                                            </div>

                                            {/* Body Stats */}
                                            <div className="flex items-center gap-4 text-sm font-mono font-bold text-slate-600 mb-6 pb-4 border-b border-dashed border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-slate-400 font-sans uppercase">HEIGHT</span>
                                                    {c.height}cm
                                                </div>
                                                <div className="w-px h-6 bg-slate-100"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-slate-400 font-sans uppercase">WEIGHT</span>
                                                    {c.weight}kg
                                                </div>
                                                <div className="w-px h-6 bg-slate-100"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-slate-400 font-sans uppercase">AGE</span>
                                                    {c.age}
                                                </div>
                                            </div>

                                            {/* Hidden Potential Hint */}
                                            <div className="space-y-2 mb-4 flex-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-slate-400">素質</span>
                                                    {renderPotential(c.potential, isRevealed)}
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-slate-400">柔軟性</span>
                                                    <span className="font-bold text-stone-300">???</span>
                                                </div>
                                            </div>

                                            {/* Cost Display */}
                                            <div className="text-right mb-4">
                                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('scout.contract_fee_label')}</div>
                                                <div className="font-mono font-bold text-lg text-slate-700">
                                                    ¥{c.scoutCost.toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={() => handleInspectClick(c)}
                                                disabled={!canAffordFee || isFull}
                                                className={`
                                                    w-full py-3 rounded-sm font-bold text-sm shadow-sm transition-all flex justify-center items-center gap-2 group/btn
                                                    ${!canAffordFee || isFull
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        : 'bg-slate-800 text-white hover:bg-[#b7282e] hover:shadow-md'
                                                    }
                                                `}
                                            >
                                                <span>{isFull ? t('scout.full') : !canAffordFee ? t('scout.no_funds') : t('scout.inspect_action')}</span>
                                                {canAffordFee && !isFull && (
                                                    <span className="text-[10px] font-normal opacity-70 group-hover/btn:opacity-100">
                                                        (¥{(INSPECTION_FEE / 10000)}万)
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-stone-200 text-center shrink-0 z-10">
                    <button onClick={onClose} className="font-bold text-slate-500 hover:text-slate-800 transition-colors text-sm tracking-widest border-b border-transparent hover:border-slate-800 pb-0.5">
                        {t('scout.close_panel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoutPanel;
