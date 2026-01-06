import React from 'react';
import { Wrestler } from '../../../types';
import { formatRank } from '../../../utils/formatting';

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
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedWrestlers.map((wrestler) => (
                <div
                    key={wrestler.id}
                    onClick={() => onSelect(wrestler)}
                    className={`
                        relative flex items-center p-3 rounded-md cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md
                        ${wrestler.rank === 'MaeZumo'
                            ? 'bg-stone-200 border border-stone-300 opacity-80'
                            : wrestler.isSekitori
                                ? 'bg-gradient-to-r from-[#fcf9f2] to-amber-50 border border-amber-200'
                                : 'bg-white border border-slate-200'
                        }
                    `}
                >
                    {/* Rank Badge */}
                    <div className={`
                        w-16 flex-shrink-0 text-center font-bold font-serif
                        ${wrestler.isSekitori ? 'text-amber-800' : 'text-slate-600'}
                    `}>
                        <div className="text-[10px] opacity-70">
                            番付
                        </div>
                        <div className="text-sm leading-tight">
                            {/* Simplified Badge: Just Rank Type or Side? */}
                            {/* Let's show Kanji Rank Type short e.g. "横綱" */}
                            {formatRank(wrestler.rank).split(/(\d|筆)/)[0].replace(/[東西]/g, '')}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="ml-4 flex-1">
                        <div className="flex justify-between items-baseline">
                            <h3 className={`font-serif font-bold text-lg ${wrestler.isSekitori ? 'text-slate-900' : 'text-slate-700'}`}>
                                {wrestler.name}
                                <span className={`ml-2 text-sm font-normal ${wrestler.age >= 35 ? 'text-red-500 font-bold' :
                                    wrestler.age >= 30 ? 'text-amber-500' :
                                        'text-slate-400'
                                    }`}>
                                    ({wrestler.age}歳)
                                </span>
                            </h3>
                            {/* Full Formatted Rank */}
                            <span className="font-serif text-sm font-bold text-stone-600 mr-2">
                                {formatRank(wrestler.rank, wrestler.rankSide, wrestler.rankNumber)}
                            </span>
                        </div>

                        {/* Status / History Stub */}
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-mono">
                            <span>心 {Math.floor(wrestler.stats.mind)}</span>
                            <span>技 {Math.floor(wrestler.stats.technique)}</span>
                            <span>体 {Math.floor(wrestler.stats.body)}</span>

                            {/* Stress Bar */}
                            <div className="flex items-center gap-1 ml-2" title="ストレス">
                                <span className="text-[10px]">ス</span>
                                <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${(wrestler.stress || 0) > 80 ? 'bg-red-500' :
                                            (wrestler.stress || 0) > 50 ? 'bg-amber-400' : 'bg-blue-400'
                                            }`}
                                        style={{ width: `${wrestler.stress || 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Current Basho Stats (if active) */}
                            {wrestler.currentBashoStats.wins + wrestler.currentBashoStats.losses > 0 && (
                                <span className="ml-auto font-bold text-slate-800 bg-slate-100 px-2 rounded">
                                    {wrestler.currentBashoStats.wins}勝 {wrestler.currentBashoStats.losses}敗
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Injury Overlay */}
                    {wrestler.injuryStatus === 'injured' && (
                        <>
                            <div className="absolute inset-0 bg-red-50/80 grayscale-[0.3] rounded-md pointer-events-none border-2 border-red-200" />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-2 rounded pointer-events-none max-w-[90%]">
                                <span className="border-4 border-red-600 text-red-600 font-serif font-black text-2xl px-4 py-1 opacity-90 rotate-[-8deg] bg-white/90 shadow-lg whitespace-nowrap">
                                    休 場
                                </span>
                                <span className="mt-2 text-xs font-bold text-red-700 bg-white/90 px-2 py-0.5 rounded shadow-sm">
                                    全治 {(wrestler.injuryDuration || 0)} 週間
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
