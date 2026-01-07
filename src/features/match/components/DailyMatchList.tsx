
import React from 'react';
import { Matchup } from '../../../types';

interface DailyMatchListProps {
    matchups: Matchup[];
}

const DailyMatchList: React.FC<DailyMatchListProps> = ({ matchups }) => {
    // Sekitori: Makuuchi or Juryo
    const sekitoriMatches = matchups.filter(m =>
        ['Makuuchi', 'Juryo'].includes(m.division)
    );

    // Display order: Reverse to show main events last (or top depending on preference, actually Sumo usually shows bottom-up throughout day, but main list is often top-down. 
    // Let's keep it Top-Down (Reverse of generation if generation is 1..N) or Bottom-Up?
    // Usually Torikumi list shows Makuuchi last. 
    // Let's just show as is, assuming passed in order or reverse.
    const displayMatches = [...sekitoriMatches].reverse();

    return (
        <div className="bg-white/80 h-full flex flex-col">
            <div className="bg-slate-100 text-xs font-bold text-slate-500 px-3 py-1 flex justify-between items-center border-b border-slate-200">
                <span>取組一覧</span>
                <span className="bg-white px-1.5 rounded border border-slate-200 text-[10px]">幕内・十両</span>
            </div>

            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
                {displayMatches.length === 0 && (
                    <div className="text-center text-slate-400 py-8 text-xs">
                        取組はまだ発表されていません
                    </div>
                )}

                {displayMatches.map((m, idx) => {
                    const isPlayerEast = m.east.heyaId === 'player_heya';
                    const isPlayerWest = m.west.heyaId === 'player_heya';
                    const hasPlayer = isPlayerEast || isPlayerWest;

                    const eastWin = m.winnerId === m.east.id;
                    const westWin = m.winnerId === m.west.id;
                    const finished = m.winnerId !== null;

                    return (
                        <div
                            key={idx}
                            className={`
                                flex items-center justify-between text-xs py-2.5 px-3 border-b border-slate-100 last:border-0
                                transition-colors
                                ${hasPlayer
                                    ? 'bg-amber-50 border-l-4 border-l-amber-400 pl-2'
                                    : 'hover:bg-slate-50 border-l-4 border-l-transparent pl-2'}
                            `}
                        >
                            {/* East */}
                            <div className={`flex-1 text-right flex items-center justify-end gap-2 ${eastWin ? 'text-slate-900' : 'text-slate-500'} ${westWin ? 'opacity-40 grayscale' : ''}`}>
                                <span className={`font-serif ${isPlayerEast ? 'font-bold text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-2' : ''} ${eastWin ? 'font-bold' : ''}`}>
                                    {m.east.name}
                                </span>
                                <span className="text-[10px] w-5 text-center bg-slate-100 rounded-sm text-slate-500 font-mono self-center">
                                    {formatShortRank(m.east.rank)}
                                </span>
                                <span className={`w-4 text-center font-bold ${eastWin ? 'text-[#b7282e]' : 'invisible'}`}>○</span>
                            </div>

                            {/* Center Status */}
                            <div className="mx-1 w-14 text-center shrink-0 flex justify-center">
                                {finished ? (
                                    <span className="text-[9px] text-slate-400 block truncate font-serif bg-slate-100 px-1 rounded-sm min-w-[36px]">
                                        {m.kimarite || '決り手'}
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-slate-200 font-bold">vs</span>
                                )}
                            </div>

                            {/* West */}
                            <div className={`flex-1 text-left flex items-center justify-start gap-2 ${westWin ? 'text-slate-900' : 'text-slate-500'} ${eastWin ? 'opacity-40 grayscale' : ''}`}>
                                <span className={`w-4 text-center font-bold ${westWin ? 'text-[#b7282e]' : 'invisible'}`}>○</span>
                                <span className="text-[10px] w-5 text-center bg-slate-100 rounded-sm text-slate-500 font-mono self-center">
                                    {formatShortRank(m.west.rank)}
                                </span>
                                <span className={`font-serif ${isPlayerWest ? 'font-bold text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-2' : ''} ${westWin ? 'font-bold' : ''}`}>
                                    {m.west.name}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-slate-50 p-1.5 text-[10px] text-center text-slate-400 border-t border-slate-200">
                ※幕下以下の取組は省略
            </div>
        </div>
    );
};

// Helper for minimal rank display (M1, J3 etc)
const formatShortRank = (rank: string) => {
    if (rank === 'Yokozuna') return '横';
    if (rank === 'Ozeki') return '大';
    if (rank === 'Sekiwake') return '関';
    if (rank === 'Komusubi') return '小';
    if (rank === 'Maegashira') return '前';
    if (rank === 'Juryo') return '十';
    return rank[0];
};

export default DailyMatchList;
