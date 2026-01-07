
import React, { useState, useEffect } from 'react';
import { Wrestler } from '../../../types';
import { formatRank } from '../../../utils/formatting';

interface DanpatsuModalProps {
    wrestler: Wrestler;
    onSnip: () => void;
}

/**
 * 引退断髪式モーダル
 * Theme: "Grand Ceremony" (Bright, Washi & Gold, Formal)
 */
export const DanpatsuModal: React.FC<DanpatsuModalProps> = ({ wrestler, onSnip }) => {
    const [snipStage, setSnipStage] = useState<'ready' | 'snipping' | 'done'>('ready');
    const [log, setLog] = useState<string[]>([]);
    const [totalStats, setTotalStats] = useState({ wins: 0, losses: 0, yusho: 0 });

    useEffect(() => {
        // Calculate Career Stats
        let wins = 0;
        let losses = 0;
        const history = [...wrestler.history];

        // Add current basho stats
        if (wrestler.currentBashoStats) {
            wins += wrestler.currentBashoStats.wins;
            losses += wrestler.currentBashoStats.losses;
        }

        // Parse structured history
        history.forEach(entry => {
            if (typeof entry === 'object') {
                wins += entry.wins || 0;
                losses += entry.losses || 0;
            }
        });

        setTotalStats({ wins, losses, yusho: 0 }); // Todo: Implement Yusho count
    }, [wrestler]);

    const handleSnip = () => {
        setSnipStage('snipping');
        setLog(prev => [...prev, "鋏を入れました..."]);

        setTimeout(() => {
            setLog(prev => [...prev, "チョキン..."]);
            setTimeout(() => {
                setLog(prev => [...prev, "大銀杏が切り落とされました。"]);
                setSnipStage('done');
            }, 1500);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[100] backdrop-blur-sm p-4">
            {/* Main Card */}
            <div className="bg-[#fcf9f2] max-w-lg w-full rounded-sm shadow-2xl overflow-hidden border-[8px] border-double border-[#b7282e] relative animate-fadeIn">

                {/* Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
                {/* Corner Ornaments */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>

                {/* Header */}
                <div className="pt-10 pb-6 text-center relative z-10">
                    <div className="inline-block bg-[#b7282e] text-white text-xs font-serif font-bold px-4 py-1 rounded-full shadow-sm mb-4 tracking-widest">
                        引退断髪式
                    </div>
                    <h2 className="text-4xl font-black font-serif text-slate-900 tracking-tight mb-2">
                        {wrestler.name}
                    </h2>
                    <div className="w-16 h-0.5 bg-amber-400 mx-auto my-2"></div>
                    <p className="text-slate-500 font-bold font-serif text-sm">
                        最高位: {formatRank(wrestler.rank)} {/* Placeholder for maxRank */}
                    </p>
                </div>

                {/* Stats / Certificate */}
                <div className="px-10 py-6 relative z-10">
                    <div className="bg-white border border-stone-200 p-6 shadow-sm mx-auto rounded-sm relative">
                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-8xl font-serif font-black">
                            功
                        </div>

                        <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">LIFETIME RECORD</h3>
                        <div className="flex justify-center items-end gap-1">
                            <div className="text-center px-4 border-r border-slate-100">
                                <div className="text-5xl font-black font-serif text-[#b7282e]">{totalStats.wins}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">WINS</div>
                            </div>
                            <div className="text-center px-4">
                                <div className="text-5xl font-black font-serif text-slate-700">{totalStats.losses}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">LOSSES</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ritual Area */}
                <div className={`p-8 flex flex-col items-center border-t border-amber-100/50 relative z-10 transition-colors duration-1000 ${snipStage === 'done' ? 'bg-gradient-to-b from-pink-50 to-white' : 'bg-gradient-to-b from-[#fcf9f2] to-amber-50'}`}>
                    {/* Scissors Icon / Animation Placeholder */}
                    <div className={`mb-8 transition-all duration-1000 ${snipStage === 'snipping' ? 'scale-110' : ''}`}>
                        <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-2 relative ${snipStage === 'done' ? 'border-pink-200 shadow-pink-100' : 'border-slate-100'}`}>
                            {snipStage === 'done' ? (
                                <span className="text-5xl animate-bounce">🌸</span>
                            ) : (
                                <span className={`text-5xl ${snipStage === 'snipping' ? 'animate-pulse' : ''}`}>✂️</span>
                            )}
                        </div>
                    </div>

                    {/* Log Display */}
                    <div className="h-20 flex flex-col items-center justify-end mb-8 space-y-1 w-full">
                        {log.map((l, i) => (
                            <div key={i} className="text-sm font-serif font-bold text-slate-600 animate-fadeInUp">
                                {l}
                            </div>
                        ))}
                        {snipStage === 'done' && (
                            <div className="text-lg font-serif font-bold text-pink-600 animate-fadeInUp mt-2">
                                長い間、お疲れ様でした！
                            </div>
                        )}
                    </div>

                    {/* Main Action */}
                    {snipStage !== 'done' ? (
                        <button
                            onClick={handleSnip}
                            disabled={snipStage === 'snipping'}
                            className="bg-slate-800 hover:bg-[#b7282e] text-white font-bold font-serif py-4 px-12 rounded-sm shadow-xl transition-all duration-500 hover:tracking-widest disabled:opacity-50 disabled:cursor-wait"
                        >
                            {snipStage === 'snipping' ? '儀式進行中...' : '鋏を入れる'}
                        </button>
                    ) : (
                        <button
                            onClick={onSnip}
                            className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-bold font-serif py-4 px-12 rounded-sm shadow-xl animate-pulse hover:shadow-pink-500/50 transition-all"
                        >
                            新たな門出を祝福する
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
