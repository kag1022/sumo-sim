import React, { useRef, useEffect } from 'react';
import { Wrestler } from '../types';
import { formatRank } from '../utils/formatting';

interface WrestlerListProps {
    wrestlers: Wrestler[];
    onSelect: (wrestler: Wrestler) => void;
}

const WrestlerList: React.FC<WrestlerListProps> = ({ wrestlers, onSelect }) => {
    return (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {wrestlers.map((wrestler) => (
                <div
                    key={wrestler.id}
                    onClick={() => onSelect(wrestler)}
                    className={`
                        relative flex items-center p-3 rounded-md cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md
                        ${wrestler.isSekitori
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
                            </h3>
                            {/* Full Formatted Rank */}
                            <span className="font-serif text-sm font-bold text-stone-600 mr-2">
                                {formatRank(wrestler.rank, wrestler.rankSide, wrestler.rankNumber)}
                            </span>
                        </div>

                        {/* Status / History Stub */}
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-mono">
                            <span>心 {wrestler.stats.mind}</span>
                            <span>技 {wrestler.stats.technique}</span>
                            <span>体 {wrestler.stats.body}</span>

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
                            <div className="absolute inset-0 bg-slate-200/50 grayscale-[0.5] rounded-md pointer-events-none" />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-red-600 text-red-600 font-serif font-bold text-xl p-1 opacity-80 rotate-[-12deg] pointer-events-none whitespace-nowrap bg-white/80">
                                休 場
                            </div>
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-1 rounded font-bold">
                                怪我
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default WrestlerList;
