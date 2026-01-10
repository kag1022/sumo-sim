
import React from 'react';
import { Wrestler } from '../../../types';
import { formatRank } from '../../../utils/formatting';
import { SkillBadge } from '../../../components/ui/SkillBadge';
import { useTranslation } from 'react-i18next';

interface WrestlerListProps {
    wrestlers: Wrestler[];
    onSelect: (wrestler: Wrestler) => void;
}

const WrestlerList: React.FC<WrestlerListProps> = ({ wrestlers, onSelect }) => {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';

    // Sort logic: Sekitori -> Non-Sekitori -> MaeZumo
    const sortedWrestlers = [...wrestlers].sort((a, b) => {
        // Custom Sort: Move MaeZumo to bottom
        if (a.rank === 'MaeZumo' && b.rank !== 'MaeZumo') return 1;
        if (a.rank !== 'MaeZumo' && b.rank === 'MaeZumo') return -1;
        return 0; // Keeping original order otherwise
    });

    return (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
            {sortedWrestlers.map((wrestler) => (
                <div
                    key={wrestler.id}
                    onClick={() => onSelect(wrestler)}
                    className={`
                        relative flex items-center p-3 rounded-sm cursor-pointer transition-all duration-200 group
                        ${wrestler.rank === 'MaeZumo'
                            ? 'bg-stone-50 border border-stone-200 opacity-70 grayscale'
                            : wrestler.isSekitori
                                ? 'bg-white border-l-4 border-l-[#b7282e] border-y border-r border-slate-200 shadow-sm'
                                : 'bg-white border border-slate-200 shadow-sm'
                        }
                        hover:shadow-md hover:border-slate-300 hover:scale-[1.01]
                        focus:outline-none focus:ring-2 focus:ring-amber-400
                    `}
                >
                    {/* Rank Badge */}
                    <div className={`
                        w-16 flex-shrink-0 text-center font-bold font-serif flex flex-col items-center justify-center border-r border-slate-100 pr-2 mr-2
                        ${wrestler.isSekitori ? 'text-[#b7282e]' : 'text-slate-500'}
                    `}>
                        <div className="text-[9px] opacity-60 leading-none mb-1 uppercase tracking-tighter">
                            {t('history.timeline.table_head.rank')}
                        </div>
                        <div className={`${isEn ? 'text-xs tracking-tight' : 'text-base'} leading-none`}>
                            {formatRank(wrestler.rank).split(/(\d|筆)/)[0].replace(/[東西]/g, '')}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className={`font-serif font-bold truncate pr-2 ${isEn ? 'text-sm' : 'text-base'} ${wrestler.isSekitori ? 'text-slate-900' : 'text-slate-700'}`}>
                                {isEn ? wrestler.reading : wrestler.name}
                            </h3>
                            {/* Age Badge */}
                            <span className={`text-[10px] font-mono px-1.5 rounded-sm whitespace-nowrap ${wrestler.age >= 30 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'}`}>
                                {wrestler.age}{isEn ? '' : '歳'}
                            </span>
                        </div>

                        {/* Sub Info Row */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
                            {/* Full Rank for Detail */}
                            <span className="text-slate-400 font-sans truncate min-w-0 flex-1">
                                {formatRank(wrestler.rank, wrestler.rankSide, wrestler.rankNumber)}
                            </span>

                            {/* Stats Stub - simplified for list */}
                            <div className="flex gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap flex-shrink-0">
                                <span title={isEn ? "Mind" : "心"}>{isEn ? "M:" : "心"}{Math.floor(wrestler.stats.mind)}</span>
                                <span title={isEn ? "Tech" : "技"}>{isEn ? "T:" : "技"}{Math.floor(wrestler.stats.technique)}</span>
                                <span title={isEn ? "Body" : "体"}>{isEn ? "B:" : "体"}{Math.floor(wrestler.stats.body)}</span>
                            </div>
                        </div>

                        {/* Skill Badges */}
                        {wrestler.skills && wrestler.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {wrestler.skills.slice(0, 3).map((skill) => (
                                    <SkillBadge key={skill} skill={skill} />
                                ))}
                                {wrestler.skills.length > 3 && <span className="text-[9px] text-slate-400">+{wrestler.skills.length - 3}</span>}
                            </div>
                        )}
                    </div>

                    {/* Injury Overlay */}
                    {wrestler.injuryStatus === 'injured' && (
                        <>
                            <div className="absolute inset-0 bg-white/60 pointer-events-none rounded-sm z-10" />
                            <div className="absolute right-2 top-2 z-20">
                                <span className="inline-block border-2 border-red-500 text-red-500 font-serif font-bold text-xs px-2 py-0.5 rounded-sm bg-white shadow-sm transform rotate-[-5deg]">
                                    {isEn ? 'INJURY' : '休場'} {wrestler.injuryDuration}w
                                </span>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default WrestlerList;
