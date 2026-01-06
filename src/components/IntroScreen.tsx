import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const TitleLogo = () => (
    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center border-4 border-amber-500 shadow-lg mb-6 mx-auto">
        <span className="text-[#b7282e] font-serif font-black text-4xl leading-none mt-1">力</span>
    </div>
);

interface IntroScreenProps {
    onBack?: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onBack }) => {
    const { startGame } = useGame();

    const [oyakataName, setOyakataName] = useState('');
    const [stableName, setStableName] = useState('朝日部屋');
    const [shikonaPrefix, setShikonaPrefix] = useState('朝');
    const [hometown, setHometown] = useState('東京都');

    const handleStart = () => {
        if (!oyakataName || !stableName || !shikonaPrefix) return;
        startGame({
            oyakataName,
            stableName,
            shikonaPrefix,
            hometown,
            specialty: 'power', // Default or add UI
            location: hometown
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900 text-white z-[9999]">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599571932148-8df0d5761c54?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-8 left-8 z-50 text-white/50 hover:text-white transition-colors flex items-center gap-2 font-bold font-mono text-sm"
                >
                    ← BACK TO TITLE
                </button>
            )}

            <div className="relative z-10 w-full max-w-md p-8 bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl animate-fadeIn">
                <div className="text-center mb-10">
                    <TitleLogo />
                    <h1 className="text-4xl font-black font-serif mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 drop-shadow-sm">
                        相撲部屋経営
                    </h1>
                    <p className="text-white/60 font-mono text-xs tracking-widest">
                        ESTABLISH YOUR STABLE
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-amber-500 mb-1 uppercase tracking-wider">親方名 (Oyakata Name)</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-colors font-serif"
                            placeholder="例: 貴乃花"
                            value={oyakataName}
                            onChange={(e) => setOyakataName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-amber-500 mb-1 uppercase tracking-wider">部屋名 (Stable)</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-colors font-serif"
                                placeholder="例: 朝日"
                                value={stableName}
                                onChange={(e) => setStableName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-amber-500 mb-1 uppercase tracking-wider">四股名冠 (Prefix)</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-colors font-serif"
                                placeholder="例: 朝"
                                value={shikonaPrefix}
                                onChange={(e) => setShikonaPrefix(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-amber-500 mb-1 uppercase tracking-wider">本拠地 (Location)</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-colors font-serif"
                            placeholder="例: 東京都墨田区"
                            value={hometown}
                            onChange={(e) => setHometown(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!oyakataName || !stableName || !shikonaPrefix}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] mt-4"
                    >
                        部屋を開く
                    </button>

                    <div className="text-center text-xs text-white/30 mt-4">
                        ※スタート後の変更不可
                    </div>
                </div>
            </div>
        </div>
    );
};
