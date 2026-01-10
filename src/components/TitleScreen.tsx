
import React, { useState, useEffect } from 'react';
import { loadGame } from '../utils/storage';
import { SaveData, GameMode } from '../types';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './common/LanguageToggle';
import { BookOpen, Heart, Globe, Play, PlusCircle } from 'lucide-react';
import { EncyclopediaModal } from '../features/collection/components/EncyclopediaModal';

interface TitleScreenProps {
    onNewGame: (mode: GameMode) => void;
    onLoadGame: (data: SaveData) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onNewGame, onLoadGame }) => {
    const { t } = useTranslation();
    const [saveData, setSaveData] = useState<SaveData | null>(null);
    const [isSelectingMode, setIsSelectingMode] = useState(false);
    const [showEncyclopedia, setShowEncyclopedia] = useState(false);

    useEffect(() => {
        const data = loadGame();
        if (data) {
            setSaveData(data);
        }
    }, []);

    const handleLoad = () => {
        if (saveData) {
            onLoadGame(saveData);
        } else {
            alert("セーブデータの読み込みに失敗しました。");
        }
    };

    const getContinueDesc = () => {
        if (!saveData) return '';
        const date = new Date(saveData.gameState.currentDate);
        // Assuming start year is 2024 (or calculate from diff)
        // Game usually starts 2025-01.
        // Let's just show actual year or "Year X".
        // User requested "{{year}}年 {{month}}月場所"
        // Let's use relative year if we tracked it, or just use calendar year.
        // I will use calendar year for now: date.getFullYear()

        // Rank? "player_heya" rank.
        const playerHeya = saveData.heyas.find(h => h.id === 'player_heya');
        const rank = playerHeya ? `Lv.${playerHeya.facilityLevel}` : ''; // Or "Rank X" if defined.

        return t('title.continue_desc', {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            rank: rank || ''
        });
    };

    return (
        <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center p-4 relative overflow-hidden font-serif">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>

            {/* Subtle Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-200/30 pointer-events-none"></div>

            {/* Language Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <LanguageToggle />
            </div>

            {/* Version */}
            <div className="absolute bottom-4 right-6 text-xs text-stone-400 font-mono z-10">
                {t('title.version', { version: '0.2.1' })}
            </div>

            <div className={`transition-all duration-700 max-w-5xl w-full flex flex-col items-center relative z-10 ${isSelectingMode ? 'translate-y-0' : 'translate-y-0'}`}>

                {/* Logo Area */}
                <div className="mb-14 text-center relative group cursor-default">
                    {/* Sumoji / Logo */}
                    <div className="relative inline-block">
                        {/* Circle Decor */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-colors duration-700"></div>

                        <div className="text-8xl md:text-9xl font-black text-[#b7282e] tracking-tight drop-shadow-sm leading-none flex items-center gap-4 justify-center" style={{ fontFamily: '"Zen Old Mincho", serif' }}>
                            {/* Vertical Writing for specific feel if JP */}
                            <span className="writing-vertical-rl text-stone-900 text-lg font-bold tracking-[0.5em] opacity-60 mr-4 h-32 hidden md:block border-l border-stone-300 pl-2">
                                {t('title.game_title')}
                            </span>
                            <span className="scale-y-110">{t('title.hero_title')}</span>
                        </div>
                    </div>
                </div>

                {!isSelectingMode ? (
                    <div className="w-full max-w-md space-y-6 animate-fadeIn flex flex-col items-center">

                        {/* Continue Button */}
                        <button
                            onClick={handleLoad}
                            disabled={!saveData}
                            className={`
                                group w-full relative overflow-hidden bg-white 
                                border-l-4 ${saveData ? 'border-[#b7282e] hover:border-l-8' : 'border-stone-300 opacity-60 cursor-not-allowed'}
                                shadow-lg hover:shadow-xl transition-all duration-300
                                py-6 px-6 text-left flex items-center justify-between
                            `}
                        >
                            <div className="relative z-10">
                                <div className={`text-2xl font-black text-stone-900 group-hover:text-[#b7282e] transition-colors mb-1 flex items-center gap-2`}>
                                    {t('title.continue')}
                                </div>
                                {saveData && (
                                    <div className="text-sm font-bold text-stone-500 font-sans tracking-wider">
                                        {getContinueDesc()}
                                    </div>
                                )}
                            </div>
                            {saveData && <Play className="w-6 h-6 text-stone-300 group-hover:text-[#b7282e] transition-colors" />}

                            {/* Hover Effect */}
                            {saveData && <div className="absolute inset-0 bg-[#b7282e]/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>}
                        </button>

                        {/* New Game Button */}
                        <button
                            onClick={() => setIsSelectingMode(true)}
                            className="
                                group w-full relative overflow-hidden bg-[#fcf9f2] 
                                border-2 border-dashed border-stone-300 hover:border-[#b7282e]
                                py-5 px-6 text-center transition-all duration-300
                                hover:bg-white hover:shadow-md
                            "
                        >
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="text-xl font-bold text-stone-600 group-hover:text-[#b7282e] transition-colors mb-0.5 flex items-center gap-2">
                                    <PlusCircle className="w-5 h-5" />
                                    {t('title.new_game')}
                                </div>
                                <div className="text-xs text-stone-400 group-hover:text-stone-500 font-sans">
                                    {t('title.new_game_desc')}
                                </div>
                            </div>
                        </button>

                        {/* Tertiary Menu (Grid) */}
                        <div className="grid grid-cols-3 gap-4 w-full pt-4">
                            <button
                                onClick={() => setShowEncyclopedia(true)}
                                className="flex flex-col items-center gap-2 p-3 rounded-sm hover:bg-stone-100 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 group-hover:bg-[#b7282e] group-hover:text-white transition-colors">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-stone-500">{t('title.collection')}</span>
                            </button>

                            <button className="flex flex-col items-center gap-2 p-3 rounded-sm hover:bg-stone-100 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <Heart className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-stone-500">{t('title.support')}</span>
                            </button>

                            <button className="flex flex-col items-center gap-2 p-3 rounded-sm hover:bg-stone-100 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-stone-500">{t('title.credits')}</span>
                            </button>
                        </div>

                    </div>
                ) : (
                    <div className="w-full animate-fadeInUp">
                        <h2 className="text-center text-stone-800 text-2xl font-bold mb-8 font-serif flex items-center justify-center gap-2">
                            <span className="text-[#b7282e]">●</span>
                            {t('title.mode_select')}
                            <span className="text-[#b7282e]">●</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-10">
                            {/* Establish Mode */}
                            <button
                                onClick={() => onNewGame('Establish')}
                                className="group relative bg-white p-8 rounded-sm shadow-xl border-4 border-transparent hover:border-[#b7282e] transition-all duration-300 text-left hover:-translate-y-1"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl text-slate-900 group-hover:text-[#b7282e] transition-colors pointer-events-none">独</div>
                                <h3 className="text-3xl font-bold text-slate-800 mb-1 font-serif group-hover:text-[#b7282e] transition-colors">{t('title.mode.establish.name')}</h3>
                                <p className="text-[#b7282e] font-sans text-xs font-bold mb-6 tracking-widest">{t('title.mode.establish.subtitle')}</p>

                                <p className="text-slate-600 text-sm mb-4 leading-relaxed font-bold whitespace-pre-line border-l-2 border-stone-200 pl-3">
                                    {t('title.mode.establish.desc')}
                                </p>

                                <div className="space-y-2 text-xs border-t border-slate-100 pt-4 font-sans">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t('title.mode.establish.funds')}</span>
                                        <span className="font-bold text-[#b7282e]">{t('title.mode.establish.funds_val')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t('title.mode.establish.disciples')}</span>
                                        <span className="font-bold text-slate-700">{t('title.mode.establish.disciples_val')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t('title.mode.establish.difficulty')}</span>
                                        <span className="font-bold text-[#b7282e]">{t('title.mode.establish.difficulty_val')}</span>
                                    </div>
                                </div>
                            </button>

                            {/* Inherit Mode */}
                            <button
                                onClick={() => onNewGame('Inherit')}
                                className="group relative bg-white p-8 rounded-sm shadow-xl border-4 border-transparent hover:border-blue-700 transition-all duration-300 text-left hover:-translate-y-1"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl text-slate-900 group-hover:text-blue-700 transition-colors pointer-events-none">継</div>
                                <h3 className="text-3xl font-bold text-slate-800 mb-1 font-serif group-hover:text-blue-700 transition-colors">{t('title.mode.inherit.name')}</h3>
                                <p className="text-blue-700 font-sans text-xs font-bold mb-6 tracking-widest">{t('title.mode.inherit.subtitle')}</p>

                                <p className="text-slate-600 text-sm mb-4 leading-relaxed font-bold whitespace-pre-line border-l-2 border-stone-200 pl-3">
                                    {t('title.mode.inherit.desc')}
                                </p>

                                <div className="space-y-2 text-xs border-t border-slate-100 pt-4 font-sans">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t('title.mode.inherit.funds')}</span>
                                        <span className="font-bold text-blue-600">{t('title.mode.inherit.funds_val')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t('title.mode.inherit.disciples')}</span>
                                        <span className="font-bold text-slate-700">{t('title.mode.inherit.disciples_val')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t('title.mode.inherit.difficulty')}</span>
                                        <span className="font-bold text-blue-600">{t('title.mode.inherit.difficulty_val')}</span>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => setIsSelectingMode(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold border-b border-transparent hover:border-slate-400"
                            >
                                {t('title.mode.back')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showEncyclopedia && <EncyclopediaModal onClose={() => setShowEncyclopedia(false)} />}

        </div>
    );
};
