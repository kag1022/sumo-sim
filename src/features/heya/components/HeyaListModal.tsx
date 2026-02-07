import React from 'react';
import { useGame } from '../../../context/GameContext';
import { useTranslation } from 'react-i18next';
import { Milestone } from 'lucide-react';
import ModalShell from '../../../components/ui/ModalShell';

interface HeyaListModalProps {
    isOpen: boolean;
    onClose: (() => void);
}

export const HeyaListModal: React.FC<HeyaListModalProps> = ({ isOpen, onClose }) => {
    const { heyas } = useGame();
    const { t, i18n } = useTranslation();

    if (!isOpen) return null;

    // Filter out player heya if needed, or show all. Usually "Directory" shows all.
    const sortedHeyas = [...heyas].sort((a, b) => b.strengthMod - a.strengthMod);

    const getHeyaRank = (mod: number) => {
        if (mod >= 1.5) return 'S';
        if (mod >= 1.2) return 'A';
        if (mod >= 1.0) return 'B';
        return 'C';
    };

    const getRankStyle = (rank: string) => {
        switch (rank) {
            case 'S': return 'bg-amber-100/50 border-amber-300';
            case 'A': return 'bg-red-50/50 border-red-200';
            case 'B': return 'bg-blue-50/50 border-blue-200';
            default: return 'bg-white border-stone-200';
        }
    };

    const getRankBadgeColor = (rank: string) => {
        switch (rank) {
            case 'S': return 'bg-amber-500 text-white';
            case 'A': return 'bg-red-600 text-white';
            case 'B': return 'bg-blue-500 text-white';
            default: return 'bg-slate-400 text-white';
        }
    };

    const getSpecialtyColor = (spec: string) => {
        switch (spec) {
            case 'Power': return 'bg-red-100 text-red-800 border-red-200';
            case 'Tech': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Stamina': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <ModalShell
            onClose={onClose}
            header={<></>}
            className="max-w-5xl h-[85vh] border border-[#b7282e]"
            bodyClassName="flex flex-col h-full"
            overlayClassName="z-[100] bg-black/60"
        >

                {/* Header */}
                <div className="bg-white p-5 shrink-0 border-b border-stone-300 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <span className="bg-stone-800 text-white text-xs font-bold px-2 py-0.5 rounded-sm">DATA</span>
                        <h2 className="text-2xl font-black font-serif text-slate-900 tracking-tight">{t('heya_list.title')}</h2>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Total: {heyas.length} Stables
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedHeyas.map((heya) => {
                            const rank = getHeyaRank(heya.strengthMod);
                            return (
                                <div key={heya.id} className={`${getRankStyle(rank)} rounded-sm shadow-sm border p-4 transition-all hover:shadow-md hover:border-slate-400 relative overflow-hidden group`}>
                                    {/* Decor line */}
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${heya.id === 'player_heya' ? 'bg-[#b7282e]' : rank === 'S' ? 'bg-amber-400' : 'bg-transparent'}`}></div>

                                    <div className="pl-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">{t('heya_list.founded')} {heya.foundedYear}</div>
                                                <h3 className="text-lg font-bold font-serif text-slate-900 leading-none">
                                                    {i18n.language === 'en' ? heya.nameEn : heya.name}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className={`${getRankBadgeColor(rank)} px-2 py-1 flex items-center justify-center font-bold text-xs leading-none shadow-sm rounded-sm whitespace-nowrap`}>
                                                    {t(`heya_list.rank.${rank}`)}
                                                </div>
                                                {heya.id === 'player_heya' && (
                                                    <span className="bg-[#b7282e] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">YOU</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Oyakata & Location */}
                                        <div className="mb-3 text-sm text-slate-600 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Milestone className="w-3 h-3 text-slate-400" />
                                                <span className="font-bold">{heya.oyakataName || '---'}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 pl-5">
                                                {heya.location || 'Unknown Location'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSpecialtyColor(heya.specialty)}`}>
                                                {t(`heya_list.specialty_types.${heya.specialty}`)}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">
                                                Lv.{heya.facilityLevel}
                                            </span>
                                        </div>

                                        <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                                            <div className="text-xs text-slate-500">
                                                <span className="font-bold">{t('heya_list.wrestlers')}:</span> {heya.wrestlerCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-stone-200 text-center shrink-0 z-10">
                    <button onClick={onClose} className="font-bold text-slate-500 hover:text-slate-800 transition-colors text-sm tracking-widest border-b border-transparent hover:border-slate-800 pb-0.5">
                        {t('heya_list.close')}
                    </button>
                </div>
        </ModalShell>
    );
};
