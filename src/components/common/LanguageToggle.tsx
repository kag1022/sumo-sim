import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'ja' ? 'en' : 'ja';
        i18n.changeLanguage(nextLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-slate-200 hover:bg-slate-50 transition-all text-xs font-bold font-sans text-slate-700 hover:text-[#b7282e]"
        >
            <span className={i18n.language === 'en' ? 'text-[#b7282e]' : 'text-slate-400'}>EN</span>
            <span className="text-slate-300">/</span>
            <span className={i18n.language === 'ja' ? 'text-[#b7282e]' : 'text-slate-400'}>JP</span>
        </button>
    );
};
