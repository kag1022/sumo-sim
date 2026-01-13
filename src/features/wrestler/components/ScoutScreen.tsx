
import React, { useState } from 'react';
import { Candidate } from '../../../types';
import { getGrade } from '../logic/scouting';
import { useGame } from '../../../context/GameContext';
import { useTranslation } from 'react-i18next';
import { Leaf } from 'lucide-react';
import { CandidateCard } from './CandidateCard';
import { InspectionModal } from './InspectionModal';

interface ScoutScreenProps {
    candidates: Candidate[];
    funds: number;
    currentCount: number;
    limit: number;
    onRecruit: (candidate: Candidate, customName?: string) => void;
    onInspect: (cost: number) => void;
    onClose: () => void;
}

const ScoutScreen: React.FC<ScoutScreenProps> = ({ candidates, funds, currentCount, limit, onRecruit, onInspect, onClose }) => {
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const INSPECTION_FEE = 300000;

    const { reputation } = useGame();
    const { t } = useTranslation();

    const handleInspect = (candidate: Candidate) => {
        if (funds < INSPECTION_FEE) return;
        onInspect(INSPECTION_FEE);
        setSelectedCandidate(candidate);
    };

    const handleRecruit = (customName: string) => {
        if (selectedCandidate) {
            onRecruit(selectedCandidate, customName);
            setSelectedCandidate(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            
            {selectedCandidate && (
                <InspectionModal 
                    candidate={selectedCandidate}
                    onApprove={handleRecruit}
                    onReject={() => setSelectedCandidate(null)}
                />
            )}

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
                                {t(`scout.rank_desc.${getGrade(reputation).toLowerCase()}`, { defaultValue: '' })}
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
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] custom-scrollbar">
                    {candidates.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Leaf className="w-16 h-16 mb-4 text-green-200/50" />
                            <div className="font-serif font-bold text-xl mb-2">{t('scout.no_candidates')}</div>
                            <p className="text-sm">{t('scout.wait_next_week')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {candidates.map(c => (
                                <CandidateCard
                                    key={c.id}
                                    candidate={c}
                                    funds={funds}
                                    inspectionFee={INSPECTION_FEE}
                                    isFull={currentCount >= limit}
                                    onInspect={handleInspect}
                                />
                            ))}
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

export default ScoutScreen;
