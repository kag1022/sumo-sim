import React from 'react';
import { createPortal } from 'react-dom';
import { BookOpen } from 'lucide-react';
import { SKILL_REGISTRY, SkillTier } from '../data/skillRegistry';
import { useTranslation } from 'react-i18next';
import { useGame } from '../../../context/GameContext';
import { useWrestlerActions } from '../hooks/useWrestlerActions';

interface SkillBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedWrestlerId?: string | null;
}

export const SkillBookModal: React.FC<SkillBookModalProps> = ({ isOpen, onClose, selectedWrestlerId }) => {
    const { t, i18n } = useTranslation();
    const { wrestlers } = useGame();
    const { forgetSkill } = useWrestlerActions();

    if (!isOpen) return null;

    const selectedWrestler = wrestlers.find(w => w.id === selectedWrestlerId);

    const getTierColor = (tier: SkillTier) => {
        switch (tier) {
            case 'S': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'A': return 'text-red-600 bg-red-50 border-red-200';
            case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'C': return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (!selectedWrestler) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#fcf9f2] w-full max-w-2xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-[#b7282e] text-white px-6 py-4 flex justify-between items-center shadow-md shrink-0">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6" /> {t('dictionary.title_manage', 'スキル管理')}
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-[#fcf9f2]">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                            <div className="text-xl font-bold font-serif">
                                {i18n.language === 'en' ? selectedWrestler.reading : selectedWrestler.name}
                            </div>
                            <div className="text-sm text-slate-600">{t('dictionary.owned_skills')}: {selectedWrestler.skills.length} / 3</div>
                        </div>

                        <div className="space-y-3">
                            {selectedWrestler.skills.length === 0 ? (
                                <div className="text-center text-slate-400 py-8">
                                    {t('dictionary.no_skills')}
                                </div>
                            ) : (
                                selectedWrestler.skills.map((skillId) => {
                                    const skill = SKILL_REGISTRY[skillId as keyof typeof SKILL_REGISTRY];
                                    if (!skill) return null; // Should not happen

                                    return (
                                        <div key={skillId} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${getTierColor(skill.tier)}`}>
                                                        {t(`rank.${skill.tier}`)}
                                                    </span>
                                                    <span className="font-bold text-lg text-slate-800">{t(`skills.${skill.id}.name`)}</span>
                                                </div>
                                                <p className="text-slate-600 text-sm mt-1">{t(`skills.${skill.id}.desc`)}</p>
                                            </div>
                                            <button
                                                onClick={() => forgetSkill(selectedWrestlerId!, skillId)}
                                                className="text-red-500 hover:text-red-700 text-sm font-bold px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                                            >
                                                {t('dictionary.forget')} {t('dictionary.forget_cost')}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
