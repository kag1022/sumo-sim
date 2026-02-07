
import React, { useState } from 'react';
import { Candidate } from '../../../types';
import { useTranslation } from 'react-i18next';
import { RadarChart } from '../../../components/ui/RadarChart';
import { getGrade } from '../../wrestler/logic/scouting';
import { useGame } from '../../../context/GameContext';
import ModalShell from '../../../components/ui/ModalShell';

interface InspectionModalProps {
    candidate: Candidate;
    onApprove: (customName: string) => void;
    onReject: () => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({ candidate, onApprove, onReject }) => {
    const { t, i18n } = useTranslation();
    const [customName, setCustomName] = useState(candidate.name);
    const [isApproved, setIsApproved] = useState(false);
    
    // Simulate initial loading (inspection)
    const [isReady, setIsReady] = useState(false);
    
    // Get prefix for shikona hint
    const { heyas } = useGame();
    const playerHeya = heyas.find(h => h.id === 'player_heya');
    const stablePrefix = playerHeya?.shikonaPrefix || '';

    React.useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleApprove = () => {
        setIsApproved(true);
        // Delay callback to show animation
        setTimeout(() => {
            onApprove(customName);
        }, 1200);
    };

    const getFlexibilityText = (val: number) => {
        if (val >= 80) return t('flexibility.very_soft');
        if (val >= 60) return t('flexibility.soft');
        if (val >= 40) return t('flexibility.normal');
        return t('flexibility.stiff');
    };

    const renderPotential = (val: number, large: boolean = false) => {
        const grade = getGrade(val);
        let color = "text-stone-500";
        if (grade === 'S') color = "text-[#b7282e]";
        if (grade === 'A') color = "text-amber-600";
        if (grade === 'B') color = "text-amber-500";
        return <span className={`font-black font-serif ${color} ${large ? 'text-5xl' : 'text-xl'}`}>{grade}</span>;
    };

    return (
        <ModalShell
            onClose={onReject}
            header={<></>}
            size="sm"
            className="max-w-lg border-2 border-[#b7282e]"
            bodyClassName="flex flex-col"
            overlayClassName="z-[200] bg-black/60"
        >
                
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

                {/* Header: File Tab Style */}
                <div className="bg-[#b7282e] p-4 text-center border-b-4 border-[#8c1c22] relative z-20">
                    <h3 className="text-2xl font-black font-serif text-white tracking-widest">{t('scout.inspection_report')}</h3>
                    <div className="text-white/60 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">{t('scout.inspection_record')}</div>
                </div>

                {!isReady ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 border-8 border-stone-200 border-t-[#b7282e] rounded-full animate-spin mx-auto mb-8" />
                        <h3 className="text-xl font-serif font-bold text-slate-700 mb-2">{t('scout.inspection_underway')}</h3>
                        <p className="text-slate-400 text-sm">{t('scout.checking_health')}</p>
                    </div>
                ) : (
                    <div className="p-6 sm:p-8 animate-fadeIn relative">
                        {/* Hanko Animation */}
                        {isApproved && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 z-50 pointer-events-none animate-stamp">
                                <div className="w-full h-full border-8 border-[#b7282e] rounded-full flex flex-col items-center justify-center -rotate-12 opacity-90 backdrop-blur-[1px] bg-[#b7282e]/5 mask-stamp shadow-xl">
                                    <span className="text-[#b7282e] font-black font-serif text-5xl tracking-widest leading-none drop-shadow-md">{t('scout.passed')}</span>
                                    <div className="w-32 h-0.5 bg-[#b7282e] my-2"></div>
                                    <span className="text-[#b7282e] text-sm font-bold uppercase tracking-widest">{t('scout.passed_stamp')}</span>
                                </div>
                            </div>
                        )}

                        {/* Top Info Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 text-stone-700 text-sm border-b-2 border-stone-200 pb-6 border-dashed relative z-10">
                            <div>
                                <div className="text-[10px] font-bold text-[#b7282e] uppercase mb-1">{t('scout.name_label')}</div>
                                <div className="font-serif font-bold text-xl leading-none">{i18n.language === 'en' ? candidate.reading : candidate.name}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-[#b7282e] uppercase mb-1">{t('scout.age_origin_label')}</div>
                                <div className="font-bold">{candidate.age}{i18n.language === 'en' ? '' : '歳'} / {t(`origin.${candidate.origin}`)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-[#b7282e] uppercase mb-1">{t('scout.physique_label')}</div>
                                <div className="font-mono font-bold text-lg">{candidate.height}cm / {candidate.weight}kg</div>
                            </div>
                            
                            {/* Stats Summary Box */}
                            <div className="col-span-2 mt-2 bg-stone-100 p-3 rounded-sm border border-stone-200 flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 mb-1">{t('scout.potential_label')}</div>
                                    {renderPotential(candidate.potential, true)}
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-stone-500 uppercase">{t('scout.flexibility_label')}</div>
                                    <div className="font-bold text-stone-700">{getFlexibilityText(candidate.flexibility)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Radar Chart Section */}
                        <div className="flex justify-center mb-6 py-2">
                             <RadarChart 
                                stats={{ m: candidate.stats.mind, t: candidate.stats.technique, b: candidate.stats.body }}
                                labels={[t('stats.mind'), t('stats.tech'), t('stats.body')]}
                                size={140}
                             />
                        </div>

                        {/* Naming Section */}
                        <div className="mb-8 relative z-10">
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
                                autoFocus={isReady && !isApproved}
                                disabled={isApproved}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 relative z-10">
                            <button
                                onClick={onReject}
                                disabled={isApproved}
                                className="flex-1 py-3 px-4 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-sm transition-colors border border-transparent hover:border-slate-200 disabled:opacity-50"
                            >
                                {t('scout.reject')}
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={!customName || isApproved}
                                className="flex-1 bg-[#b7282e] text-white font-bold py-3 px-4 rounded-sm shadow-md hover:bg-[#a01e23] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                <span>{t('scout.approve_join')}</span>
                                <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                )}
        </ModalShell>
    );
};
