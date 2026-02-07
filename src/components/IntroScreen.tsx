import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { GameMode } from '../types';
import ScreenShell from './layout/ScreenShell';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

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
    const { t, i18n } = useTranslation();
    const isJapanese = i18n.language === 'ja';

    const [oyakataName, setOyakataName] = useState('');
    const [stableName, setStableName] = useState('');
    const [shikonaPrefix, setShikonaPrefix] = useState('');
    const [shikonaPrefixReading, setShikonaPrefixReading] = useState('');

    const handleStart = () => {
        if (!oyakataName || !stableName || !shikonaPrefix) return;
        if (isJapanese && !shikonaPrefixReading) return;

        const finalStableName = stableName.endsWith('部屋') ? stableName : `${stableName}部屋`;
        const finalReading = isJapanese ? shikonaPrefixReading : (shikonaPrefixReading || shikonaPrefix);

        startGame({
            oyakataName,
            stableName: finalStableName,
            shikonaPrefix,
            shikonaPrefixReading: finalReading,
            hometown: isJapanese ? '東京都' : 'Tokyo',
            specialty: 'power',
            location: isJapanese ? '東京都' : 'Tokyo',
            mode: initialMode
        });
    };

    const isValid = oyakataName && stableName && shikonaPrefix && (!isJapanese || shikonaPrefixReading);

    return (
        <ScreenShell maxWidth="md" pattern="seigaiha">
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-8 left-8 z-50 text-slate-400 hover:text-[#b7282e] transition-colors flex items-center gap-2 font-bold font-serif text-sm tracking-widest group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('registration.back')}
                </button>
            )}

            <Card className="p-8 md:p-10">
                <div className="text-center mb-8">
                    <TitleLogo />
                    <h1 className="text-3xl font-black font-serif mb-2 text-slate-800 tracking-tight">
                        {t('registration.title')}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-serif text-xs tracking-[0.2em] uppercase">
                        <span className="w-8 h-px bg-slate-200"></span>
                        {t('registration.subtitle')}
                        <span className="w-8 h-px bg-slate-200"></span>
                    </div>
                </div>

                <div className="space-y-6">
                    <Input
                        label={t('registration.oyakata_label')}
                        placeholder={t('registration.oyakata_hint')}
                        value={oyakataName}
                        onChange={(e) => setOyakataName(e.target.value)}
                    />

                    <Input
                        label={t('registration.stable_label')}
                        placeholder={t('registration.stable_hint')}
                        value={stableName}
                        onChange={(e) => setStableName(e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label={t('registration.prefix_label')}
                            placeholder={t('registration.prefix_hint')}
                            value={shikonaPrefix}
                            onChange={(e) => setShikonaPrefix(e.target.value)}
                        />
                        {isJapanese && (
                            <Input
                                label={t('registration.reading_label')}
                                placeholder={t('registration.reading_hint')}
                                value={shikonaPrefixReading}
                                onChange={(e) => setShikonaPrefixReading(e.target.value)}
                            />
                        )}
                    </div>

                    <Button
                        onClick={handleStart}
                        disabled={!isValid}
                        variant="primary"
                        size="lg"
                        className="w-full mt-2"
                    >
                        {t('registration.submit')}
                    </Button>

                    <div className="text-center text-xs text-stone-400 mt-4 border-t border-stone-100 pt-4 font-serif">
                        {t('registration.note')}
                    </div>
                </div>
            </Card>
        </ScreenShell>
    );
};
