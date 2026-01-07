
import React, { useState, useEffect } from 'react';
import { hasSaveData, loadGame } from '../utils/storage';
import { SaveData, GameMode } from '../types';
import { useTranslation } from 'react-i18next';

interface TitleScreenProps {
    onNewGame: (mode: GameMode) => void;
    onLoadGame: (data: SaveData) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onNewGame, onLoadGame }) => {
    const { t } = useTranslation();
    const [hasSave, setHasSave] = useState(false);
    const [isSelectingMode, setIsSelectingMode] = useState(false);

    useEffect(() => {
        setHasSave(hasSaveData());
    }, []);

    const handleLoad = () => {
        const data = loadGame();
        if (data) {
            onLoadGame(data);
        } else {
            alert("セーブデータの読み込みに失敗しました。");
        }
    };

    return (
        <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className={`transition-all duration-700 max-w-4xl w-full flex flex-col items-center relative z-10 ${isSelectingMode ? 'translate-y-0' : 'translate-y-0'}`}>

                {/* Title Section */}
                <div className="mb-12 text-center">
                    <div className="inline-block border-4 border-double border-[#b7282e] p-1 mb-6 rotate-45">
                        <div className="w-4 h-4 bg-[#b7282e] -rotate-45"></div>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-[#b7282e] mb-4 tracking-[-0.05em] leading-none select-none drop-shadow-sm" style={{ fontFamily: '"Zen Old Mincho", serif' }}>
                        {t('app.title')}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-slate-400 text-sm tracking-[0.3em] font-serif uppercase">
                        <span className="h-px w-12 bg-slate-300"></span>
                        {t('app.subtitle')}
                        <span className="h-px w-12 bg-slate-300"></span>
                    </div>
                </div>

                {!isSelectingMode ? (
                    <div className="w-full max-w-xs space-y-6 animate-fadeIn">
                        <button
                            onClick={() => setIsSelectingMode(true)}
                            className="group w-full relative overflow-hidden bg-white text-slate-800 font-bold font-serif text-xl py-4 px-8 rounded-sm shadow-md border border-slate-200 transition-all duration-300 hover:shadow-xl hover:border-[#b7282e] hover:text-[#b7282e]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {t('title.newGame')}
                                <span className="text-xs opacity-50 group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                            <div className="absolute inset-0 bg-red-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                        </button>

                        <button
                            onClick={handleLoad}
                            disabled={!hasSave}
                            className={`w-full relative overflow-hidden font-bold font-serif text-xl py-4 px-8 rounded-sm shadow-sm border transition-all duration-300 ${hasSave
                                ? 'bg-white text-slate-800 border-slate-200 hover:shadow-lg hover:border-blue-300 hover:text-blue-800 cursor-pointer group'
                                : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                }`}
                        >
                            <span className="relative z-10">{t('title.continue')}</span>
                            {hasSave && <div className="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>}
                        </button>
                    </div>
                ) : (
                    <div className="w-full animate-fadeInUp">
                        <h2 className="text-center text-slate-800 text-2xl font-bold mb-8 font-serif flex items-center justify-center gap-2">
                            <span className="text-[#b7282e]">●</span>
                            ゲームモード選択
                            <span className="text-[#b7282e]">●</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-10">
                            {/* Establish Mode */}
                            <button
                                onClick={() => onNewGame('Establish')}
                                className="group relative bg-white p-8 rounded-sm shadow-lg border-2 border-transparent hover:border-[#b7282e] transition-all duration-300 text-left hover:-translate-y-1"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl text-slate-900 group-hover:text-[#b7282e] transition-colors pointer-events-none">独</div>
                                <h3 className="text-3xl font-bold text-slate-800 mb-1 font-serif group-hover:text-[#b7282e] transition-colors">独立</h3>
                                <p className="text-[#b7282e] font-serif text-sm mb-6 tracking-widest">ESTABLISH</p>

                                <p className="text-slate-600 text-sm mb-4 leading-relaxed font-bold">
                                    自らの手で部屋を興す。<br />
                                    茨の道だが栄光は全て自分のもの。
                                </p>

                                <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">資金</span>
                                        <span className="font-bold text-[#b7282e]">300万 (少)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">弟子</span>
                                        <span className="font-bold text-slate-700">1名 (新弟子)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">難易度</span>
                                        <span className="font-bold text-[#b7282e]">HARD</span>
                                    </div>
                                </div>
                            </button>

                            {/* Inherit Mode */}
                            <button
                                onClick={() => onNewGame('Inherit')}
                                className="group relative bg-white p-8 rounded-sm shadow-lg border-2 border-transparent hover:border-blue-500 transition-all duration-300 text-left hover:-translate-y-1"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl text-slate-900 group-hover:text-blue-500 transition-colors pointer-events-none">継</div>
                                <h3 className="text-3xl font-bold text-slate-800 mb-1 font-serif group-hover:text-blue-600 transition-colors">継承</h3>
                                <p className="text-blue-600 font-serif text-sm mb-6 tracking-widest">INHERIT</p>

                                <p className="text-slate-600 text-sm mb-4 leading-relaxed font-bold">
                                    名門部屋を再建する。<br />
                                    基盤はあるが維持する責任がある。
                                </p>

                                <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">資金</span>
                                        <span className="font-bold text-blue-600">1500万 (多)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">弟子</span>
                                        <span className="font-bold text-slate-700">6名 (幕下〜)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">難易度</span>
                                        <span className="font-bold text-blue-600">NORMAL</span>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => setIsSelectingMode(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold border-b border-transparent hover:border-slate-400"
                            >
                                戻る
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-[10px] text-slate-300 font-mono tracking-widest">
                    Ver 0.2.1 - Early Access
                </div>
            </div>
        </div>
    );
};
