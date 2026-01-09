import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wrestler } from '../../../types';

interface ShikonaChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    wrestler: Wrestler;
    currentTp: number;
    onRename: (id: string, name: string, reading: string) => void;
}

export const ShikonaChangeModal: React.FC<ShikonaChangeModalProps> = ({
    isOpen,
    onClose,
    wrestler,
    currentTp,
    onRename
}) => {
    const { t, i18n } = useTranslation();
    const isJapanese = i18n.language === 'ja';

    const [newName, setNewName] = useState('');
    const [newReading, setNewReading] = useState('');

    // Reset state when opening (effect not needed if we rely on component mount/unmount or just reset on close)
    // Actually better to just init state blank.

    if (!isOpen) return null;

    const COST = 50;
    const canAfford = currentTp >= COST;
    const isValid = newName.length > 0 && newName.length <= 10 && (isJapanese ? newReading.length > 0 : true);

    const handleSubmit = () => {
        if (!isValid || !canAfford) return;

        // If English mode, we might auto-fill reading logic, but typically English users input "Reading" as the name visual.
        // However, the system separates Name (Kanji display) and Reading (Romaji sorting/display in EN).
        // If isJapanese is false, we probably just want the user to input the "Name" which is the Romaji name.
        // But wait, the system logic expects `name` (Kanji) and `reading` (Romaji).
        // If English user, they probably can't input Kanji. 
        // So for English users, maybe we set both to the same value?
        // Or we just ask for "Name" and "Reading" is implied?
        // Let's stick to the IntroScreen logic:
        const finalReading = isJapanese ? newReading : (newReading || newName);

        onRename(wrestler.id, newName, finalReading);
        onClose();
        setNewName('');
        setNewReading('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-sm shadow-xl w-full max-w-md border border-stone-200 overflow-hidden">
                {/* Header */}
                <div className="bg-[#b7282e] text-white p-4 flex justify-between items-center">
                    <h2 className="font-serif font-bold text-lg">{t('modal.shikona_change.title', '四股名改名')}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                        {t('modal.shikona_change.description', { name: wrestler.name, cost: COST })}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">
                                {t('modal.shikona_change.new_name_label', '新しい四股名')}
                            </label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full border border-slate-300 rounded-sm px-3 py-2 focus:border-[#b7282e] focus:outline-none"
                                placeholder={isJapanese ? "例: 雷電" : "Ex: Raiden"}
                            />
                        </div>

                        {isJapanese && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">
                                    {t('modal.shikona_change.new_reading_label', '読み（ローマ字）')}
                                </label>
                                <input
                                    type="text"
                                    value={newReading}
                                    onChange={(e) => setNewReading(e.target.value)}
                                    className="w-full border border-slate-300 rounded-sm px-3 py-2 focus:border-[#b7282e] focus:outline-none"
                                    placeholder="例: Raiden"
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 rounded-sm p-3 border border-amber-100 flex justify-between items-center text-sm mt-4">
                        <span className="font-bold text-amber-900">消費 TP</span>
                        <div className={`font-mono font-bold ${canAfford ? 'text-amber-700' : 'text-red-600'}`}>
                            {COST} TP <span className="text-xs font-normal text-amber-900/60">/ {currentTp}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-sm transition-colors"
                        >
                            {t('common.cancel', 'キャンセル')}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!isValid || !canAfford}
                            className="flex-1 bg-[#b7282e] hover:bg-[#a02027] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-sm shadow-md transition-colors"
                        >
                            {t('modal.shikona_change.submit', '改名を実行')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
