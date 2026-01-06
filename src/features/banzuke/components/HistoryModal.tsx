import React, { useState, useMemo } from 'react';
import { YushoRecord } from '../../../types';

interface HistoryModalProps {
    history?: YushoRecord[]; // Optional/Default support
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

        // Count Makuuchi Yusho
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
            // Update last rank if this record is newer (assuming sorted input or just overwrite)
            // History is typically pushed, so later entries are newer.
            counts[r.wrestlerName].lastRank = r.rank;
            counts[r.wrestlerName].lastBasho = r.bashoId;
        });

        return Object.values(counts).sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            // Determine "Newness" logic or simple name sort
            return 0;
        });
    }, [history]);

    // --- Timeline Logic ---
    const sortedHistory = useMemo(() => {
        return [...history].reverse();
    }, [history]);

    const filteredTimeline = useMemo(() => {
        if (rankFilter === 'All') return sortedHistory;
        return sortedHistory.filter(r => r.division === rankFilter || r.rank.includes(rankFilter));
    }, [sortedHistory, rankFilter]);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-stone-900 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-xl border border-stone-700">
                {/* Header */}
                <div className="bg-[#b7282e] text-white px-6 py-4 flex justify-between items-center shrink-0 shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/japanese-sayagata.png')] opacity-20"></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <span className="text-3xl">📜</span>
                        <div>
                            <h2 className="text-2xl font-black font-serif tracking-widest text-shadow-md">大相撲 史記</h2>
                            <p className="text-[10px] text-amber-200 uppercase tracking-[0.2em] font-serif">Grand Sumo Chronicle</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 text-stone-200 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full w-10 h-10 flex items-center justify-center"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-stone-800 border-b border-stone-700 shadow-inner">
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`flex-1 py-4 text-sm font-bold transition-all relative overflow-hidden group ${activeTab === 'timeline' ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        <span className="relative z-10">歴代優勝者 (Timeline)</span>
                        {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('hallOfFame')}
                        className={`flex-1 py-4 text-sm font-bold transition-all relative overflow-hidden group ${activeTab === 'hallOfFame' ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        <span className="relative z-10">歴代最強力士 (Hall of Fame)</span>
                        {activeTab === 'hallOfFame' && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-stone-900 custom-scrollbar p-6">

                    {/* --- Hall of Fame Tab --- */}
                    {activeTab === 'hallOfFame' && (
                        <div className="max-w-4xl mx-auto">
                            {leaderboard.length > 0 ? (
                                <div className="space-y-8">
                                    {/* Top 3 Podium */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
                                        {/* 2nd Place */}
                                        {leaderboard[1] && (
                                            <div className="bg-stone-800 border border-stone-600 rounded-lg p-6 flex flex-col items-center shadow-xl transform hover:scale-105 transition-transform">
                                                <div className="text-4xl mb-2 grayscale opacity-80">🥈</div>
                                                <div className="text-xl font-bold text-stone-300 mb-1">{leaderboard[1].name}</div>
                                                <div className="text-xs text-stone-500 mb-4">{leaderboard[1].heya}</div>
                                                <div className="text-3xl font-black text-stone-400">
                                                    {leaderboard[1].count}<span className="text-sm font-normal ml-1">回</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* 1st Place */}
                                        {leaderboard[0] && (
                                            <div className="bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-amber-500/50 rounded-xl p-8 flex flex-col items-center shadow-[0_0_30px_rgba(245,158,11,0.2)] transform scale-110 z-10 relative">
                                                <div className="absolute -top-6 text-6xl drop-shadow-md">👑</div>
                                                <div className="mt-8 text-2xl font-black text-amber-400 mb-1">{leaderboard[0].name}</div>
                                                <div className="text-sm text-stone-400 mb-6">{leaderboard[0].heya}</div>
                                                <div className="text-5xl font-black text-white text-shadow-lg">
                                                    {leaderboard[0].count}<span className="text-lg font-bold text-amber-500 ml-1">V</span>
                                                </div>
                                                <div className="mt-4 px-3 py-1 bg-amber-900/30 border border-amber-700/50 rounded text-amber-200 text-xs">
                                                    Legendary Yokozuna
                                                </div>
                                            </div>
                                        )}

                                        {/* 3rd Place */}
                                        {leaderboard[2] && (
                                            <div className="bg-stone-800 border border-stone-600 rounded-lg p-6 flex flex-col items-center shadow-xl transform hover:scale-105 transition-transform">
                                                <div className="text-4xl mb-2 grayscale sepia opacity-60">🥉</div>
                                                <div className="text-xl font-bold text-stone-300 mb-1">{leaderboard[2].name}</div>
                                                <div className="text-xs text-stone-500 mb-4">{leaderboard[2].heya}</div>
                                                <div className="text-3xl font-black text-stone-500">
                                                    {leaderboard[2].count}<span className="text-sm font-normal ml-1">回</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* The Rest List */}
                                    <div className="bg-stone-800 rounded-lg border border-stone-700 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-stone-950 text-stone-500 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Rank</th>
                                                    <th className="px-6 py-4">Rikishi</th>
                                                    <th className="px-6 py-4 text-right">Victories</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-700">
                                                {leaderboard.slice(3).map((champ, i) => (
                                                    <tr key={champ.name} className="hover:bg-stone-700/50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-stone-500">#{i + 4}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-stone-300">{champ.name}</div>
                                                            <div className="text-xs text-stone-500">{champ.heya}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-amber-500 font-mono text-lg">
                                                            {champ.count}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 opacity-50">
                                    <div className="text-6xl mb-4 grayscale">🏛️</div>
                                    <h3 className="text-xl font-serif text-stone-500">まだ伝説は生まれていません</h3>
                                    <p className="text-stone-600 mt-2">幕内優勝者が出るとここに記録されます。</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- Timeline Tab --- */}
                    {activeTab === 'timeline' && (
                        <div>
                            {/* Filters */}
                            <div className="flex gap-2 mb-6 justify-center">
                                {['Makuuchi', 'Juryo', 'Makushita', 'All'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setRankFilter(filter)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${rankFilter === filter
                                            ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-900/50'
                                            : 'bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-500 hover:text-stone-200'
                                            }`}
                                    >
                                        {filter === 'Makuuchi' ? '幕内' : filter === 'Juryo' ? '十両' : filter === 'Makushita' ? '幕下以下' : '全て'}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-stone-800 rounded-lg shadow-xl border border-stone-700 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-stone-950 text-stone-400 font-bold border-b border-stone-700 box-border">
                                        <tr>
                                            <th className="px-4 py-3 whitespace-nowrap">場所</th>
                                            <th className="px-4 py-3 whitespace-nowrap">階級</th>
                                            <th className="px-4 py-3">優勝力士</th>
                                            <th className="px-4 py-3 hidden md:table-cell">所属部屋</th>
                                            <th className="px-4 py-3 hidden sm:table-cell">番付</th>
                                            <th className="px-4 py-3 text-right">成績</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-700/50">
                                        {filteredTimeline.length > 0 ? (
                                            filteredTimeline.map((record, i) => (
                                                <tr key={i} className="hover:bg-stone-700/30 transition-colors odd:bg-stone-800 even:bg-stone-800/50">
                                                    <td className="px-4 py-3 font-mono text-stone-500 text-xs">{record.bashoId}</td>
                                                    <td className="px-4 py-3 font-bold text-xs text-stone-400">{record.division}</td>
                                                    <td className="px-4 py-3">
                                                        <div className={`font-bold ${record.division === 'Makuuchi' ? 'text-amber-400 text-base' : 'text-stone-300'}`}>
                                                            {record.wrestlerName}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-stone-500 text-xs hidden md:table-cell">{record.heyaName}</td>
                                                    <td className="px-4 py-3 text-xs text-stone-500 hidden sm:table-cell">{record.rank}</td>
                                                    <td className="px-4 py-3 text-right font-bold font-mono text-stone-300">
                                                        {record.wins}-{record.losses}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-stone-600 font-serif">
                                                    歴史はこれからのページに刻まれます
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
