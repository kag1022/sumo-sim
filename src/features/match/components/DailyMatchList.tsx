import React from 'react';
import { Matchup } from '../../../types';
import { SkillBadge } from '../../../components/ui/SkillBadge';
import { useTranslation } from 'react-i18next';

interface DailyMatchListProps {
    matchups: Matchup[];
    onAdvice: (index: number, side: 'east' | 'west') => void;
    currentTp: number;
}

const DailyMatchList: React.FC<DailyMatchListProps> = ({ matchups, onAdvice, currentTp }) => {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';

    // Sekitori: Makuuchi or Juryo
    const sekitoriMatches = matchups.filter(m =>
        ['Makuuchi', 'Juryo'].includes(m.division)
    );

    const displayMatches = [...sekitoriMatches].reverse();

    // Helper for minimal rank display (M1, J3 etc)
    const formatShortRank = (rank: string) => {
        // Translation check
        return t(`rank_short.${rank}`, { defaultValue: rank[0] });
    };

    return (
        <div className="bg-white/80 h-full flex flex-col">
            <div className="bg-slate-100 text-xs font-bold text-slate-500 px-3 py-1 flex justify-between items-center border-b border-slate-200">
                <span>{t('matches.title')}</span>
                <span className="bg-white px-1.5 rounded border border-slate-200 text-[10px]">{t('matches.division_hint')}</span>
            </div>

            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
                {displayMatches.length === 0 && (
                    <div className="text-center text-slate-400 py-8 text-xs">
                        {t('matches.not_announced')}
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
                        infoBadge = <span className="ml-1 text-[9px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded shadow-sm font-bold tracking-tighter">{t('matches.kinboshi')}</span>;
                    } else if (isTitle) {
                        containerClass = hasPlayer
                            ? "bg-red-50 border-l-4 border-l-red-500 pl-2"
                            : "bg-red-50/40 border-l-4 border-l-red-500 pl-2";
                        infoBadge = <span className="ml-1 text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded shadow-sm font-bold tracking-tighter">{t('matches.title_bout')}</span>;
                    } else if (isSenshuraku) {
                        containerClass += " border-b-2 border-b-slate-800";
                        infoBadge = <span className="ml-1 text-[9px] bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold tracking-wider">{t('matches.senshuraku')}</span>;
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
                                                {isEn ? m.east.reading : m.east.name}
                                            </span>
                                            <div className="flex gap-2 items-center mt-0.5 text-[9px] text-slate-400 font-mono">
                                                <span>{m.east.currentBashoStats.wins}{t('matches.wins')} {m.east.currentBashoStats.losses}{t('matches.losses')}</span>
                                                <span>{formatShortRank(m.east.rank)}</span>
                                            </div>
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
                                            <span className="text-[10px] text-slate-500 font-serif leading-tight">{t('matches.kimarite')}</span>
                                            <span className="text-[10px] text-slate-700 font-bold font-serif whitespace-nowrap bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200 shadow-sm mt-0.5 min-w-[48px]">
                                                {m.kimarite || '寄り切り'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs text-slate-300 font-bold font-mono tracking-widest">VS</span>
                                            {/* Advice Buttons */}
                                            {isPlayerEast && !m.tacticalBonus?.east && (
                                                <button
                                                    onClick={() => onAdvice(matchups.indexOf(m), 'east')}
                                                    disabled={currentTp < 5}
                                                    className="text-[9px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-1 py-0.5 rounded shadow-sm disabled:opacity-50"
                                                >
                                                    {t('matches.advice_action')}(-5)
                                                </button>
                                            )}
                                            {isPlayerWest && !m.tacticalBonus?.west && (
                                                <button
                                                    onClick={() => onAdvice(matchups.indexOf(m), 'west')}
                                                    disabled={currentTp < 5}
                                                    className="text-[9px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-1 py-0.5 rounded shadow-sm disabled:opacity-50"
                                                >
                                                    {t('matches.advice_action')}(-5)
                                                </button>
                                            )}
                                            {(m.tacticalBonus?.east || m.tacticalBonus?.west) && (
                                                <span className="text-[9px] text-amber-600 font-bold">{t('matches.advised')}</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* West Wrestler */}
                                <div className={`flex-1 text-left flex flex-col justify-center items-start gap-1 ${westWin ? 'text-slate-900' : 'text-slate-400'} transition-all duration-300`}>
                                    <div className="flex items-center gap-2 justify-start">
                                        <div className="flex flex-col items-start">
                                            <span className={`font-serif text-[13px] leading-none ${isPlayerWest ? 'font-bold text-slate-900 border-b-2 border-amber-400 pb-0.5' : ''} ${westWin ? 'font-bold' : ''}`}>
                                                {isEn ? m.west.reading : m.west.name}
                                            </span>
                                            <div className="flex gap-2 items-center mt-0.5 text-[9px] text-slate-400 font-mono">
                                                <span>{formatShortRank(m.west.rank)}</span>
                                                <span>{m.west.currentBashoStats.wins}{t('matches.wins')} {m.west.currentBashoStats.losses}{t('matches.losses')}</span>
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
                {t('matches.omitted_hint')}
            </div>
        </div>
    );
};

export default DailyMatchList;
