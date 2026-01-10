import React from 'react';
import { SkillType } from '../../types';
import { SKILL_DATA } from '../../features/wrestler/logic/skills';

interface SkillBadgeProps {
    skill: SkillType;
}

type BadgeColors = {
    'Body': string;
    'Technique': string;
    'Mind': string;
};

import { useTranslation } from 'react-i18next';

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill }) => {
    const { i18n, t } = useTranslation();
    const def = SKILL_DATA[skill];

    if (!def) return <span className="text-xs text-gray-500">{skill}</span>;

    const colorClasses: BadgeColors = {
        'Body': 'bg-red-100 text-red-800 border-red-200',
        'Technique': 'bg-amber-100 text-amber-800 border-amber-200',
        'Mind': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };

    const lang = i18n.language === 'en' ? 'en' : 'ja';
    const name = t(`skills.${skill}.name`);
    const desc = t(`skills.${skill}.desc`);
    const triggerRate = def.triggerRate !== undefined ? Math.round(def.triggerRate * 100) : null;

    return (
        <span
            className={`rounded-sm text-xs font-bold px-2 py-0.5 border cursor-help whitespace-nowrap ${colorClasses[def.category]}`}
            title={`${desc}${triggerRate ? ` (${lang === 'en' ? 'Trigger' : '発動率'}: ${triggerRate}%)` : ''}`}
        >
            {name}
        </span>
    );
};
