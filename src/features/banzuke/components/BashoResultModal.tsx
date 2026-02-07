
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Wrestler, Rank } from '../../../types';
import { formatRank } from '../../../utils/formatting';
import { ChevronUp, ChevronDown, Minus, Crown } from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { RANK_VALUE_MAP } from '../../../utils/constants';
import ModalShell from '../../../components/ui/ModalShell';
import SectionHeader from '../../../components/ui/SectionHeader';
import TabList from '../../../components/ui/TabList';

interface BashoResultModalProps {
    wrestlers: Wrestler[];
    onClose: () => void;
}

// Strict Score Calculation for Sorting
const getRankScore = (rank: Rank, rankNumber: number, rankSide: string): number => {
    const base = RANK_VALUE_MAP[rank] || 0;
    const sideBonus = rankSide === 'East' ? 0.5 : 0;
    return base - rankNumber + sideBonus;
};

interface ProcessedWrestler extends Wrestler {
    status: 'up' | 'down' | 'stay' | 'new';
    oldRankStr: string;
}

const BashoResultModal: React.FC<BashoResultModalProps> = ({ wrestlers, onClose }) => {
    const { t, i18n } = useTranslation();
    const { currentDate } = useGame();
    const [activeTab, setActiveTab] = React.useState<Rank | 'All'>('Maegashira');

    // Filter and Sort Data
    const { categorized, promotedHeroes } = useMemo(() => {
        // Sort by Rank
        const sorted = [...wrestlers].sort((a, b) => {
            const valA = getRankScore(a.rank, a.rankNumber || 1, a.rankSide || 'East');
            const valB = getRankScore(b.rank, b.rankNumber || 1, b.rankSide || 'East');
            return valB - valA;
        });

        const categorized: Record<string, ProcessedWrestler[]> = {
            Makuuchi: [],
            Juryo: [],
            Makushita: [],
            Sandanme: [],
            Jonidan: [],
            Jonokuchi: []
        };

        const processed: ProcessedWrestler[] = sorted.map(w => {
            const lastHistory = w.history[w.history.length - 1];
            const newVal = getRankScore(w.rank, w.rankNumber || 1, w.rankSide || 'East');

            let oldVal = newVal;
            let oldRankStr = '---';

            if (lastHistory) {
                oldVal = getRankScore(lastHistory.rank, lastHistory.rankNumber, lastHistory.rankSide);
                oldRankStr = formatRank(lastHistory.rank, lastHistory.rankSide, lastHistory.rankNumber);
            } else if (w.bantsukePriorRank) {
                oldVal = getRankScore(w.bantsukePriorRank, 1, 'East');
                oldRankStr = w.bantsukePriorRank;
            } else {
                oldVal = -999;
            }

            let status: 'up' | 'down' | 'stay' | 'new' = 'stay';
            if (oldVal === -999 || (!lastHistory && !w.bantsukePriorRank)) status = 'new';
            else if (newVal > oldVal) status = 'up';
            else if (newVal < oldVal) status = 'down';

            return { ...w, status, oldRankStr };
        });

        processed.forEach(w => {
            if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(w.rank)) {
                categorized.Makuuchi.push(w);
            } else if (w.rank === 'Juryo') {
                categorized.Juryo.push(w);
            } else if (w.rank === 'Makushita') {
                categorized.Makushita.push(w);
            } else if (w.rank === 'Sandanme') {
                categorized.Sandanme.push(w);
            } else if (w.rank === 'Jonidan') {
                categorized.Jonidan.push(w);
            } else if (w.rank === 'Jonokuchi') {
                categorized.Jonokuchi.push(w);
            }
        });

        const heroes = processed.filter(w => w.status === 'up' && w.isSekitori);

        return { categorized, promotedHeroes: heroes };
    }, [wrestlers]);

    const isEn = i18n.language === 'en';

    // Map internal keys to display labels and selection keys
    // We' use 'Makuuchi' as key for top division, others match Rank enum
    const tabs = [
        { key: 'Makuuchi', label: t('rank.Makuuchi') },
        { key: 'Juryo', label: t('rank.Juryo') },
        { key: 'Makushita', label: t('rank.Makushita') },
        { key: 'Sandanme', label: t('rank.Sandanme') },
        { key: 'Jonidan', label: t('rank.Jonidan') },
        { key: 'Jonokuchi', label: t('rank.Jonokuchi') }
    ];

    const currentList = categorized[activeTab as string] || categorized.Makuuchi;

    // Default to Makuuchi on load
    React.useEffect(() => {
        setActiveTab('Makuuchi' as any);
    }, []);

    return (
        <ModalShell
            onClose={onClose}
            header={<></>}
            className="max-w-5xl max-h-[90vh] border-[6px] border-double border-[#b7282e]"
            bodyClassName="flex flex-col h-full"
            overlayClassName="z-[200] bg-black/70"
        >

            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

            {/* Header */}
            <div className="px-6 pt-6">
                <SectionHeader
                    align="center"
                    eyebrow={t('banzuke.announcement.subtitle', { year: currentDate.getFullYear() - 2024, month: currentDate.getMonth() + 1 })}
                    title={t('banzuke.announcement.title')}
                    illustrationKey="banzuke"
                    className="border-0 shadow-none bg-transparent"
                />
            </div>

                {/* Hero Section (Promoted Sekitori) - Only show if current tab is Makuuchi or Juryo? Or always? Always is good for hype. */}
                {promotedHeroes.length > 0 && (
                    <div className="relative z-10 px-6 pb-4 shrink-0 transition-all">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-px flex-1 bg-amber-300"></div>
                            <div className="text-amber-600 font-serif font-bold text-xs tracking-widest flex items-center gap-2">
                                <Crown className="w-3 h-3" />
                                {t('banzuke.announcement.hero_title')}
                                <Crown className="w-3 h-3" />
                            </div>
                            <div className="h-px flex-1 bg-amber-300"></div>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar justify-center px-4">
                            {promotedHeroes.slice(0, 5).map(w => (
                                <div key={w.id} className="bg-white border border-amber-200 shadow-md p-2 rounded-sm min-w-[140px] flex flex-col items-center relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500"></div>
                                    <div className="mt-1 text-[10px] font-bold text-amber-600 border border-amber-200 px-1.5 rounded-full mb-0.5 bg-amber-50">
                                        {t('banzuke.announcement.promoted')}
                                    </div>
                                    <div className="font-serif font-black text-lg text-stone-900 leading-tight mb-0.5">{isEn ? w.reading : w.name}</div>
                                    <div className="font-serif font-bold text-[#b7282e] text-sm">
                                        {formatRank(w.rank, w.rankSide, w.rankNumber)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="px-6 pt-2">
                    <div className="overflow-x-auto custom-scrollbar border-b border-stone-300">
                        <TabList
                            tabs={tabs.map((tab) => ({ id: tab.key, label: tab.label }))}
                            activeId={activeTab}
                            onChange={(id) => setActiveTab(id as any)}
                            className="min-w-max"
                        />
                    </div>
                </div>

                {/* Main List */}
                <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 bg-[#fcf9f2] min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentList.map((w) => {
                            const isPlayer = w.heyaId === 'player_heya';
                            const statusColor = w.status === 'up' ? 'text-[#b7282e]' : w.status === 'down' ? 'text-blue-700' : 'text-stone-400';
                            const statusBg = w.status === 'up' ? 'bg-red-50' : w.status === 'down' ? 'bg-blue-50' : 'bg-transparent';
                            const borderStyle = isPlayer ? 'border-amber-400 ring-1 ring-amber-400 bg-amber-50/30' : 'border-stone-200 bg-white';

                            return (
                                <div key={w.id} className={`
                                    relative flex items-center p-2 rounded-sm border shadow-sm transition-all hover:shadow-md
                                    ${borderStyle}
                                `}>
                                    {/* Rank Badge */}
                                    <div className="w-16 text-center shrink-0 border-r border-stone-200 pr-2 mr-2">
                                        <div className={`font-serif font-bold leading-tight text-sm ${['Yokozuna', 'Ozeki'].includes(w.rank) ? 'text-[#b7282e]' : 'text-stone-800'}`}>
                                            {formatRank(w.rank, w.rankSide, w.rankNumber)}
                                        </div>
                                    </div>

                                    {/* Name & Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="font-serif font-black text-base text-stone-900 truncate leading-none mb-1">
                                                {isEn ? w.reading : w.name}
                                            </div>
                                            {isPlayer && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm ml-1 shrink-0" />}
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px]">
                                            {/* Status Indicator */}
                                            <div className={`flex items-center gap-1 font-bold ${statusColor} ${statusBg} px-1 py-0.5 rounded-sm`}>
                                                {w.status === 'up' && <ChevronUp className="w-3 h-3" />}
                                                {w.status === 'down' && <ChevronDown className="w-3 h-3" />}
                                                {w.status === 'stay' && <Minus className="w-3 h-3" />}
                                                {w.status === 'new' && <span className="text-[9px] bg-green-100 text-green-700 border border-green-300 px-1 rounded-sm">NEW</span>}

                                                {w.status !== 'new' && (
                                                    <span>
                                                        {w.status === 'up' ? t('banzuke.announcement.promoted') :
                                                            w.status === 'down' ? t('banzuke.announcement.demoted') :
                                                                t('banzuke.announcement.stay')}
                                                    </span>
                                                )}
                                            </div>

                                            {w.status !== 'stay' && w.status !== 'new' && (
                                                <span className="text-stone-400 text-[9px] truncate max-w-[60px]">
                                                    (prev. {w.oldRankStr})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {currentList.length === 0 && (
                            <div className="col-span-full py-10 text-center text-stone-400 font-serif italic">
                                {t('no_data', { defaultValue: '該当する力士はいません' })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 p-4 text-center shrink-0 border-t border-stone-300 bg-[#fcf9f2]">
                    <button
                        onClick={onClose}
                        className="group relative inline-flex items-center justify-center"
                    >
                        {/* Seal Design */}
                        <div className="w-14 h-14 rounded-full border-2 border-[#b7282e] flex items-center justify-center relative bg-white shadow-lg transition-transform group-hover:scale-105">
                            <div className="w-12 h-12 rounded-full border border-[#b7282e] border-dashed flex items-center justify-center">
                                <span className="font-serif font-bold text-[#b7282e] text-xs writing-vertical-rl">
                                    {t('banzuke.announcement.close')}
                                </span>
                            </div>
                        </div>
                    </button>
                </div>

        </ModalShell>
    );
};

export default BashoResultModal;
