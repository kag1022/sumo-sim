
import React, { useState, useMemo } from 'react';
import { YushoRecord } from '../../../types';
import { getWesternYearFromBashoId } from '../../../utils/time';
import { useTranslation } from 'react-i18next';
import { Crown, Landmark } from 'lucide-react';
import ModalShell from '../../../components/ui/ModalShell';
import SectionHeader from '../../../components/ui/SectionHeader';
import TabList from '../../../components/ui/TabList';
import EmptyState from '../../../components/ui/EmptyState';

interface HistoryModalProps {
    history?: YushoRecord[];
    onClose: () => void;
}

interface ChampionStats {
    name: string;
    nameEn?: string;
    heya: string;
    heyaEn?: string;
    count: number;
    lastRank: string;
    lastBasho: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history = [], onClose }) => {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';
    const [activeTab, setActiveTab] = useState<'timeline' | 'hallOfFame'>('timeline');
    const [rankFilter, setRankFilter] = useState<string>('Makuuchi');

    // --- Aggregation Logic (Hall of Fame) ---
    const leaderboard = useMemo(() => {
        const counts: Record<string, ChampionStats> = {};
        history.filter(r => r.division === 'Makuuchi').forEach(r => {
            if (!counts[r.wrestlerName]) {
                counts[r.wrestlerName] = {
                    name: r.wrestlerName,
                    nameEn: r.wrestlerNameEn,
                    heya: r.heyaName,
                    heyaEn: r.heyaNameEn,
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
        <ModalShell
            onClose={onClose}
            header={<></>}
            className="max-w-5xl h-[90vh] border-y-[12px] border-[#b7282e]"
            bodyClassName="flex flex-col h-full"
        >

            {/* Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

            {/* Header */}
            <div className="px-8 pt-6">
                <SectionHeader
                    eyebrow={t('history.subtitle')}
                    title={t('history.title')}
                    illustrationKey="history"
                    icon={<Landmark className="w-4 h-4" />}
                    actions={<></>}
                />
            </div>

            {/* Tabs */}
            <div className="px-8 pt-4">
                <TabList
                    tabs={[
                        { id: 'timeline', label: t('history.tabs.timeline') },
                        { id: 'hallOfFame', label: t('history.tabs.hall_of_fame') },
                    ]}
                    activeId={activeTab}
                    onChange={(id) => setActiveTab(id as any)}
                />
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
                                                <div className="absolute -top-4 bg-slate-200 text-slate-600 font-bold px-3 py-1 text-xs rounded-full shadow-sm">{t('history.hall_of_fame.second_place')}</div>
                                                <div className="text-xl font-bold text-slate-800 mb-1 font-serif mt-2">{isEn && leaderboard[1].nameEn ? leaderboard[1].nameEn : leaderboard[1].name}</div>
                                                <div className="text-xs text-slate-500 mb-4">{isEn && leaderboard[1].heyaEn ? leaderboard[1].heyaEn : leaderboard[1].heya}</div>
                                                <div className="text-4xl font-black text-slate-300 font-serif">
                                                    {leaderboard[1].count}<span className="text-sm font-bold ml-1 text-slate-400">{t('history.hall_of_fame.wins')}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* 1st Place */}
                                        {leaderboard[0] && (
                                            <div className="bg-white border-2 border-[#b7282e] shadow-xl p-8 flex flex-col items-center relative z-10 rounded-sm transform md:-translate-y-4">
                                                <div className="absolute -top-5 bg-[#b7282e] text-white font-bold px-4 py-1.5 text-sm rounded-full shadow-md flex items-center gap-2">
                                                    <Crown className="w-4 h-4 text-white" /> {t('history.hall_of_fame.champion')}
                                                </div>
                                                <div className="mt-4 text-3xl font-black text-[#b7282e] mb-1 font-serif">{isEn && leaderboard[0].nameEn ? leaderboard[0].nameEn : leaderboard[0].name}</div>
                                                <div className="text-sm text-slate-500 mb-6 font-bold">{isEn && leaderboard[0].heyaEn ? leaderboard[0].heyaEn : leaderboard[0].heya}</div>
                                                <div className="text-6xl font-black text-slate-800 font-serif leading-none">
                                                    {leaderboard[0].count}
                                                    <span className="text-lg font-bold text-[#b7282e] ml-1">{t('history.hall_of_fame.wins')}</span>
                                                </div>
                                                <div className="mt-4 text-[10px] uppercase tracking-widest text-[#b7282e] font-bold border-t border-[#b7282e] pt-2 w-full text-center">
                                                    {t('history.hall_of_fame.legendary_yokozuna')}
                                                </div>
                                            </div>
                                        )}

                                        {/* 3rd Place */}
                                        {leaderboard[2] && (
                                            <div className="bg-white border border-slate-200 shadow-lg p-6 flex flex-col items-center relative rounded-sm">
                                                <div className="absolute -top-4 bg-amber-700 text-white font-bold px-3 py-1 text-xs rounded-full shadow-sm">{t('history.hall_of_fame.third_place')}</div>
                                                <div className="text-xl font-bold text-slate-800 mb-1 font-serif mt-2">{isEn && leaderboard[2].nameEn ? leaderboard[2].nameEn : leaderboard[2].name}</div>
                                                <div className="text-xs text-slate-500 mb-4">{isEn && leaderboard[2].heyaEn ? leaderboard[2].heyaEn : leaderboard[2].heya}</div>
                                                <div className="text-4xl font-black text-amber-900/20 font-serif">
                                                    {leaderboard[2].count}<span className="text-sm font-bold ml-1 text-slate-400">{t('history.hall_of_fame.wins')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* The Rest List */}
                                    <div className="bg-white shadow-sm border border-stone-200 rounded-sm overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-stone-100 text-stone-500 text-xs uppercase font-bold border-b border-stone-200">
                                                <tr>
                                                    <th className="px-6 py-4">{t('history.hall_of_fame.table_rank')}</th>
                                                    <th className="px-6 py-4">{t('history.hall_of_fame.table_rikishi')}</th>
                                                    <th className="px-6 py-4 text-right">{t('history.hall_of_fame.table_victories')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100">
                                                {leaderboard.slice(3).map((champ, i) => (
                                                    <tr key={champ.name} className="hover:bg-amber-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-stone-400 font-bold">#{i + 4}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-800 font-serif text-lg">{isEn && champ.nameEn ? champ.nameEn : champ.name}</div>
                                                            <div className="text-xs text-stone-500">{isEn && champ.heyaEn ? champ.heyaEn : champ.heya}</div>
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
                                <EmptyState
                                    icon={<Landmark className="w-12 h-12" />}
                                    title={t('history.empty.title')}
                                    description={t('history.empty.desc')}
                                    className="py-24 opacity-70"
                                />
                            )}
                        </div>
                    )}

                    {/* --- Timeline Tab --- */}
                    {activeTab === 'timeline' && (
                        <div>
                            {/* Filters */}
                            <div className="flex gap-2 mb-8 justify-center">
                                {(['Makuuchi', 'Juryo', 'Makushita', 'All'] as const).map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setRankFilter(filter)}
                                        className={`px-5 py-2 rounded-sm text-xs font-bold transition-all border ${rankFilter === filter
                                            ? 'bg-[#b7282e] text-white border-[#b7282e] shadow-md'
                                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700'
                                            }`}
                                    >
                                        {t(`history.filter.${filter}`)}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white shadow-xl border border-stone-200 rounded-sm overflow-hidden relative">
                                {/* Vertical Accent Line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b7282e] z-10 shadow-sm"></div>

                                <table className="w-full text-sm text-left relative z-0">
                                    <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                                        <tr>
                                            <th className="px-6 py-4 whitespace-nowrap pl-8">{t('history.timeline.table_head.basho')}</th>
                                            <th className="px-6 py-4 whitespace-nowrap">{t('history.timeline.table_head.division')}</th>
                                            <th className="px-6 py-4">{t('history.timeline.table_head.winner')}</th>
                                            <th className="px-6 py-4 hidden md:table-cell">{t('history.timeline.table_head.stable')}</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">{t('history.timeline.table_head.rank')}</th>
                                            <th className="px-6 py-4 text-right">{t('history.timeline.table_head.record')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {filteredTimeline.length > 0 ? (
                                            filteredTimeline.map((record, i) => (
                                                <tr key={i} className="hover:bg-amber-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-stone-400 text-xs font-bold pl-8 border-l border-transparent">
                                                        <div className="text-sm text-stone-600">{getWesternYearFromBashoId(record.bashoId)}年</div>
                                                        <div className="text-[10px] opacity-60">
                                                            {record.bashoId.replace(/^\d{4}年\s*/, '')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-xs text-stone-500 uppercase tracking-wider">{record.division}</td>
                                                    <td className="px-6 py-4">
                                                        <div className={`font-serif font-bold ${record.division === 'Makuuchi' ? 'text-[#b7282e] text-lg' : 'text-slate-800'}`}>
                                                            {isEn && record.wrestlerNameEn ? record.wrestlerNameEn : record.wrestlerName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-stone-500 text-xs font-bold hidden md:table-cell">{isEn && record.heyaNameEn ? record.heyaNameEn : record.heyaName}</td>
                                                    <td className="px-6 py-4 text-xs text-stone-500 hidden sm:table-cell font-serif">{record.rank}</td>
                                                    <td className="px-6 py-4 text-right font-bold font-mono text-slate-700">
                                                        {record.wins}-{record.losses}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-24 text-center text-stone-400 font-serif text-lg">
                                                    {t('history.timeline.empty')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
            </div>
        </ModalShell>
    );
};
