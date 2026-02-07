import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wrestler } from '../../../types';
import ModalShell from '../../../components/ui/ModalShell';
import SectionHeader from '../../../components/ui/SectionHeader';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

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
        <ModalShell
            onClose={onClose}
            header={<></>}
            size="sm"
            className="max-w-md"
            bodyClassName="flex flex-col"
            overlayClassName="z-[100]"
        >
            <div className="p-4">
                <SectionHeader
                    eyebrow={t('modal.shikona_change.title', '四股名改名')}
                    title={wrestler.name}
                    subtitle={t('modal.shikona_change.description', { name: wrestler.name, cost: COST })}
                    actions={
                        <></>
                    }
                />
            </div>

            <div className="px-6 pb-6 space-y-4">
                <Input
                    label={t('modal.shikona_change.new_name_label', '新しい四股名')}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={isJapanese ? "例: 雷電" : "Ex: Raiden"}
                />

                {isJapanese && (
                    <Input
                        label={t('modal.shikona_change.new_reading_label', '読み（ローマ字）')}
                        value={newReading}
                        onChange={(e) => setNewReading(e.target.value)}
                        placeholder="例: Raiden"
                    />
                )}

                <div className="bg-amber-50 rounded-sm p-3 border border-amber-100 flex justify-between items-center text-sm">
                    <span className="font-bold text-amber-900">消費 TP</span>
                    <div className={`font-mono font-bold ${canAfford ? 'text-amber-700' : 'text-red-600'}`}>
                        {COST} TP <span className="text-xs font-normal text-amber-900/60">/ {currentTp}</span>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        size="md"
                        className="flex-1"
                    >
                        {t('common.cancel', 'キャンセル')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid || !canAfford}
                        variant="primary"
                        size="md"
                        className="flex-1"
                    >
                        {t('modal.shikona_change.submit', '改名を実行')}
                    </Button>
                </div>
            </div>
        </ModalShell>
    );
};
