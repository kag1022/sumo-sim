import React, { useState, useMemo } from 'react';
import { useGame } from '../../../context/GameContext';
import { KIMARITE_DATA, KimariteDef, KimariteType } from '../../match/data/kimariteData';
import { ACHIEVEMENTS } from '../data/achievements';
import { SKILL_REGISTRY, SkillTier, SkillDef } from '../../wrestler/data/skillRegistry';
import { Book, Trophy, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ModalShell from '../../../components/ui/ModalShell';
import SectionHeader from '../../../components/ui/SectionHeader';
import TabList from '../../../components/ui/TabList';

interface EncyclopediaModalProps {
    onClose: () => void;
}

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({ onClose }) => {
    const { kimariteCounts, unlockedAchievements } = useGame();
    const [activeTab, setActiveTab] = useState<'kimarite' | 'skills' | 'achievements'>('kimarite');
    const { t } = useTranslation();

    // Kimarite Tab Logic
    // ----------------------------------------------------
    const discoveredKimariteCount = Object.keys(kimariteCounts).length;
    const totalKimariteCount = KIMARITE_DATA.length;

    // Group by Type
    const groupedKimarite = useMemo(() => {
        const groups: Record<KimariteType, KimariteDef[]> = {
            Push: [], Grapple: [], Throw: [], Tech: [], Special: []
        };
        KIMARITE_DATA.forEach(k => groups[k.type].push(k));
        return groups;
    }, []);

    // Skill Tab Logic
    // ----------------------------------------------------
    const skillsByTier: Record<SkillTier, SkillDef[]> = {
        'S': [], 'A': [], 'B': [], 'C': []
    };
    Object.values(SKILL_REGISTRY).forEach(skill => {
        skillsByTier[skill.tier].push(skill);
    });

    const getTierColor = (tier: SkillTier) => {
        switch (tier) {
            case 'S': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'A': return 'text-red-600 bg-red-50 border-red-200';
            case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'C': return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // Achievement Tab Logic
    // ----------------------------------------------------
    const achievementCompletion = useMemo(() => {
        const uniqueUnlocked = new Set(unlockedAchievements);
        const unlocked = uniqueUnlocked.size;
        const total = ACHIEVEMENTS.length;
        return Math.floor((unlocked / total) * 100);
    }, [unlockedAchievements]);

    return (
        <ModalShell
            onClose={onClose}
            header={<></>}
            className="max-w-4xl max-h-[90vh] border-2 border-[#b7282e]"
            bodyClassName="flex flex-col h-full"
        >
            {/* Header */}
            <div className="px-6 pt-6">
                <SectionHeader
                    eyebrow={t('encyclopedia.subtitle')}
                    title={t('encyclopedia.title')}
                    illustrationKey="encyclopedia"
                    icon={<Book className="w-4 h-4" />}
                    actions={<></>}
                />
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4">
                <TabList
                    tabs={[
                        { id: 'kimarite', label: t('encyclopedia.tabs.kimarite') },
                        { id: 'skills', label: t('dictionary.title') },
                        { id: 'achievements', label: t('encyclopedia.tabs.achievements') },
                    ]}
                    activeId={activeTab}
                    onChange={(id) => setActiveTab(id as any)}
                />
            </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-[#fcf9f2]">

                    {/* KIMARITE TAB */}
                    {activeTab === 'kimarite' && (
                        <div className="space-y-8">
                            {/* Summary */}
                            <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                                <span className="font-bold text-slate-700">{t('encyclopedia.discovered')}</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-mono font-bold text-[#b7282e]">{discoveredKimariteCount}</span>
                                    <span className="text-slate-400 mb-1">/ {totalKimariteCount}</span>
                                </div>
                            </div>

                            {/* Groups */}
                            {(Object.entries(groupedKimarite) as [KimariteType, KimariteDef[]][]).map(([type, moves]) => (
                                <div key={type}>
                                    <h3 className="text-lg font-bold font-serif text-slate-800 mb-3 border-l-4 border-slate-300 pl-3">
                                        {t(`encyclopedia.types.${type}`)}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {moves.map((k) => {
                                            const count = kimariteCounts[k.id] || 0;
                                            const isDiscovered = count > 0;

                                            return (
                                                <div
                                                    key={k.id}
                                                    className={`
                                                        relative p-3 rounded-sm border transition-all text-center group
                                                        ${isDiscovered
                                                            ? 'bg-white border-slate-200 hover:border-[#b7282e] shadow-sm'
                                                            : 'bg-slate-100 border-slate-200 text-slate-400'}
                                                    `}
                                                >
                                                    {isDiscovered ? (
                                                        <>
                                                            <div className="text-xs text-slate-400 mb-1">{t(`encyclopedia.rarity.${k.rarity}`)}</div>
                                                            <div className="font-bold font-serif text-slate-800 mb-1">
                                                                {t(`kimarite.${k.id}`)}
                                                            </div>
                                                            <div className="text-xs font-mono text-[#b7282e] bg-red-50 inline-block px-2 py-0.5 rounded-full">
                                                                {count}{t('encyclopedia.count_suffix')}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full min-h-[60px]">
                                                            <span className="text-xl font-bold opacity-30">???</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SKILL TAB */}
                    {activeTab === 'skills' && (
                        <div className="space-y-6">
                            {(['S', 'A', 'B', 'C'] as SkillTier[]).map(tier => (
                                <div key={tier}>
                                    <h3 className={`text-lg font-bold px-3 py-1 mb-2 border-l-4 rounded-r flex items-center gap-2 ${getTierColor(tier)}`}>
                                        {t(`rank.${tier}`)}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {skillsByTier[tier].map(skill => (
                                            <div key={skill.id} className="p-3 border rounded shadow-sm bg-white hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-slate-800">{t(`skills.${skill.id}.name`)}</span>
                                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{skill.effectType}</span>
                                                </div>
                                                <p className="text-sm text-slate-600">{t(`skills.${skill.id}.desc`)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ACHIEVEMENTS TAB */}
                    {activeTab === 'achievements' && (
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                                <span className="font-bold text-slate-700">{t('encyclopedia.tabs.achievements')}</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-mono font-bold text-amber-500">{achievementCompletion}%</span>
                                    <span className="text-slate-400 mb-1">{t('encyclopedia.complete')}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {ACHIEVEMENTS.map((achievement) => {
                                    const isUnlocked = unlockedAchievements.includes(achievement.id);

                                    // Secret Logic: If secret and NOT unlocked, hide details
                                    const isHidden = achievement.isSecret && !isUnlocked;

                                    return (
                                        <div
                                            key={achievement.id}
                                            className={`
                                                flex items-start gap-4 p-4 rounded-sm border transition-all
                                                ${isUnlocked
                                                    ? 'bg-amber-50 border-amber-200'
                                                    : 'bg-slate-50 border-slate-200 opacity-70'}
                                            `}
                                        >
                                            <div className={`p-3 rounded-full ${isUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                                                {isUnlocked ? <Trophy className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                            </div>

                                            <div className="flex-1">
                                                <h4 className={`font-bold text-lg mb-1 ${isUnlocked ? 'text-amber-900' : 'text-slate-600'}`}>
                                                    {isHidden ? t('encyclopedia.secret_title') : t(`achievements.${achievement.id}.title`)}
                                                </h4>
                                                <p className="text-sm text-slate-600">
                                                    {isHidden ? t('encyclopedia.is_secret') : t(`achievements.${achievement.id}.desc`)}
                                                </p>
                                                {isUnlocked && (
                                                    <div className="mt-2 text-xs font-bold text-amber-600 border border-amber-200 rounded px-2 py-0.5 inline-block bg-white">
                                                        {t('encyclopedia.unlocked')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
        </ModalShell>
    );
};
