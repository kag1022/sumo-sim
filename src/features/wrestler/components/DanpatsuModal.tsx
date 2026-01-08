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
    const [snipCount, setSnipCount] = useState(0); // 0 to 3
    const [log, setLog] = useState<string[]>([]);
    const [totalStats, setTotalStats] = useState({ wins: 0, losses: 0, yusho: 0 });

    useEffect(() => {
        // Calculate Career Stats
        let wins = 0;
        let losses = 0;
        const history = [...wrestler.history];

        // Add current basho stats if applicable
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

        // Yusho estimation (Requires real history or context, defaulting to 0 for now as it wasn't strictly asked to be fetched from global yet)
        setTotalStats({ wins, losses, yusho: 0 });
    }, [wrestler]);

    const handleSnip = () => {
        if (snipCount >= 3) return;

        const nextCount = snipCount + 1;
        setSnipCount(nextCount);
        setSnipStage('snipping');

        // Text progression
        const messages = [
            "鋏を入れました...",
            "ファンの声援が聞こえます...",
            "最後の一太刀..."
        ];

        setLog(prev => [...prev, messages[nextCount - 1]]);

        if (nextCount === 3) {
            setTimeout(() => {
                setLog(prev => [...prev, "＿＿大銀杏が切り落とされました。"]);
                setSnipStage('done');
            }, 1000);
        } else {
            setTimeout(() => {
                // Reset visual state if we want repeat animation, 
                // but keeping 'snipping' status so icon pulses is fine.
            }, 500);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[100] backdrop-blur-sm p-4">
            {/* Main Card */}
            <div className="bg-[#fcf9f2] max-w-lg w-full rounded-sm shadow-2xl overflow-hidden border-[8px] border-double border-[#b7282e] relative animate-fadeIn">

                {/* Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
                {/* Corner Ornaments */}
                <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-amber-500"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-amber-500"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-amber-500"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-amber-500"></div>

                {/* Header */}
                <div className="pt-10 pb-6 text-center relative z-10">
                    <div className="inline-block bg-[#b7282e] text-white text-xs font-serif font-bold px-6 py-1.5 rounded-full shadow-md mb-4 tracking-[0.2em]">
                        引退断髪式
                    </div>
                    <h2 className="text-5xl font-black font-serif text-slate-900 tracking-tight mb-3">
                        {wrestler.name}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-3"></div>
                    <p className="text-slate-500 font-bold font-serif text-sm tracking-widest">
                        最高位: {formatRank(wrestler.maxRank)}
                    </p>
                </div>

                {/* Stats / Certificate Style */}
                <div className="px-8 pb-8 relative z-10 w-full">
                    <div className="bg-white border-2 border-amber-100 p-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] mx-auto rounded-sm relative w-full">
                        {/* Watermark in background */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none overflow-hidden">
                            <span className="text-9xl font-serif font-black text-amber-900 transform -rotate-12">感謝</span>
                        </div>

                        <h3 className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">
                            LIFETIME ACHIEVEMENT
                        </h3>

                        <div className="grid grid-cols-2 divide-x divide-slate-100">
                            <div className="flex flex-col items-center justify-center py-2">
                                <div className="text-4xl font-black font-serif text-[#b7282e] tabular-nums">
                                    {totalStats.wins}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 mt-1">通算勝星</div>
                            </div>
                            <div className="flex flex-col items-center justify-center py-2">
                                <div className="text-4xl font-black font-serif text-slate-700 tabular-nums">
                                    {totalStats.losses}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 mt-1">通算黒星</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ritual Area */}
                <div className={`p-8 flex flex-col items-center border-t border-amber-100/50 relative z-10 transition-colors duration-1000 ${snipStage === 'done' ? 'bg-gradient-to-b from-pink-50 to-white' : 'bg-gradient-to-b from-[#fcf9f2] to-amber-50'}`}>

                    {/* Progress Bar (Scissors Steps) */}
                    <div className="flex gap-2 mb-6 opacity-80">
                        {[1, 2, 3].map(step => (
                            <div key={step} className={`w-3 h-3 rounded-full transition-all duration-500 ${snipCount >= step ? 'bg-[#b7282e] scale-110 shadow-sm' : 'bg-slate-200'}`}></div>
                        ))}
                    </div>

                    {/* Visual Icon */}
                    <div className={`mb-6 transition-all duration-700 ${snipStage === 'snipping' ? 'scale-105' : ''}`}>
                        <button
                            onClick={handleSnip}
                            disabled={snipStage === 'done'}
                            className={`w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-4 relative transition-all duration-300
                                 ${snipStage === 'done' ? 'border-pink-300 shadow-pink-200 rotate-12 scale-110' : 'border-[#b7282e] hover:scale-105 active:scale-95'}
                             `}
                        >
                            {snipStage === 'done' ? (
                                <span className="text-6xl animate-bounce">💐</span>
                            ) : (
                                <span className="text-6xl filter drop-shadow-md">✂️</span>
                            )}
                        </button>
                    </div>

                    {/* Log Display */}
                    <div className="h-24 flex flex-col items-center justify-end mb-6 space-y-2 w-full">
                        {log.slice(-3).map((l, i) => (
                            <div key={i} className="text-sm font-serif font-bold text-slate-600 animate-fadeInUp text-center">
                                {l}
                            </div>
                        ))}
                        {snipStage === 'done' && (
                            <div className="text-xl font-serif font-bold text-pink-600 animate-popIn mt-2 drop-shadow-sm">
                                長い間、お疲れ様でした！
                            </div>
                        )}
                    </div>

                    {/* Main Action Text Hint */}
                    {snipStage !== 'done' ? (
                        <div className="text-xs text-slate-400 font-bold animate-pulse">
                            鋏アイコンをクリックして儀式を進めてください ({snipCount}/3)
                        </div>
                    ) : (
                        <button
                            onClick={onSnip}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold font-serif py-4 px-12 rounded-sm shadow-xl animate-pulse hover:shadow-pink-500/50 transition-all tracking-widest"
                        >
                            新たな門出を祝福する
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
