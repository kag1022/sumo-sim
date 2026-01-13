import React, { useState } from 'react';
import { Matchup } from '../../../types';
import { useTranslation } from 'react-i18next';

interface DailyMatchListProps {
    matchups: Matchup[];
    onAdvice: (index: number, side: 'east' | 'west') => void;
    currentTp: number;
    mode?: 'full' | 'simple'; // 'full' = Tabs + List (Main Panel), 'simple' = List Only (Sidebar)
}

const DIVISIONS = ['Sekitori', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'] as const;

const DailyMatchList: React.FC<DailyMatchListProps> = ({ matchups, onAdvice, currentTp, mode = 'simple' }) => {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';

    // State for selected division (only used in full mode)
    const [selectedDivision, setSelectedDivision] = useState<string>('Sekitori');

    // Filter matches based on mode
    const displayMatches = React.useMemo(() => {
        let filtered = matchups;
        
        if (mode === 'full') {
            if (selectedDivision === 'Sekitori') {
                filtered = matchups.filter(m => ['Makuuchi', 'Juryo'].includes(m.division));
            } else {
                filtered = matchups.filter(m => m.division === selectedDivision);
            }
        } else {
             filtered = matchups;
        }

        // Reverse to show higher ranks top
        return [...filtered].reverse(); 
    }, [matchups, mode, selectedDivision]);

    // Format Rank Helper
    const formatShortRank = (rank: string) => {
        return t(`rank_short.${rank}`, { defaultValue: rank });
    };

    return (
        <div className={`bg-white/80 h-full flex flex-col ${mode === 'full' ? 'border border-slate-200 rounded-sm shadow-sm' : ''}`}>
            
            {/* Header / Tabs (Full Mode Only) */}
            {mode === 'full' && (
                <div className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {DIVISIONS.map((div) => (
                            <button
                                key={div}
                                onClick={() => setSelectedDivision(div)}
                                className={`
                                    flex-shrink-0 px-4 py-3 text-sm font-bold font-serif uppercase tracking-wider transition-colors border-b-2
                                    ${selectedDivision === div 
                                        ? 'border-[#b7282e] text-[#b7282e] bg-white' 
                                        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'}
                                `}
                            >
                                {t(`rank.${div}`, div)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Simple Mode Header */}
            {mode === 'simple' && (
                <div className="bg-slate-100 text-xs font-bold text-slate-500 px-3 py-1 flex justify-between items-center border-b border-slate-200">
                    <span>{t('matches.title')}</span>
                    <span className="bg-white px-1.5 rounded border border-slate-200 text-[10px]">{t('matches.division_hint')}</span>
                </div>
            )}

            {/* Match List */}
            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar bg-slate-50/30">
                {displayMatches.length === 0 ? (
                    <div className="text-center text-slate-400 py-12 flex flex-col items-center justify-center h-full">
                        <span className="text-2xl mb-2 opacity-30">🈳</span>
                        <span className="text-xs">{t('matches.not_announced')}</span>
                    </div>
                ) : (
                    displayMatches.map((m, idx) => {
                        const isPlayerEast = m.east.heyaId === 'player_heya';
                        const isPlayerWest = m.west.heyaId === 'player_heya';
                        const hasPlayer = isPlayerEast || isPlayerWest;

                        const eastWin = m.winnerId === m.east.id;
                        const westWin = m.winnerId === m.west.id;
                        const finished = m.winnerId !== null;

                        const isKinboshi = m.tags?.includes('KinboshiChallenge');
                        const isTitle = m.tags?.includes('TitleBout');

                        // Enhanced Styling for Torikumi-hyo
                        let containerClass = "bg-white border-b border-slate-200 hover:bg-slate-50 relative group";
                        let mainContainer = "flex items-center justify-between py-3 px-2 sm:px-4 gap-2";
                        
                        // Highlight Player Match
                        if (hasPlayer) {
                            containerClass += " bg-amber-50/50 hover:bg-amber-50";
                            mainContainer += " ring-2 ring-inset ring-amber-400/30 rounded-sm my-1";
                        }

                        // Status Badge
                        let badge = null;
                        if (isKinboshi) badge = <span className="absolute top-0.5 right-1 text-[9px] bg-yellow-400 text-yellow-900 px-1 rounded font-bold">{t('matches.kinboshi')}</span>;
                        else if (isTitle) badge = <span className="absolute top-0.5 right-1 text-[9px] bg-red-600 text-white px-1 rounded font-bold">{t('matches.title_bout')}</span>;
                        
                        return (
                            <div key={idx} className={containerClass}>
                                {badge}
                                <div className={mainContainer}>
                                    
                                    {/* EAST Side */}
                                    <div className={`flex-1 flex justify-end items-center gap-3 text-right ${eastWin ? 'text-slate-900' : (finished ? 'text-slate-400 opacity-80' : 'text-slate-700')}`}>
                                        <div className="flex flex-col items-end">
                                            <span className={`font-serif text-sm leading-tight ${isPlayerEast ? 'font-bold text-slate-900 border-b border-amber-400' : ''}`}>
                                                {isEn ? m.east.reading : m.east.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5">
                                                 <span>{formatShortRank(m.east.rank)}</span>
                                                 {eastWin && <span className="text-red-600 font-bold">○</span>}
                                                 {finished && !eastWin && <span className="text-slate-500 font-bold">●</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CENTER (VS / Kimarite) */}
                                    <div className="w-16 shrink-0 flex flex-col items-center justify-center relative z-10">
                                         {/* Vertical Divider Line Visualization */}
                                         <div className="absolute inset-y-0 w-px bg-slate-200 left-1/2 -z-10 group-hover:bg-slate-300"></div>
                                         
                                         {finished ? (
                                             <div className="bg-white px-1 py-0.5 text-center border border-slate-200 shadow-sm rounded-sm">
                                                 <div className="text-[9px] text-slate-400 leading-none mb-0.5">{t('matches.kimarite')}</div>
                                                 <div className="font-serif font-bold text-[10px] whitespace-nowrap text-slate-800">
                                                     {m.kimarite ? t(`kimarite.${m.kimarite}`, m.kimarite) : '寄り切り'}
                                                 </div>
                                             </div>
                                         ) : (
                                             <div className="bg-white px-1.5 py-0.5 text-xs font-bold font-mono text-slate-300 tracking-widest border border-slate-100 rounded-sm">
                                                 VS
                                             </div>
                                         )}

                                         {/* Advice Button Logic */}
                                         {!finished && (
                                            <div className="mt-1">
                                                {(isPlayerEast && !m.tacticalBonus?.east) && (
                                                    <button onClick={() => onAdvice(matchups.indexOf(m), 'east')} disabled={currentTp < 5} className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1 rounded hover:bg-red-100">
                                                        {t('matches.advice_action')}
                                                    </button>
                                                )}
                                                {(isPlayerWest && !m.tacticalBonus?.west) && (
                                                    <button onClick={() => onAdvice(matchups.indexOf(m), 'west')} disabled={currentTp < 5} className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1 rounded hover:bg-red-100">
                                                        {t('matches.advice_action')}
                                                    </button>
                                                )}
                                                {(m.tacticalBonus?.east || m.tacticalBonus?.west) && (
                                                     <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1 rounded border border-amber-100">{t('matches.advised')}</span>
                                                )}
                                            </div>
                                         )}
                                    </div>

                                    {/* WEST Side */}
                                    <div className={`flex-1 flex justify-start items-center gap-3 text-left ${westWin ? 'text-slate-900' : (finished ? 'text-slate-400 opacity-80' : 'text-slate-700')}`}>
                                        <div className="flex flex-col items-start">
                                            <span className={`font-serif text-sm leading-tight ${isPlayerWest ? 'font-bold text-slate-900 border-b border-amber-400' : ''}`}>
                                                {isEn ? m.west.reading : m.west.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5">
                                                 {westWin && <span className="text-red-600 font-bold">○</span>}
                                                 {finished && !westWin && <span className="text-slate-500 font-bold">●</span>}
                                                 <span>{formatShortRank(m.west.rank)}</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DailyMatchList;
