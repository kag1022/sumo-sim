
import React from 'react';
import { Candidate } from '../../../types';
import { useTranslation } from 'react-i18next';

interface CandidateCardProps {
    candidate: Candidate;
    funds: number;
    inspectionFee: number;
    isFull: boolean;
    onInspect: (candidate: Candidate) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, funds, inspectionFee, isFull, onInspect }) => {
    const { t, i18n } = useTranslation();
    const canAffordFee = funds >= inspectionFee;

    const renderPotential = (_val: number) => {
        // Obscured until inspection
        return <span className="text-stone-300 font-bold">???</span>;
    };

    return (
        <div className="bg-white rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 group ring-1 ring-slate-200 hover:ring-[#b7282e] flex flex-col relative overflow-hidden">
            
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#b7282e] transition-colors"></div>

            <div className="p-5 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1 uppercase tracking-wider border border-slate-200">
                            {t(`scout.background.${candidate.background}`)}
                        </span>
                        <h3 className="text-xl font-bold font-serif text-slate-900 leading-tight group-hover:text-[#b7282e] transition-colors line-clamp-1" title={i18n.language === 'en' ? candidate.reading : candidate.name}>
                            {i18n.language === 'en' ? candidate.reading : candidate.name}
                        </h3>
                    </div>
                    {/* Visual Placeholder for Silhouette/Icon */}
                    <div className="text-right">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-300 font-serif font-black italic select-none border border-stone-200">
                            ?
                        </div>
                    </div>
                </div>

                {/* Body Stats */}
                <div className="flex items-center gap-4 text-sm font-mono font-bold text-slate-600 mb-6 pb-4 border-b border-dashed border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-sans uppercase">{t('scout.height_label')}</span>
                        {candidate.height}cm
                    </div>
                    <div className="w-px h-6 bg-slate-100"></div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-sans uppercase">{t('scout.weight_label')}</span>
                        {candidate.weight}kg
                    </div>
                    <div className="w-px h-6 bg-slate-100"></div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-sans uppercase">{t('scout.age_label_simple')}</span>
                        {candidate.age}
                    </div>
                </div>

                {/* Hidden Potential Hint */}
                <div className="space-y-2 mb-4 flex-1">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400">{t('scout.potential_label')}</span>
                        {renderPotential(candidate.potential)}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400">{t('scout.flexibility_label')}</span>
                        <span className="font-bold text-stone-300">???</span>
                    </div>
                </div>

                {/* Cost Display */}
                <div className="text-right mb-4">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('scout.contract_fee_label')}</div>
                    <div className="font-mono font-bold text-lg text-slate-700">
                        ¥{candidate.scoutCost.toLocaleString()}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onInspect(candidate)}
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
                            {t('scout.inspect_cost_hint', { val: inspectionFee / 10000 })}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};
