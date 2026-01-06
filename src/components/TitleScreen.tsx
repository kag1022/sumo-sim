import React, { useState, useEffect } from 'react';
import { hasSaveData, loadGame } from '../utils/storage';
import { SaveData } from '../types';
import { useTranslation } from 'react-i18next';

interface TitleScreenProps {
    onNewGame: () => void;
    onLoadGame: (data: SaveData) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onNewGame, onLoadGame }) => {
    const { t } = useTranslation();
    const [hasSave, setHasSave] = useState(false);

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
            <div className="max-w-md w-full bg-stone-800 p-8 rounded-lg shadow-2xl border border-stone-700 text-center">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#b7282e] to-[#8c1c22] mb-4 tracking-tighter" style={{ fontFamily: '"Yuji Syuku", serif' }}>
                        {t('app.title')}
                    </h1>
                    <p className="text-stone-400 text-sm tracking-widest uppercase">{t('app.subtitle')}</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={onNewGame}
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

                <div className="mt-12 text-xs text-stone-600">
                    Ver 0.2.0 - Early Access
                </div>
            </div>
        </div>
    );
};
