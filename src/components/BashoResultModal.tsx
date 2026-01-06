import React, { useState, useMemo } from 'react';
import { Wrestler, Rank } from '../types';
import { formatRank } from '../utils/formatting';
import { RANK_VALUE_MAP } from '../utils/constants';

interface BashoResultModalProps {
    wrestlers: Wrestler[];
    onClose: () => void;
}

const getRankValue = (rank: Rank): number => RANK_VALUE_MAP[rank] || 0;

const BashoResultModal: React.FC<BashoResultModalProps> = ({ wrestlers, onClose }) => {
    const [activeTab, setActiveTab] = useState<'Makuuchi' | 'Juryo' | 'Lower'>('Makuuchi');

    // Filter and Sort Data
    const { makuuchi, juryo, lower, promoted } = useMemo(() => {
        // Sort by New Rank Descending
        const sorted = [...wrestlers].sort((a, b) => {
            const valA = getRankValue(a.rank);
            const valB = getRankValue(b.rank);
            if (valA !== valB) return valB - valA;
            // secondary sort by rank number
            return (a.rankNumber || 100) - (b.rankNumber || 100);
        });

        const makuuchiList = sorted.filter(w => ['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(w.rank));
        const juryoList = sorted.filter(w => w.rank === 'Juryo');
        const lowerList = sorted.filter(w => !['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira', 'Juryo'].includes(w.rank));

        // Promotions for Flash News (Only Sekitori promotions)
        const promotedList = sorted.filter(w => {
            const last = w.history[w.history.length - 1];
            if (!last) return false;

            const oldVal = getRankValue(last.rank);
            const newVal = getRankValue(w.rank);

            // Significant Promotion: To Sekiwake/Ozeki/Yokozuna, OR New Makuuchi/New Juryo
            // Simplify: Any Rank Increase for Sekitori
            if (newVal > oldVal && w.isSekitori) return true;
            return false;
        });

        return { makuuchi: makuuchiList, juryo: juryoList, lower: lowerList, promoted: promotedList };
    }, [wrestlers]);

    const activeList = activeTab === 'Makuuchi' ? makuuchi : activeTab === 'Juryo' ? juryo : lower;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#fcf9f2] w-full max-w-5xl max-h-[95vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-stone-600">

                {/* Header (Sports News Style) */}
                <div className="bg-[#b7282e] text-white p-4 shrink-0 relative overflow-hidden flex justify-between items-center shadow-lg z-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/japanese-sayagata.png')] opacity-20"></div>
                    <div>
                        <h2 className="text-4xl font-black font-serif tracking-tighter italic transform -skew-x-6 relative z-10 text-shadow-lg leading-none">
                            大相撲 速報
                        </h2>
                        <p className="text-xs font-bold tracking-widest opacity-90 mt-1 pl-1">OFFICIAL BANZUKE ANNOUNCEMENT</p>
                    </div>
                    <div className="text-right z-10">
                        <div className="text-4xl font-bold font-mono text-amber-300 dropped-shadow">R.05</div>
                    </div>
                </div>

                {/* Flash News Section (Horizontal Scroll) */}
                {promoted.length > 0 && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 shrink-0 shadow-inner overflow-x-auto custom-scrollbar">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center bg-red-600 text-white px-3 py-1 rounded font-bold text-sm shadow animate-pulse">
                                BREAKING<br />NEWS
                            </div>
                            {promoted.slice(0, 10).map(w => {
                                const last = w.history[w.history.length - 1];
                                const oldRank = last ? last.rank : 'MaeZumo';
                                return (
                                    <div key={w.id} className="bg-white/10 border border-white/20 rounded-md p-2 min-w-[140px] flex items-center gap-3 hover:bg-white/20 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-amber-900 font-bold text-lg">
                                            {w.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Promoted to</div>
                                            <div className="text-sm font-bold text-white leading-tight">{w.rank}</div>
                                            <div className="text-[10px] text-white/50">Was {oldRank}</div>
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
                            {tab === 'Makuuchi' ? '幕内 (Makuuchi)' : tab === 'Juryo' ? '十両 (Juryo)' : '幕下以下 (Lower)'}
                        </button>
                    ))}
                </div>

                {/* Main Content List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-stone-50">
                    <div className="grid grid-cols-1 gap-2">
                        {activeList.map((w) => {
                            const last = w.history[w.history.length - 1];
                            const oldRank = last ? last.rank : 'MaeZumo';
                            const wins = last ? last.wins : 0;
                            const losses = last ? last.losses : 0;

                            const newVal = getRankValue(w.rank);
                            const oldVal = getRankValue(oldRank);

                            let status = 'stay';
                            if (newVal > oldVal) status = 'up';
                            if (newVal < oldVal) status = 'down';
                            if (!last) status = 'new'; // Fresh recruit?

                            return (
                                <div key={w.id} className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm transition-all hover:shadow-md ${status === 'up' ? 'bg-red-50 border-red-200' :
                                    status === 'down' ? 'bg-blue-50 border-blue-200' :
                                        'bg-white border-stone-200'
                                    }`}>
                                    {/* Movement Icon */}
                                    <div className="w-8 flex justify-center font-bold text-lg">
                                        {status === 'up' && <span className="text-red-600">▲</span>}
                                        {status === 'down' && <span className="text-blue-600">▼</span>}
                                        {status === 'stay' && <span className="text-stone-400">-</span>}
                                        {status === 'new' && <span className="text-amber-500 text-xs text-center border border-amber-500 rounded px-1">NEW</span>}
                                    </div>

                                    {/* Rank */}
                                    <div className="w-24 text-right">
                                        <div className={`font-bold font-serif leading-tight ${['Yokozuna', 'Ozeki'].includes(w.rank) ? 'text-[#b7282e] text-lg' : 'text-stone-800'
                                            }`}>
                                            {formatRank(w.rank, w.rankSide, w.rankNumber)}
                                        </div>
                                        {status === 'up' && <div className="text-[10px] text-red-500 font-bold">Previous: {formatRank(oldRank).split(' ')[0]}</div>}
                                    </div>

                                    {/* Name & Avatar */}
                                    <div className="flex-1 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${w.isSekitori ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-200 text-stone-600'
                                            }`}>
                                            {w.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg leading-none">{w.name}</div>
                                            <div className="text-xs text-stone-500">{w.heyaId}</div>
                                        </div>
                                    </div>

                                    {/* Last Result */}
                                    <div className="w-24 text-right font-mono font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded">
                                        {wins} - {losses}
                                    </div>
                                </div>
                            );
                        })}
                        {activeList.length === 0 && (
                            <div className="p-8 text-center text-stone-400 font-serif">
                                該当する力士がいません
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-[#b7282e] hover:bg-[#a01f25] text-white font-bold py-3 px-16 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                    >
                        <span>次の場所へ</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BashoResultModal;
