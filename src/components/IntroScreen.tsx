
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t, i18n } = useTranslation();
    const isJapanese = i18n.language === 'ja';

    const [oyakataName, setOyakataName] = useState('');
    const [stableName, setStableName] = useState('');
    const [shikonaPrefix, setShikonaPrefix] = useState('');
    const [shikonaPrefixReading, setShikonaPrefixReading] = useState('');

    const handleStart = () => {
        // Validation: Reading is optional if not Japanese (will fallback to prefix)
        if (!oyakataName || !stableName || !shikonaPrefix) return;
        if (isJapanese && !shikonaPrefixReading) return;

        // Ensure stable name ends with "部屋" (Only for JP or if user didn't add it? Localization handled in creation)
        // For simplicity, let's keep the existing logic but maybe we should make it language aware too later.
        // For now, consistent behavior:
        const finalStableName = stableName.endsWith('部屋') ? stableName : `${stableName}部屋`;

        // If English/Other, use Prefix as Reading if reading is empty
        const finalReading = isJapanese ? shikonaPrefixReading : (shikonaPrefixReading || shikonaPrefix);

        startGame({
            oyakataName,
            stableName: finalStableName,
            shikonaPrefix,
            shikonaPrefixReading: finalReading,
            hometown: isJapanese ? '東京都' : 'Tokyo',
            specialty: 'power', // Default
            location: isJapanese ? '東京都' : 'Tokyo',
            mode: initialMode
        });
    };

    // ... render ...
    // Update button disabled logic
    const isValid = oyakataName && stableName && shikonaPrefix && (!isJapanese || shikonaPrefixReading);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#fcf9f2] z-[9999] overflow-hidden">
            {/* ... background ... */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b7282e 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-8 left-8 z-50 text-slate-400 hover:text-[#b7282e] transition-colors flex items-center gap-2 font-bold font-serif text-sm tracking-widest group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('registration.back')}
                </button>
            )}

            <div className="relative z-10 w-full max-w-lg p-10 bg-white border border-stone-200 rounded-sm shadow-2xl animate-fadeIn m-4">
                {/* Accent Top Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#b7282e]"></div>

                <div className="text-center mb-10">
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
                    <div className="relative group">
                        <label className="block text-xs font-bold text-[#b7282e] mb-1 font-serif tracking-wider">{t('registration.oyakata_label')}</label>
                        <input
                            type="text"
                            className="w-full bg-stone-50 border-b-2 border-stone-200 px-4 py-3 text-slate-800 text-lg font-serif placeholder:text-stone-300 focus:outline-none focus:border-[#b7282e] focus:bg-white transition-colors"
                            placeholder={t('registration.oyakata_hint')}
                            value={oyakataName}
                            onChange={(e) => setOyakataName(e.target.value)}
                        />
                        <div className="absolute bottom-3 right-3 text-stone-300 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-bold text-[#b7282e] mb-1 font-serif tracking-wider">{t('registration.stable_label')}</label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                className="w-full bg-stone-50 border-b-2 border-stone-200 px-4 py-3 text-slate-800 text-lg font-serif placeholder:text-stone-300 focus:outline-none focus:border-[#b7282e] focus:bg-white transition-colors"
                                placeholder={t('registration.stable_hint')}
                                value={stableName}
                                onChange={(e) => setStableName(e.target.value)}
                            />
                            <span className="absolute right-0 bottom-3 text-slate-400 font-serif text-sm pointer-events-none"></span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="block text-xs font-bold text-[#b7282e] mb-1 font-serif tracking-wider">{t('registration.prefix_label')}</label>
                            <input
                                type="text"
                                className="w-full bg-stone-50 border-b-2 border-stone-200 px-4 py-3 text-slate-800 text-lg font-serif placeholder:text-stone-300 focus:outline-none focus:border-[#b7282e] focus:bg-white transition-colors"
                                placeholder={t('registration.prefix_hint')}
                                value={shikonaPrefix}
                                onChange={(e) => setShikonaPrefix(e.target.value)}
                            />
                        </div>
                        {isJapanese && (
                            <div className="relative">
                                <label className="block text-xs font-bold text-[#b7282e] mb-1 font-serif tracking-wider">{t('registration.reading_label')}</label>
                                <input
                                    type="text"
                                    className="w-full bg-stone-50 border-b-2 border-stone-200 px-4 py-3 text-slate-800 text-lg font-serif placeholder:text-stone-300 focus:outline-none focus:border-[#b7282e] focus:bg-white transition-colors"
                                    placeholder={t('registration.reading_hint')}
                                    value={shikonaPrefixReading}
                                    onChange={(e) => setShikonaPrefixReading(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!isValid}
                        className="w-full bg-[#b7282e] hover:bg-[#a01e23] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold font-serif text-lg py-4 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 mt-6 relative overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {t('registration.submit')}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">→</span>
                        </span>
                    </button>

                    <div className="text-center text-xs text-stone-400 mt-4 border-t border-stone-100 pt-4 font-serif">
                        {t('registration.note')}
                    </div>
                </div>
            </div>
        </div>
    );
};
