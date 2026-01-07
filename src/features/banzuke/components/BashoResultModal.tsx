
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Wrestler, Rank } from '../../../types';
import { formatRank } from '../../../utils/formatting';
import { RANK_VALUE_MAP } from '../../../utils/constants';

interface BashoResultModalProps {
    wrestlers: Wrestler[];
    onClose: () => void;
}

// Strict Score Calculation
const getRankScore = (rank: Rank, rankNumber: number, rankSide: string): number => {
    const base = RANK_VALUE_MAP[rank] || 0;
    const sideBonus = rankSide === 'East' ? 0.5 : 0;
    return base - rankNumber + sideBonus;
};

const BashoResultModal: React.FC<BashoResultModalProps> = ({ wrestlers, onClose }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'Makuuchi' | 'Juryo' | 'Lower'>('Makuuchi');

    // Filter and Sort Data
    const { makuuchi, juryo, lower, promoted } = useMemo(() => {
        const sorted = [...wrestlers].sort((a, b) => {
            const valA = getRankScore(a.rank, a.rankNumber || 1, a.rankSide || 'East');
            const valB = getRankScore(b.rank, b.rankNumber || 1, b.rankSide || 'East');
            return valB - valA; // Descending
        });

        const makuuchiList = sorted.filter(w => ['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(w.rank));
        const juryoList = sorted.filter(w => w.rank === 'Juryo');
        const lowerList = sorted.filter(w => !['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira', 'Juryo'].includes(w.rank));

        const promotedList = sorted.filter(w => {
            const last = w.history[w.history.length - 1];
            if (!last) return false;

            // Safe access using Rank type or casting if needed
            const lastRank: Rank = last.rank;

            const oldVal = getRankScore(lastRank, last.rankNumber, last.rankSide);
            const newVal = getRankScore(w.rank, w.rankNumber || 1, w.rankSide || 'East');

            return (newVal > oldVal) && w.isSekitori;
        });

        return { makuuchi: makuuchiList, juryo: juryoList, lower: lowerList, promoted: promotedList };
    }, [wrestlers]);

    const activeList = activeTab === 'Makuuchi' ? makuuchi : activeTab === 'Juryo' ? juryo : lower;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-[#fcf9f2] w-full max-w-5xl max-h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col border border-stone-300">

                {/* Header */}
                <div className="bg-white p-6 shrink-0 border-b-4 border-[#b7282e] flex justify-between items-end relative overflow-hidden">
                    {/* Watermark */}
                    <span className="absolute -bottom-4 -right-4 text-9xl text-stone-50 font-serif opacity-50 select-none z-0">番付</span>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-black font-serif text-[#b7282e] tracking-tight mb-1 flex items-center gap-3">
                            <span className="w-2 h-8 bg-[#b7282e]"></span>
                            {t('basho_result.title')}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 tracking-[0.2em] pl-5">OFFICIAL BANZUKE ANNOUNCEMENT</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="relative z-10 bg-slate-800 text-white px-6 py-2 rounded-sm text-sm font-bold hover:bg-slate-700 transition-colors shadow-md"
                    >
                        {t('cmd.close')}
                    </button>
                </div>

                {/* Flash News */}
                {promoted.length > 0 && (
                    <div className="bg-slate-100 p-3 shrink-0 border-b border-slate-200 overflow-x-auto custom-scrollbar">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center bg-red-600 text-white px-3 py-1 rounded-sm font-bold text-[10px] shadow leading-tight text-center">
                                <span>FLASH</span>
                                <span>NEWS</span>
                            </div>
                            {promoted.slice(0, 10).map(w => {
                                const last = w.history[w.history.length - 1];
                                const oldRank = last ? last.rank : ('MaeZumo' as any);

                                let tag = t('trend.up');
                                let tagColor = 'text-amber-600 bg-amber-50 border-amber-200';

                                if (w.rank === 'Yokozuna' && oldRank !== 'Yokozuna') { tag = t('news.promote_yokozuna'); tagColor = 'text-purple-700 bg-purple-50 border-purple-200'; }
                                else if (w.rank === 'Ozeki' && oldRank !== 'Ozeki') { tag = t('news.promote_ozeki'); tagColor = 'text-red-700 bg-red-50 border-red-200'; }
                                else if (['Sekiwake', 'Komusubi'].includes(w.rank) && !['Sekiwake', 'Komusubi', 'Ozeki', 'Yokozuna'].includes(oldRank)) tag = t('news.promote_sanyaku');
                                else if (w.rank === 'Maegashira' && ['Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi', 'MaeZumo'].includes(oldRank)) { tag = t('news.promote_makuuchi'); tagColor = 'text-indigo-700 bg-indigo-50 border-indigo-200'; }
                                else if (w.rank === 'Juryo' && ['Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi', 'MaeZumo'].includes(oldRank)) tag = t('news.promote_juryo');

                                return (
                                    <div key={w.id} className="bg-white border border-slate-200 rounded-sm p-1.5 min-w-[160px] flex items-center gap-3 shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-serif font-bold text-sm">
                                            {w.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 border px-1 rounded-sm inline-block ${tagColor}`}>{tag}</div>
                                            <div className="text-xs font-bold text-slate-800 leading-tight truncate font-serif">{w.name}</div>
                                            <div className="text-[9px] text-slate-400 truncate">{t(`rank.${oldRank}`) || oldRank} → {t(`rank.${w.rank}`) || w.rank}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex bg-white border-b border-slate-200 font-bold text-sm shrink-0 px-4 pt-4 gap-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                    {['Makuuchi', 'Juryo', 'Lower'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2 rounded-t-sm border-t border-x border-b-0 transition-all ${activeTab === tab
                                ? 'bg-[#fcf9f2] text-[#b7282e] border-slate-300 border-b-[#fcf9f2] -mb-px pt-3 pb-2.5'
                                : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                        >
                            {tab === 'Makuuchi' ? t('rank.Maegashira') : tab === 'Juryo' ? t('rank.Juryo') : t('basho_result.division')}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#fcf9f2]">
                    {/* Paper Texture Overlay */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeList.map((w) => {
                            const last = w.history[w.history.length - 1];
                            const oldRank = last ? last.rank : ('MaeZumo' as any);

                            const newVal = getRankScore(w.rank, w.rankNumber || 1, w.rankSide || 'East');
                            const oldVal = getRankScore(oldRank, last ? (last.rankNumber || 1) : 1, last ? (last.rankSide || 'East') : 'East');

                            let status = 'stay';
                            if (!last) status = 'new';
                            else if (newVal > oldVal) status = 'up';
                            else if (newVal < oldVal) status = 'down';

                            // Format old rank
                            const oldRankStr = formatRank(oldRank, last ? last.rankSide : 'East', last ? last.rankNumber : 1);

                            return (
                                <div key={w.id} className={`
                                    relative flex items-center p-3 rounded-sm border shadow-sm transition-all hover:shadow-md
                                    ${w.heyaId === 'player_heya' ? 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-300' : 'bg-white border-slate-200'}
                                `}>
                                    {/* Vertical Rank Line */}
                                    <div className={`
                                        absolute left-0 top-0 bottom-0 w-1 rounded-l-sm
                                        ${status === 'up' ? 'bg-red-500' : status === 'down' ? 'bg-blue-400' : 'bg-slate-200'}
                                    `}></div>

                                    {/* Rank Change Indicator */}
                                    <div className="w-8 flex flex-col items-center justify-center pl-2">
                                        {status === 'up' && <span className="text-red-500 text-xs shadow-sm bg-white rounded-full p-0.5">▲</span>}
                                        {status === 'down' && <span className="text-blue-400 text-xs shadow-sm bg-white rounded-full p-0.5">▼</span>}
                                        {status === 'stay' && <span className="text-slate-300 text-xs">-</span>}
                                        {status === 'new' && <span className="text-[9px] font-bold text-amber-500 border border-amber-500 px-1 rounded-sm bg-white">新</span>}
                                    </div>

                                    {/* Detail */}
                                    <div className="flex-1 min-w-0 ml-2">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <div className="font-bold font-serif text-slate-900 truncate pr-2" title={w.name}>
                                                {w.name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {last ? `${last.wins}-${last.losses}` : '---'}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs">
                                            <div className={`font-serif font-bold leading-none ${['Yokozuna', 'Ozeki'].includes(w.rank) ? 'text-[#b7282e]' : 'text-slate-600'}`}>
                                                {formatRank(w.rank, w.rankSide, w.rankNumber)}
                                            </div>

                                            {/* Diff */}
                                            {(status === 'up' || status === 'down') && oldRank !== 'MaeZumo' && (
                                                <div className={`text-[9px] font-mono px-1 rounded-sm ${status === 'up' ? 'text-red-600 bg-red-50' : 'text-blue-500 bg-blue-50'}`}>
                                                    from {t(`rank.${oldRank}`)[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {w.heyaId === 'player_heya' && (
                                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BashoResultModal;
