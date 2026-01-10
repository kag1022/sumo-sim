
import React from 'react';
import { Wrestler } from '../../../types';
import { formatRank } from '../../../utils/formatting';

import { useTranslation } from 'react-i18next';

interface WrestlerListProps {
    wrestlers: Wrestler[];
    onSelect: (wrestler: Wrestler) => void;
}

const VerticalText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
    <div className={`flex flex-col items-center leading-none ${className}`}>
        {text.split('').map((char, i) => (
            <span key={i} className="block my-[1px]">{char}</span>
        ))}
    </div>
);

const WrestlerList: React.FC<WrestlerListProps> = ({ wrestlers, onSelect }) => {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';

    // Sort logic: Sekitori -> Non-Sekitori -> MaeZumo
    const sortedWrestlers = [...wrestlers].sort((a, b) => {
        if (a.rank === 'MaeZumo' && b.rank !== 'MaeZumo') return 1;
        if (a.rank !== 'MaeZumo' && b.rank === 'MaeZumo') return -1;

        // Sort by Rank Value (simplified check, usually existing logic handles this)
        // Assuming wrestlers list is already sorted by banzuke order or close to it.
        // If not, we rely on parent to pass sorted list, or basic sort here.
        return 0;
    });

    return (
        <div className={`
            p-2 overflow-y-auto custom-scrollbar h-full
            ${isEn ? 'space-y-2' : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'}
        `}>
            {sortedWrestlers.map((wrestler) => {
                const rankStr = formatRank(wrestler.rank).split(/(\d|筆)/)[0].replace(/[東西]/g, '');

                return (
                    <div
                        key={wrestler.id}
                        onClick={() => onSelect(wrestler)}
                        className={`
                            relative cursor-pointer transition-all duration-300 group
                            ${isEn
                                ? 'flex items-center p-3 rounded-sm border hover:shadow-md hover:scale-[1.01]'
                                : 'flex flex-col items-center py-4 px-2 rounded-sm border hover:shadow-lg hover:-translate-y-1 min-h-[180px] justify-between'
                            }
                            ${wrestler.rank === 'MaeZumo'
                                ? 'bg-stone-50 border-stone-200 opacity-70 grayscale'
                                : wrestler.isSekitori
                                    ? 'bg-[#fffaf0] border-amber-200 shadow-sm'
                                    : 'bg-white border-slate-200 shadow-sm'
                            }
                        `}
                    >
                        {/* Washi Texture Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.2\'/%3E%3C/svg%3E")' }}></div>

                        {/* Sekitori Gold Flecks */}
                        {wrestler.isSekitori && !isEn && (
                            <div className="absolute top-0 right-0 w-8 h-8 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #d97706 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                        )}

                        {/* Rank Display */}
                        <div className={`
                            font-bold font-serif flex-shrink-0
                            ${isEn
                                ? 'w-16 text-center border-r border-slate-100 pr-2 mr-2'
                                : 'order-1 mt-2 text-xs text-slate-500 bg-white/50 px-1 py-0.5 rounded border border-slate-100' // Footnote style in Vertical
                            }
                            ${wrestler.isSekitori ? 'text-[#b7282e]' : 'text-slate-500'}
                        `}>
                            {isEn ? (
                                <>
                                    <div className="text-[9px] opacity-60 leading-none mb-1 uppercase tracking-tighter">{t('history.timeline.table_head.rank')}</div>
                                    <div className="text-xs tracking-tight leading-none">{rankStr}</div>
                                </>
                            ) : (
                                // For Vertical View, Rank is shown at bottom or top? 
                                // Tanzaku usually has Rank at top small, Name big below. 
                                // Let's put simplified rank at top.
                                <span>{rankStr}</span>
                            )}
                        </div>

                        {/* Name Display */}
                        <div className={`
                            font-serif font-bold text-slate-900 flex-1 flex items-center justify-center
                            ${isEn ? 'text-sm justify-start' : 'writing-vertical-forced text-lg tracking-widest py-2'}
                        `}>
                            {isEn ? (
                                wrestler.reading || wrestler.name
                            ) : (
                                <VerticalText text={wrestler.name} />
                            )}
                        </div>

                        {/* Stats / Info */}
                        <div className={`
                            text-[10px] font-mono text-slate-500 flex gap-1
                            ${isEn ? 'ml-auto' : 'order-2 mb-1 opacity-60'}
                        `}>
                            {/* Only show minimal info on card */}
                            {isEn ? (
                                <div className="flex gap-2">
                                    <span>{t('wrestler.age_label')}{wrestler.age}</span>
                                    <span title={t('stats.mind')} className="text-slate-400">{t('stats.mind_abbr')}:{Math.floor(wrestler.stats.mind)}</span>
                                </div>
                            ) : (
                                <span>{wrestler.age}{t('wrestler.age_suffix')}</span>
                            )}
                        </div>

                        {/* Injury Overlay */}
                        {wrestler.injuryStatus === 'injured' && (
                            <div className="absolute inset-0 bg-white/50 pointer-events-none z-20 flex items-center justify-center">
                                <span className="border-2 border-red-500 text-red-500 font-serif font-bold text-xs px-2 py-1 rounded-sm bg-white rotate-[-15deg] shadow-md">
                                    {t('wrestler.injury')}
                                </span>
                            </div>
                        )}

                        {/* Selection Highlight */}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-200 rounded-sm pointer-events-none transition-colors"></div>
                    </div>
                );
            })}
        </div>
    );
};

export default WrestlerList;
