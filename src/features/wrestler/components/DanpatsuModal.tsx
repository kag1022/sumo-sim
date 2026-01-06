import React, { useState, useEffect } from 'react';
import { Wrestler } from '../../../types';
import { formatRank } from '../../../utils/formatting';

interface DanpatsuModalProps {
    wrestler: Wrestler;
    onSnip: () => void;
}

export const DanpatsuModal: React.FC<DanpatsuModalProps> = ({ wrestler, onSnip }) => {
    const [snipStage, setSnipStage] = useState<'ready' | 'snipping' | 'done'>('ready');
    const [log, setLog] = useState<string[]>([]);
    const [totalStats, setTotalStats] = useState({ wins: 0, losses: 0, yusho: 0 });

    useEffect(() => {
        // Calculate Career Stats
        let wins = 0;
        let losses = 0;
        const history = [...wrestler.history];

        // Add current basho stats if any
        if (wrestler.currentBashoStats) {
            wins += wrestler.currentBashoStats.wins;
            losses += wrestler.currentBashoStats.losses;
        }

        // Parse structured history
        history.forEach(entry => {
            // entry is BashoLog (or string if mixed, but we assume migrated)
            // If entry is object:
            if (typeof entry === 'object') {
                wins += entry.wins || 0;
                losses += entry.losses || 0;
            }
        });

        // Yusho count - simplified for now, assuming external valid tracking or derived?
        // Wrestler interface doesn't have explicit yushoCount field.
        // We can just omit or check if "Yusho" string exists in history logic if we implemented that.
        // For now, let's stick to Wins/Losses which are calculated.

        setTotalStats({ wins, losses, yusho: 0 });
    }, [wrestler]);

    const handleSnip = () => {
        setSnipStage('snipping');
        setLog(prev => [...prev, "鋏を入れました..."]);

        setTimeout(() => {
            setLog(prev => [...prev, "チョキン..."]);
            setTimeout(() => {
                setLog(prev => [...prev, "大銀杏が切り落とされました。"]);
                setSnipStage('done');
            }, 1000);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[100] backdrop-blur-sm">
            <div className="bg-stone-100 max-w-lg w-full rounded-lg shadow-2xl overflow-hidden border-4 border-amber-600 animate-fadeIn">
                <div className="bg-amber-700 p-4 text-white text-center">
                    <h2 className="text-2xl font-bold font-serif tracking-widest">引退断髪式</h2>
                </div>

                <div className="p-8 flex flex-col items-center">
                    <div className="w-32 h-32 bg-stone-300 rounded-full mb-6 border-4 border-stone-400 flex items-center justify-center relative shadow-inner">
                        <span className="text-4xl">✂️</span>
                        {/* Overlay visual change if possible, or just symbolic */}
                    </div>

                    <h3 className="text-3xl font-black text-stone-800 mb-2">{wrestler.name}</h3>
                    <p className="text-stone-500 font-bold mb-6">最高位: {formatRank(wrestler.rank)}</p> {/* Note: maxRank not in Wrestler type yet? Using current rank for now or need to add maxRank */}

                    <div className="bg-stone-200 p-4 rounded-lg w-full mb-6 text-center shadow-inner">
                        <p className="text-sm text-stone-500 font-bold uppercase tracking-wider mb-2">生涯通算成績</p>
                        <div className="flex justify-center items-end gap-2">
                            <span className="text-4xl font-black text-[#b7282e]">{totalStats.wins}</span>
                            <span className="text-sm font-bold text-stone-600 mb-1">勝</span>
                            <span className="text-4xl font-black text-stone-700">{totalStats.losses}</span>
                            <span className="text-sm font-bold text-stone-600 mb-1">敗</span>
                        </div>
                    </div>

                    <div className="h-24 w-full bg-white border border-stone-200 rounded p-4 mb-6 overflow-y-auto font-mono text-sm shadow-inner">
                        {log.map((l, i) => (
                            <p key={i} className="mb-1 text-stone-700">{l}</p>
                        ))}
                    </div>

                    {snipStage !== 'done' ? (
                        <button
                            onClick={handleSnip}
                            disabled={snipStage === 'snipping'}
                            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {snipStage === 'snipping' ? '進行中...' : '鋏を入れる'}
                        </button>
                    ) : (
                        <button
                            onClick={onSnip}
                            className="bg-stone-800 hover:bg-stone-700 text-white font-bold py-3 px-8 rounded shadow-lg animate-pulse"
                        >
                            儀式を終了する
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
