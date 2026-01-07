
import React from 'react';
import { Wrestler } from '../../../types';
import { formatRank } from '../../../utils/formatting';
import { SkillBadge } from '../../../components/ui/SkillBadge';

interface WrestlerListProps {
    wrestlers: Wrestler[];
    onSelect: (wrestler: Wrestler) => void;
}

const WrestlerList: React.FC<WrestlerListProps> = ({ wrestlers, onSelect }) => {
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
                        w-14 flex-shrink-0 text-center font-bold font-serif flex flex-col items-center justify-center border-r border-slate-100 pr-2
                        ${wrestler.isSekitori ? 'text-[#b7282e]' : 'text-slate-500'}
                    `}>
                        <div className="text-[9px] opacity-60 leading-none mb-1">
                            番付
                        </div>
                        <div className="text-base leading-none">
                            {formatRank(wrestler.rank).split(/(\d|筆)/)[0].replace(/[東西]/g, '')}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className={`font-serif font-bold text-base truncate ${wrestler.isSekitori ? 'text-slate-900' : 'text-slate-700'}`}>
                                {wrestler.name}
                            </h3>
                            {/* Age Badge */}
                            <span className={`text-[10px] font-mono px-1.5 rounded-sm ${wrestler.age >= 30 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'}`}>
                                {wrestler.age}歳
                            </span>
                        </div>

                        {/* Sub Info Row */}
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                            {/* Full Rank for Detail */}
                            <span className="text-slate-400 font-sans">
                                {formatRank(wrestler.rank, wrestler.rankSide, wrestler.rankNumber)}
                            </span>

                            {/* Stats Stub - simplified for list */}
                            <div className="flex gap-1 ml-auto opacity-70 group-hover:opacity-100 transition-opacity">
                                <span title="心">心{Math.floor(wrestler.stats.mind)}</span>
                                <span title="技">技{Math.floor(wrestler.stats.technique)}</span>
                                <span title="体">体{Math.floor(wrestler.stats.body)}</span>
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
                                    休場 {wrestler.injuryDuration}w
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
