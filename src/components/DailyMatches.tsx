import React, { useEffect, useState } from 'react';
import { useSumoStore } from '../store/useSumoStore';
import clsx from 'clsx';

export const DailyMatches: React.FC = () => {
    const resultMap = useSumoStore(state => state.dayResults);
    const [visibleCount, setVisibleCount] = useState(0);
    
    // Reset visible count when results change
    useEffect(() => {
        if (resultMap) {
            setVisibleCount(0);
            
            // Staggered reveal effect
            const interval = setInterval(() => {
                setVisibleCount(prev => {
                    if (prev < resultMap.matches.length) return prev + 1;
                    clearInterval(interval);
                    return prev;
                });
            }, 100); // 100ms per match
            return () => clearInterval(interval);
        }
    }, [resultMap]);

    if (!resultMap) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-sumo-paper max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border-4 border-sumo-black flex flex-col">
                <div className="p-4 bg-sumo-black text-white text-center text-2xl font-black font-sumo sticky top-0 z-10">
                    {resultMap.day}日目 取組結果
                </div>
                <div className="p-4 space-y-2">
                    {resultMap.matches.map((match, idx) => {
                        if (idx >= visibleCount) return null;

                        const isEastWinner = match.winnerName === match.eastName;
                        const isMainEvent = idx === resultMap.matches.length - 1; // Musubi

                        return (
                            <div key={idx} className={clsx(
                                "flex items-center justify-between p-2 rounded border-b border-gray-300",
                                isMainEvent ? "bg-sumo-gold/20 py-6 border-b-4 border-sumo-black" : "bg-white"
                            )}>
                                {/* East Fighter */}
                                <div className={clsx("flex-1 text-right flex items-center justify-end gap-2", isEastWinner && "font-bold text-sumo-red")}>
                                    <div>
                                        <div className="text-xs text-gray-500">{match.eastRank}</div>
                                        <div className={clsx("font-sumo text-lg", isMainEvent && "text-2xl")}>{match.eastName}</div>
                                    </div>
                                    <div className="w-8 text-center text-xl">{isEastWinner ? '○' : '●'}</div>
                                </div>

                                {/* Kimarite */}
                                <div className="mx-4 text-center w-32 shrink-0">
                                    <div className="text-xs text-gray-400">決まり手</div>
                                    <div className="font-bold text-sumo-black">{match.kimarite}</div>
                                </div>

                                {/* West Fighter */}
                                <div className={clsx("flex-1 text-left flex items-center justify-start gap-2", !isEastWinner && "font-bold text-sumo-red")}>
                                    <div className="w-8 text-center text-xl">{!isEastWinner ? '○' : '●'}</div>
                                    <div>
                                        <div className="text-xs text-gray-500">{match.westRank}</div>
                                        <div className={clsx("font-sumo text-lg", isMainEvent && "text-2xl")}>{match.westName}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {visibleCount >= resultMap.matches.length && (
                    <div className="p-4 text-center sticky bottom-0 bg-sumo-paper border-t border-gray-300">
                         <button 
                            onClick={() => useSumoStore.setState({ dayResults: null })} // Close modal
                            className="bg-sumo-black text-white px-8 py-2 rounded font-bold hover:opacity-80"
                        >
                            閉じる (Close)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
