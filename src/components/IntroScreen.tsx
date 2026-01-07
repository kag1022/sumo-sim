
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameMode } from '../types';

export const TitleLogo = () => (
    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-[#b7282e] shadow-md mb-6 mx-auto relative group">
        <div className="absolute inset-0 rounded-full border border-stone-100 m-1"></div>
        <span className="text-[#b7282e] font-serif font-black text-5xl leading-none mt-1 group-hover:scale-110 transition-transform duration-500">力</span>
    </div>
);

interface IntroScreenProps {
    onBack?: () => void;
    initialMode: GameMode;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onBack, initialMode }) => {
    const { startGame } = useGame();

    const [oyakataName, setOyakataName] = useState('');
    const [stableName, setStableName] = useState('');
    const [shikonaPrefix, setShikonaPrefix] = useState('');
    const [hometown, setHometown] = useState('東京都');

    const handleStart = () => {
        if (!oyakataName || !stableName || !shikonaPrefix) return;

        // Ensure stable name ends with "部屋"
        const finalStableName = stableName.endsWith('部屋') ? stableName : `${stableName}部屋`;

        startGame({
            oyakataName,
            stableName: finalStableName,
            shikonaPrefix,
            hometown,
            specialty: 'power', // Default
            location: hometown,
            mode: initialMode
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#fcf9f2] z-[9999] overflow-hidden">
            {/* Background Texture/Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b7282e 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-8 left-8 z-50 text-slate-400 hover:text-[#b7282e] transition-colors flex items-center gap-2 font-bold font-serif text-sm tracking-widest group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> 戻る (BACK)
                </button>
            )}

            <div className="relative z-10 w-full max-w-lg p-10 bg-white border border-stone-200 rounded-sm shadow-2xl animate-fadeIn m-4">
                {/* Accent Top Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#b7282e]"></div>

                <div className="text-center mb-10">
                    <TitleLogo />
                    <h1 className="text-3xl font-black font-serif mb-2 text-slate-800 tracking-tight">
                        部屋設立届
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-serif text-xs tracking-[0.2em] uppercase">
                        <span className="w-8 h-px bg-slate-200"></span>
                        Registration
                        <span className="w-8 h-px bg-slate-200"></span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="relative group">
                        <label className="block text-xs font-bold text-[#b7282e] mb-1 font-serif tracking-wider">親方名 (OYAKATA NAME)</label>
                        <input
                            type="text"
                            className="w-full bg-stone-50 border-b-2 border-stone-200 px-4 py-3 text-slate-800 text-lg font-serif placeholder:text-stone-300 focus:outline-none focus:border-[#b7282e] focus:bg-white transition-colors"
                            placeholder="例: 貴乃花"
                            value={oyakataName}
                            onChange={(e) => setOyakataName(e.target.value)}
                        />
                        <div className="absolute bottom-3 right-3 text-stone-300 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="block text-xs font-bold text-[#b7282e] mb-1 font-serif tracking-wider">部屋名 (STABLE)</label>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    className="w-full bg-stone-50 border-b-2 border-stone-200 px-4 py-3 text-slate-800 text-lg font-serif placeholder:text-stone-300 focus:outline-none focus:border-[#b7282e] focus:bg-white transition-colors"
                                    placeholder="例: 朝日"
                                    value={stableName}
                                    onChange={(e) => setStableName(e.target.value)}
                                />
                                <span className="absolute right-0 bottom-3 text-slate-400 font-serif text-sm pointer-events-none"></span>
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-xs font-bold text-[#b7282e] mb-1 font-serif tracking-wider">四股名冠 (PREFIX)</label>
                            <input
                                type="text"
                                className="w-full bg-stone-50 border-b-2 border-stone-200 px-4 py-3 text-slate-800 text-lg font-serif placeholder:text-stone-300 focus:outline-none focus:border-[#b7282e] focus:bg-white transition-colors"
                                placeholder="例: 朝"
                                value={shikonaPrefix}
                                onChange={(e) => setShikonaPrefix(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-bold text-[#b7282e] mb-1 font-serif tracking-wider">本拠地 (LOCATION)</label>
                        <input
                            type="text"
                            className="w-full bg-stone-50 border-b-2 border-stone-200 px-4 py-3 text-slate-800 text-lg font-serif placeholder:text-stone-300 focus:outline-none focus:border-[#b7282e] focus:bg-white transition-colors"
                            placeholder="例: 東京都墨田区"
                            value={hometown}
                            onChange={(e) => setHometown(e.target.value)}
                        />
                        <div className="absolute bottom-3 right-3 text-stone-300 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!oyakataName || !stableName || !shikonaPrefix}
                        className="w-full bg-[#b7282e] hover:bg-[#a01e23] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold font-serif text-lg py-4 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 mt-6 relative overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            承認印を押して開始
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">→</span>
                        </span>
                    </button>

                    <div className="text-center text-xs text-stone-400 mt-4 border-t border-stone-100 pt-4 font-serif">
                        ※提出後の変更はできません
                    </div>
                </div>
            </div>
        </div>
    );
};
