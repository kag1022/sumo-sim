
import React, { useState, useMemo } from 'react';
import { YushoRecord } from '../../../types';

interface HistoryModalProps {
    history?: YushoRecord[];
    onClose: () => void;
}

interface ChampionStats {
    name: string;
    heya: string;
    count: number;
    lastRank: string;
    lastBasho: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history = [], onClose }) => {
    const [activeTab, setActiveTab] = useState<'timeline' | 'hallOfFame'>('timeline');
    const [rankFilter, setRankFilter] = useState<string>('Makuuchi');

    // --- Aggregation Logic (Hall of Fame) ---
    const leaderboard = useMemo(() => {
        const counts: Record<string, ChampionStats> = {};
        history.filter(r => r.division === 'Makuuchi').forEach(r => {
            if (!counts[r.wrestlerName]) {
                counts[r.wrestlerName] = {
                    name: r.wrestlerName,
                    heya: r.heyaName,
                    count: 0,
                    lastRank: r.rank,
                    lastBasho: r.bashoId
                };
            }
            counts[r.wrestlerName].count += 1;
            counts[r.wrestlerName].lastRank = r.rank;
            counts[r.wrestlerName].lastBasho = r.bashoId;
        });

        return Object.values(counts).sort((a, b) => b.count - a.count);
    }, [history]);

    // --- Timeline Logic ---
    const sortedHistory = useMemo(() => [...history].reverse(), [history]);
    const filteredTimeline = useMemo(() => {
        if (rankFilter === 'All') return sortedHistory;
        return sortedHistory.filter(r => r.division === rankFilter || r.rank.includes(rankFilter));
    }, [sortedHistory, rankFilter]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#fcf9f2] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl rounded-sm border-y-[12px] border-[#b7282e] relative overflow-hidden">

                {/* Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

                {/* Header */}
                <div className="bg-white px-8 py-6 flex justify-between items-center shrink-0 shadow-sm border-b border-stone-200 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#b7282e] rounded-full flex items-center justify-center text-white shadow-md border-4 border-double border-white">
                            <span className="font-serif font-black text-2xl">史</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black font-serif text-slate-900 tracking-tight">大相撲 史記</h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">The Grand Chronicle</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-[#b7282e] transition-colors font-serif font-bold text-sm tracking-widest border-b border-transparent hover:border-[#b7282e]"
                    >
                        CLOSE RECORD
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 border-b border-stone-200 bg-stone-50 shrink-0 gap-1">
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`px-6 py-4 text-sm font-bold transition-all relative overflow-hidden group ${activeTab === 'timeline' ? 'bg-[#fcf9f2] text-[#b7282e] border-x border-stone-200 -mb-px pt-4 pb-4 shadow-[0_-2px_5px_rgba(0,0,0,0.02)]' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <span>歴代優勝者</span>
                        {activeTab === 'timeline' && <div className="absolute top-0 left-0 w-full h-1 bg-[#b7282e]"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('hallOfFame')}
                        className={`px-6 py-4 text-sm font-bold transition-all relative overflow-hidden group ${activeTab === 'hallOfFame' ? 'bg-[#fcf9f2] text-[#b7282e] border-x border-stone-200 -mb-px pt-4 pb-4 shadow-[0_-2px_5px_rgba(0,0,0,0.02)]' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <span>歴代最強力士</span>
                        {activeTab === 'hallOfFame' && <div className="absolute top-0 left-0 w-full h-1 bg-[#b7282e]"></div>}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-[#fcf9f2] custom-scrollbar p-8 relative z-0">

                    {/* --- Hall of Fame Tab --- */}
                    {activeTab === 'hallOfFame' && (
                        <div className="max-w-4xl mx-auto">
                            {leaderboard.length > 0 ? (
                                <div className="space-y-12">
                                    {/* Top 3 Podium */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-12 relative">
                                        {/* 2nd Place */}
                                        {leaderboard[1] && (
                                            <div className="bg-white border border-slate-200 shadow-lg p-6 flex flex-col items-center relative rounded-sm">
                                                <div className="absolute -top-4 bg-slate-200 text-slate-600 font-bold px-3 py-1 text-xs rounded-full shadow-sm">2nd Place</div>
                                                <div className="text-xl font-bold text-slate-800 mb-1 font-serif mt-2">{leaderboard[1].name}</div>
                                                <div className="text-xs text-slate-500 mb-4">{leaderboard[1].heya}</div>
                                                <div className="text-4xl font-black text-slate-300 font-serif">
                                                    {leaderboard[1].count}<span className="text-sm font-bold ml-1 text-slate-400">Wins</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* 1st Place */}
                                        {leaderboard[0] && (
                                            <div className="bg-white border-2 border-[#b7282e] shadow-xl p-8 flex flex-col items-center relative z-10 rounded-sm transform md:-translate-y-4">
                                                <div className="absolute -top-5 bg-[#b7282e] text-white font-bold px-4 py-1.5 text-sm rounded-full shadow-md flex items-center gap-2">
                                                    <span>👑</span> Champion
                                                </div>
                                                <div className="mt-4 text-3xl font-black text-[#b7282e] mb-1 font-serif">{leaderboard[0].name}</div>
                                                <div className="text-sm text-slate-500 mb-6 font-bold">{leaderboard[0].heya}</div>
                                                <div className="text-6xl font-black text-slate-800 font-serif leading-none">
                                                    {leaderboard[0].count}
                                                    <span className="text-lg font-bold text-[#b7282e] ml-1">Wins</span>
                                                </div>
                                                <div className="mt-4 text-[10px] uppercase tracking-widest text-[#b7282e] font-bold border-t border-[#b7282e] pt-2 w-full text-center">
                                                    Legendary Yokozuna
                                                </div>
                                            </div>
                                        )}

                                        {/* 3rd Place */}
                                        {leaderboard[2] && (
                                            <div className="bg-white border border-slate-200 shadow-lg p-6 flex flex-col items-center relative rounded-sm">
                                                <div className="absolute -top-4 bg-amber-700 text-white font-bold px-3 py-1 text-xs rounded-full shadow-sm">3rd Place</div>
                                                <div className="text-xl font-bold text-slate-800 mb-1 font-serif mt-2">{leaderboard[2].name}</div>
                                                <div className="text-xs text-slate-500 mb-4">{leaderboard[2].heya}</div>
                                                <div className="text-4xl font-black text-amber-900/20 font-serif">
                                                    {leaderboard[2].count}<span className="text-sm font-bold ml-1 text-slate-400">Wins</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* The Rest List */}
                                    <div className="bg-white shadow-sm border border-stone-200 rounded-sm overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-stone-100 text-stone-500 text-xs uppercase font-bold border-b border-stone-200">
                                                <tr>
                                                    <th className="px-6 py-4">Rank</th>
                                                    <th className="px-6 py-4">Rikishi / Heya</th>
                                                    <th className="px-6 py-4 text-right">Victories</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100">
                                                {leaderboard.slice(3).map((champ, i) => (
                                                    <tr key={champ.name} className="hover:bg-amber-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-stone-400 font-bold">#{i + 4}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-800 font-serif text-lg">{champ.name}</div>
                                                            <div className="text-xs text-stone-500">{champ.heya}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-[#b7282e] font-serif text-xl">
                                                            {champ.count}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-32 opacity-40">
                                    <div className="text-6xl mb-4 grayscale">🏛️</div>
                                    <h3 className="text-2xl font-serif text-slate-400 font-bold">歴史はまだ始まっていません</h3>
                                    <p className="text-slate-500 mt-2 font-serif">幕内優勝者が出るとここに記録されます。</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- Timeline Tab --- */}
                    {activeTab === 'timeline' && (
                        <div>
                            {/* Filters */}
                            <div className="flex gap-2 mb-8 justify-center">
                                {['Makuuchi', 'Juryo', 'Makushita', 'All'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setRankFilter(filter)}
                                        className={`px-5 py-2 rounded-sm text-xs font-bold transition-all border ${rankFilter === filter
                                            ? 'bg-[#b7282e] text-white border-[#b7282e] shadow-md'
                                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700'
                                            }`}
                                    >
                                        {filter === 'Makuuchi' ? '幕内' : filter === 'Juryo' ? '十両' : filter === 'Makushita' ? '幕下以下' : '全て'}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white shadow-xl border border-stone-200 rounded-sm overflow-hidden relative">
                                {/* Vertical Accent Line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b7282e] z-10 shadow-sm"></div>

                                <table className="w-full text-sm text-left relative z-0">
                                    <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                                        <tr>
                                            <th className="px-6 py-4 whitespace-nowrap pl-8">Basho</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Division</th>
                                            <th className="px-6 py-4">Winner</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Stable</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Rank</th>
                                            <th className="px-6 py-4 text-right">Record</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {filteredTimeline.length > 0 ? (
                                            filteredTimeline.map((record, i) => (
                                                <tr key={i} className="hover:bg-amber-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-stone-400 text-xs font-bold pl-8 border-l border-transparent">{record.bashoId}</td>
                                                    <td className="px-6 py-4 font-bold text-xs text-stone-500 uppercase tracking-wider">{record.division}</td>
                                                    <td className="px-6 py-4">
                                                        <div className={`font-serif font-bold ${record.division === 'Makuuchi' ? 'text-[#b7282e] text-lg' : 'text-slate-800'}`}>
                                                            {record.wrestlerName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-stone-500 text-xs font-bold hidden md:table-cell">{record.heyaName}</td>
                                                    <td className="px-6 py-4 text-xs text-stone-500 hidden sm:table-cell font-serif">{record.rank}</td>
                                                    <td className="px-6 py-4 text-right font-bold font-mono text-slate-700">
                                                        {record.wins}-{record.losses}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-24 text-center text-stone-400 font-serif text-lg">
                                                    歴史はこれからのページに刻まれます...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
