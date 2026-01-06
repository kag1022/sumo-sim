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
        <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
            <div className={`transition-all duration-500 max-w-2xl w-full bg-stone-800 p-8 rounded-lg shadow-2xl border border-stone-700 text-center ${isSelectingMode ? 'scale-100' : 'max-w-md'}`}>
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#b7282e] to-[#8c1c22] mb-4 tracking-tighter" style={{ fontFamily: '"Yuji Syuku", serif' }}>
                        {t('app.title')}
                    </h1>
                    <p className="text-stone-400 text-sm tracking-widest uppercase">{t('app.subtitle')}</p>
                </div>

                {!isSelectingMode ? (
                    <div className="space-y-4 max-w-xs mx-auto animate-fadeIn">
                        <button
                            onClick={() => setIsSelectingMode(true)}
                            className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-stone-700 to-stone-600 hover:from-[#b7282e] hover:to-[#8c1c22] rounded transition-all duration-300 transform hover:scale-105 shadow-lg border border-stone-600"
                        >
                            {t('title.newGame')}
                        </button>

                        <button
                            onClick={handleLoad}
                            disabled={!hasSave}
                            className={`w-full py-4 text-xl font-bold rounded transition-all duration-300 shadow-lg border border-stone-600 ${hasSave
                                ? 'text-white bg-gradient-to-r from-stone-700 to-stone-600 hover:from-blue-900 hover:to-blue-800 transform hover:scale-105'
                                : 'text-stone-600 bg-stone-800 border-stone-800 cursor-not-allowed'
                                }`}
                        >
                            {t('title.continue')}
                        </button>
                    </div>
                ) : (
                    <div className="animate-fadeIn">
                        <h2 className="text-white text-xl font-bold mb-6 font-serif">ゲームモード選択</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Establish Mode */}
                            <button
                                onClick={() => onNewGame('Establish')}
                                className="group relative bg-stone-700 hover:bg-stone-600 border border-stone-600 hover:border-[#b7282e] p-6 rounded-lg transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#b7282e] rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h3 className="text-2xl font-bold text-white mb-2 font-serif">独立</h3>
                                <p className="text-stone-400 text-sm mb-4">Establish</p>
                                <div className="text-left text-xs text-stone-300 space-y-2">
                                    <p>自らの手で部屋を興す。<br />茨の道だが栄光は全て自分のもの。</p>
                                    <ul className="list-disc list-inside text-stone-400 mt-2">
                                        <li>資金: <span className="text-[#b7282e]">少 (300万)</span></li>
                                        <li>弟子: <span className="text-white">1名 (新弟子)</span></li>
                                        <li>難易度: <span className="text-[#b7282e]">HARD</span></li>
                                    </ul>
                                </div>
                            </button>

                            {/* Inherit Mode */}
                            <button
                                onClick={() => onNewGame('Inherit')}
                                className="group relative bg-stone-700 hover:bg-stone-600 border border-stone-600 hover:border-blue-500 p-6 rounded-lg transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h3 className="text-2xl font-bold text-white mb-2 font-serif">継承</h3>
                                <p className="text-stone-400 text-sm mb-4">Inherit</p>
                                <div className="text-left text-xs text-stone-300 space-y-2">
                                    <p>名門部屋を再建する。<br />基盤はあるが維持する責任がある。</p>
                                    <ul className="list-disc list-inside text-stone-400 mt-2">
                                        <li>資金: <span className="text-blue-400">多 (1500万)</span></li>
                                        <li>弟子: <span className="text-white">6名 (幕下〜)</span></li>
                                        <li>難易度: <span className="text-blue-400">NORMAL</span></li>
                                    </ul>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsSelectingMode(false)}
                            className="text-stone-500 hover:text-white transition-colors text-sm underline"
                        >
                            戻る
                        </button>
                    </div>
                )}

                <div className="mt-12 text-xs text-stone-600">
                    Ver 0.2.0 - Early Access
                </div>
            </div>
        </div>
    );
};
