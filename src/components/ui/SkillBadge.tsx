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

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill }) => {
    const def = SKILL_DATA[skill];

    if (!def) return <span className="text-xs text-gray-500">{skill}</span>;

    const colorClasses: BadgeColors = {
        'Body': 'bg-red-100 text-red-800 border-red-200',
        'Technique': 'bg-amber-100 text-amber-800 border-amber-200',
        'Mind': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };

    return (
        <span
            className={`rounded-sm text-xs font-bold px-2 py-0.5 border cursor-help ${colorClasses[def.category]}`}
            title={`${def.description} (発動率: ${Math.round(def.triggerRate * 100)}%)`}
        >
            {def.name}
        </span>
    );
};
