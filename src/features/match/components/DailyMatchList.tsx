
import React from 'react';
import { Matchup } from '../../../types';
import { SkillBadge } from '../../../components/ui/SkillBadge';

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

                    const isKinboshi = m.tags?.includes('KinboshiChallenge');
                    const isTitle = m.tags?.includes('TitleBout');
                    const isSenshuraku = m.tags?.includes('Senshuraku');

                    // Dynamic Styling
                    let containerClass = "hover:bg-slate-50 border-l-4 border-l-transparent pl-2";
                    let infoBadge = null;

                    if (hasPlayer) {
                        containerClass = "bg-amber-50/60 border-l-4 border-l-amber-400 pl-2";
                    }

                    if (isKinboshi) {
                        containerClass = hasPlayer
                            ? "bg-amber-100 border-l-4 border-l-yellow-500 pl-2"
                            : "bg-yellow-50 border-l-4 border-l-yellow-400 pl-2";
                        infoBadge = <span className="ml-1 text-[9px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded shadow-sm font-bold tracking-tighter">★金星挑戦</span>;
                    } else if (isTitle) {
                        containerClass = hasPlayer
                            ? "bg-red-50 border-l-4 border-l-red-500 pl-2"
                            : "bg-red-50/40 border-l-4 border-l-red-500 pl-2";
                        infoBadge = <span className="ml-1 text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded shadow-sm font-bold tracking-tighter">🔥優勝争い</span>;
                    } else if (isSenshuraku) {
                        containerClass += " border-b-2 border-b-slate-800";
                        infoBadge = <span className="ml-1 text-[9px] bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold tracking-wider">結び</span>;
                    }

                    return (
                        <div
                            key={idx}
                            className={`
                                flex flex-col justify-center text-xs py-3 px-3 border-b border-slate-200/60 last:border-0
                                transition-colors relative min-h-[64px]
                                ${containerClass}
                            `}
                        >
                            {/* Match Info Header (Absolute Top-Right or Inline) */}
                            {infoBadge && (
                                <div className="absolute top-1 right-2 opacity-90">
                                    {infoBadge}
                                </div>
                            )}

                            <div className="flex items-center justify-between w-full mt-1">
                                {/* East Wrestler */}
                                <div className={`flex-1 text-right flex flex-col justify-center items-end gap-1 ${eastWin ? 'text-slate-900' : 'text-slate-400'} transition-all duration-300`}>
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="flex flex-col items-end">
                                            <span className={`font-serif text-[13px] leading-none ${isPlayerEast ? 'font-bold text-slate-900 border-b-2 border-amber-400 pb-0.5' : ''} ${eastWin ? 'font-bold' : ''}`}>
                                                {m.east.name}
                                            </span>
                                            <div className="flex gap-2 items-center mt-0.5 text-[9px] text-slate-400 font-mono">
                                                <span>{m.east.currentBashoStats.wins}勝 {m.east.currentBashoStats.losses}敗</span>
                                                <span>{formatShortRank(m.east.rank)}</span>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold shadow-sm border ${eastWin ? 'bg-white border-[#b7282e] text-[#b7282e]' : 'bg-slate-50 border-slate-100 text-transparent'}`}>
                                            {eastWin && '○'}
                                        </div>
                                    </div>
                                    {/* Skills */}
                                    {m.east.skills && m.east.skills.length > 0 && (
                                        <div className="flex gap-0.5 justify-end flex-wrap max-w-[140px] opacity-80 hover:opacity-100">
                                            {m.east.skills.map(s => <div key={s} className="scale-[0.8] origin-right"><SkillBadge skill={s} /></div>)}
                                        </div>
                                    )}
                                </div>

                                {/* Center Status (VS or Kimarite) */}
                                <div className="mx-2 w-16 text-center shrink-0 flex flex-col justify-center items-center z-10">
                                    {finished ? (
                                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                            <span className="text-[10px] text-slate-500 font-serif leading-tight">決まり手</span>
                                            <span className="text-[10px] text-slate-700 font-bold font-serif whitespace-nowrap bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200 shadow-sm mt-0.5 min-w-[48px]">
                                                {m.kimarite || '寄り切り'}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-300 font-bold font-mono tracking-widest">VS</span>
                                    )}
                                </div>

                                {/* West Wrestler */}
                                <div className={`flex-1 text-left flex flex-col justify-center items-start gap-1 ${westWin ? 'text-slate-900' : 'text-slate-400'} transition-all duration-300`}>
                                    <div className="flex items-center gap-2 justify-start">
                                        <div className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold shadow-sm border ${westWin ? 'bg-white border-[#b7282e] text-[#b7282e]' : 'bg-slate-50 border-slate-100 text-transparent'}`}>
                                            {westWin && '○'}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className={`font-serif text-[13px] leading-none ${isPlayerWest ? 'font-bold text-slate-900 border-b-2 border-amber-400 pb-0.5' : ''} ${westWin ? 'font-bold' : ''}`}>
                                                {m.west.name}
                                            </span>
                                            <div className="flex gap-2 items-center mt-0.5 text-[9px] text-slate-400 font-mono">
                                                <span>{formatShortRank(m.west.rank)}</span>
                                                <span>{m.west.currentBashoStats.wins}勝 {m.west.currentBashoStats.losses}敗</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Skills */}
                                    {m.west.skills && m.west.skills.length > 0 && (
                                        <div className="flex gap-0.5 justify-start flex-wrap max-w-[140px] opacity-80 hover:opacity-100">
                                            {m.west.skills.map(s => <div key={s} className="scale-[0.8] origin-left"><SkillBadge skill={s} /></div>)}
                                        </div>
                                    )}
                                </div>
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
