import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Wrestler, Rank } from '../types';
import { formatRank } from '../utils/formatting';
import { RANK_VALUE_MAP } from '../utils/constants';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#fcf9f2] w-full max-w-5xl max-h-[95vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-stone-600">

                {/* Header */}
                <div className="bg-[#b7282e] text-white p-4 shrink-0 relative overflow-hidden flex justify-between items-center shadow-lg z-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/japanese-sayagata.png')] opacity-20"></div>
                    <div>
                        <h2 className="text-4xl font-black font-serif tracking-tighter italic transform -skew-x-6 relative z-10 text-shadow-lg leading-none">
                            {t('basho_result.title')}
                        </h2>
                        <p className="text-xs font-bold tracking-widest opacity-90 mt-1 pl-1">OFFICIAL BANZUKE ANNOUNCEMENT</p>
                    </div>
                </div>

                {/* Flash News */}
                {promoted.length > 0 && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 shrink-0 shadow-inner overflow-x-auto custom-scrollbar">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center bg-red-600 text-white px-3 py-1 rounded font-bold text-sm shadow animate-pulse">
                                {t('basho_result.flash')}<br />NEWS
                            </div>
                            {promoted.slice(0, 10).map(w => {
                                const last = w.history[w.history.length - 1];
                                // Use any to bypass strict type check for now if Rank is elusive
                                const oldRank = last ? last.rank : ('MaeZumo' as any);

                                let tag = t('trend.up');
                                if (w.rank === 'Yokozuna' && oldRank !== 'Yokozuna') tag = t('news.promote_yokozuna');
                                else if (w.rank === 'Ozeki' && oldRank !== 'Ozeki') tag = t('news.promote_ozeki');
                                else if (['Sekiwake', 'Komusubi'].includes(w.rank) && !['Sekiwake', 'Komusubi', 'Ozeki', 'Yokozuna'].includes(oldRank)) tag = t('news.promote_sanyaku');
                                else if (w.rank === 'Maegashira' && ['Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi', 'MaeZumo'].includes(oldRank)) tag = t('news.promote_makuuchi');
                                else if (w.rank === 'Juryo' && ['Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi', 'MaeZumo'].includes(oldRank)) tag = t('news.promote_juryo');

                                return (
                                    <div key={w.id} className="bg-white/10 border border-white/20 rounded-md p-2 min-w-[140px] flex items-center gap-3 hover:bg-white/20 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-amber-900 font-bold text-lg">
                                            {w.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">{tag}</div>
                                            <div className="text-sm font-bold text-white leading-tight">{t(`rank.${w.rank}`) || w.rank}</div>
                                            <div className="text-[10px] text-white/50">{t('trend.up')} from {t(`rank.${oldRank}`) || oldRank}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex bg-stone-200 border-b border-stone-300 font-bold text-sm shrink-0">
                    {['Makuuchi', 'Juryo', 'Lower'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-8 py-3 flex-1 transition-colors ${activeTab === tab
                                ? 'bg-[#fcf9f2] text-[#b7282e] border-t-4 border-[#b7282e]'
                                : 'text-stone-500 hover:bg-stone-300 hover:text-stone-700'}`}
                        >
                            {tab === 'Makuuchi' ? t('rank.Maegashira') : tab === 'Juryo' ? t('rank.Juryo') : t('basho_result.division')}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-stone-50">
                    <div className="grid grid-cols-1 gap-2">
                        {activeList.map((w) => {
                            const last = w.history[w.history.length - 1];
                            const oldRank = last ? last.rank : ('MaeZumo' as any);

                            const newVal = getRankScore(w.rank, w.rankNumber || 1, w.rankSide || 'East');
                            // Casting oldRank to Rank for getRankScore if needed, or getRankScore accepts string? 
                            // getRankScore defined as (rank: Rank...). 'MaeZumo' as any works.
                            const oldVal = getRankScore(oldRank, last ? (last.rankNumber || 1) : 1, last ? (last.rankSide || 'East') : 'East');

                            let status = 'stay';
                            if (!last) status = 'new';
                            else if (newVal > oldVal) status = 'up';
                            else if (newVal < oldVal) status = 'down';

                            // Format old rank
                            const oldRankStr = formatRank(oldRank, last ? last.rankSide : 'East', last ? last.rankNumber : 1);

                            return (
                                <div key={w.id} className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm transition-all hover:shadow-md ${status === 'up' ? 'bg-red-50 border-red-200' :
                                    status === 'down' ? 'bg-blue-50 border-blue-200' :
                                        'bg-white border-stone-200'
                                    }`}>
                                    {/* Icon */}
                                    <div className="w-8 flex justify-center font-bold text-lg">
                                        {status === 'up' && <span className="text-red-600">▲</span>}
                                        {status === 'down' && <span className="text-blue-600">▼</span>}
                                        {status === 'stay' && <span className="text-stone-400">-</span>}
                                        {status === 'new' && <span className="text-amber-500 text-xs text-center border border-amber-500 rounded px-1">NEW</span>}
                                    </div>

                                    {/* Rank */}
                                    <div className="w-32 text-right">
                                        <div className={`font-bold font-serif leading-tight ${['Yokozuna', 'Ozeki'].includes(w.rank) ? 'text-[#b7282e] text-lg' : 'text-stone-800'
                                            }`}>
                                            {formatRank(w.rank, w.rankSide, w.rankNumber)}
                                        </div>
                                        {status === 'up' && last && (
                                            <div className="text-[10px] text-red-500 font-bold opacity-75">
                                                {t('trend.up')} {oldRankStr}
                                            </div>
                                        )}
                                        {status === 'down' && last && (
                                            <div className="text-[10px] text-blue-500 font-bold opacity-75">
                                                {t('trend.down')} {oldRankStr}
                                            </div>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1 flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${w.heyaId === 'player_heya'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                            : 'bg-stone-200 text-stone-600'
                                            }`}>
                                            {w.name[0]}
                                        </div>
                                        <div>
                                            <div className={`font-bold ${w.heyaId === 'player_heya' ? 'text-amber-700' : 'text-stone-800'}`}>
                                                {w.name}
                                            </div>
                                            <div className="text-xs text-stone-500">
                                                {w.heyaId === 'player_heya' ? t('app.subtitle') : 'CPU'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    {last && (
                                        <div className="text-right text-stone-600 font-mono text-sm px-4">
                                            {last.wins} - {last.losses}
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-stone-200 p-4 border-t border-stone-300 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-[#b7282e] text-white px-8 py-2 rounded shadow hover:bg-[#a01e23] transition-colors font-bold"
                    >
                        {t('cmd.close')}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BashoResultModal;
