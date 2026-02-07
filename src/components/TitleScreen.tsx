import React, { useState, useEffect } from 'react';
import { loadGame } from '../utils/storage';
import { SaveData, GameMode } from '../types';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './common/LanguageToggle';
import { BookOpen, Heart, Globe, Play } from 'lucide-react';
import { EncyclopediaModal } from '../features/collection/components/EncyclopediaModal';
import ScreenShell from './layout/ScreenShell';
import Card from './ui/Card';
import Button from './ui/Button';
import SectionHeader from './ui/SectionHeader';
import Illustration from './ui/Illustration';

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
        const playerHeya = saveData.heyas.find(h => h.id === 'player_heya');
        const rank = playerHeya ? `Lv.${playerHeya.facilityLevel}` : '';

        return t('title.continue_desc', {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            rank: rank || ''
        });
    };

    return (
        <ScreenShell maxWidth="xl" pattern="washi" className="flex flex-col items-center gap-8">
            {/* Language Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <LanguageToggle />
            </div>

            {/* Version */}
            <div className="absolute bottom-4 right-6 text-xs text-stone-400 font-mono z-10">
                {t('title.version', { version: '0.2.1' })}
            </div>

            <div className="w-full max-w-5xl">
                <div className="mb-8">
                    <div className="relative overflow-hidden rounded-sm border border-[var(--color-sumo-line)] bg-white shadow-[var(--shadow-md)]">
                        <Illustration illustrationKey="title" heightClassName="h-48 md:h-64" className="absolute inset-0" />
                        <div className="absolute inset-0 bg-white/70" />
                        <div className="relative z-10 p-6 md:p-8 text-center">
                            <div className="text-xs uppercase tracking-[0.4em] text-slate-400 font-bold mb-2">
                                {t('title.game_title')}
                            </div>
                            <div className="text-5xl md:text-7xl font-black text-[#b7282e] tracking-tight drop-shadow-sm leading-none font-serif">
                                {t('title.hero_title')}
                            </div>
                            <div className="mt-4 text-sm text-slate-600 font-semibold">
                                {t('app.subtitle')}
                            </div>
                        </div>
                    </div>
                </div>

                {!isSelectingMode ? (
                    <div className="grid gap-6">
                        <Card className="p-6">
                            <SectionHeader
                                eyebrow={t('title.continue')}
                                title={t('title.continue')}
                                subtitle={saveData ? getContinueDesc() : ''}
                                actions={
                                    <Button
                                        onClick={handleLoad}
                                        disabled={!saveData}
                                        variant="primary"
                                        size="md"
                                        className="gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        {t('title.continue')}
                                    </Button>
                                }
                            />
                        </Card>

                        <Card className="p-6">
                            <SectionHeader
                                eyebrow={t('title.new_game')}
                                title={t('title.new_game')}
                                subtitle={t('title.new_game_desc')}
                                actions={
                                    <Button onClick={() => setIsSelectingMode(true)} variant="outline" size="md">
                                        {t('title.new_game')}
                                    </Button>
                                }
                            />
                        </Card>

                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setShowEncyclopedia(true)}
                                className="flex flex-col items-center gap-2 rounded-sm border border-[var(--color-sumo-line)] bg-white p-4 text-slate-600 hover:border-[#b7282e] hover:text-[#b7282e] transition-colors"
                            >
                                <BookOpen className="w-5 h-5" />
                                <span className="text-xs font-bold">{t('title.collection')}</span>
                            </button>

                            <button className="flex flex-col items-center gap-2 rounded-sm border border-[var(--color-sumo-line)] bg-white p-4 text-slate-600 hover:border-amber-400 hover:text-amber-600 transition-colors">
                                <Heart className="w-5 h-5" />
                                <span className="text-xs font-bold">{t('title.support')}</span>
                            </button>

                            <button className="flex flex-col items-center gap-2 rounded-sm border border-[var(--color-sumo-line)] bg-white p-4 text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors">
                                <Globe className="w-5 h-5" />
                                <span className="text-xs font-bold">{t('title.credits')}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <SectionHeader
                            eyebrow={t('title.mode_select')}
                            title={t('title.mode_select')}
                            subtitle={t('title.new_game_desc')}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <Card className="p-6 hover:shadow-[var(--shadow-md)] transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-2xl font-serif font-bold text-slate-800">{t('title.mode.establish.name')}</div>
                                        <div className="text-xs font-bold text-[#b7282e] tracking-widest mt-1">{t('title.mode.establish.subtitle')}</div>
                                    </div>
                                    <span className="text-4xl font-serif text-[#b7282e]/30">独</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-4">{t('title.mode.establish.desc')}</p>
                                <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                                    <span>{t('title.mode.establish.funds')}</span>
                                    <span className="font-bold text-[#b7282e]">{t('title.mode.establish.funds_val')}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                    <span>{t('title.mode.establish.disciples')}</span>
                                    <span className="font-bold text-slate-700">{t('title.mode.establish.disciples_val')}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                    <span>{t('title.mode.establish.difficulty')}</span>
                                    <span className="font-bold text-[#b7282e]">{t('title.mode.establish.difficulty_val')}</span>
                                </div>
                                <Button onClick={() => onNewGame('Establish')} variant="primary" size="md" className="mt-6 w-full">
                                    {t('cmd.confirm')}
                                </Button>
                            </Card>

                            <Card className="p-6 hover:shadow-[var(--shadow-md)] transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-2xl font-serif font-bold text-slate-800">{t('title.mode.inherit.name')}</div>
                                        <div className="text-xs font-bold text-blue-700 tracking-widest mt-1">{t('title.mode.inherit.subtitle')}</div>
                                    </div>
                                    <span className="text-4xl font-serif text-blue-700/30">継</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-4">{t('title.mode.inherit.desc')}</p>
                                <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                                    <span>{t('title.mode.inherit.funds')}</span>
                                    <span className="font-bold text-blue-600">{t('title.mode.inherit.funds_val')}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                    <span>{t('title.mode.inherit.disciples')}</span>
                                    <span className="font-bold text-slate-700">{t('title.mode.inherit.disciples_val')}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                    <span>{t('title.mode.inherit.difficulty')}</span>
                                    <span className="font-bold text-blue-600">{t('title.mode.inherit.difficulty_val')}</span>
                                </div>
                                <Button onClick={() => onNewGame('Inherit')} variant="outline" size="md" className="mt-6 w-full">
                                    {t('cmd.confirm')}
                                </Button>
                            </Card>
                        </div>

                        <div className="text-center mt-6">
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
        </ScreenShell>
    );
};
