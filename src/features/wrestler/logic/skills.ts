import { SkillType } from '../../../types';

export const MAX_SKILLS = 3;

export type SkillCategory = 'Body' | 'Technique' | 'Mind';

export interface SkillDef {
    id: SkillType;
    name: string;
    description: string;
    category: SkillCategory;
    triggerRate: number; // 発動確率 (0.0 - 1.0)
}

export const SKILL_DATA: Record<SkillType, SkillDef> = {
    'IronHead': {
        id: 'IronHead',
        name: '鉄の額',
        description: '立ち合いの衝撃に強くなる',
        category: 'Body',
        triggerRate: 1.0
    },
    'GiantKiller': {
        id: 'GiantKiller',
        name: '巨漢殺し',
        description: '自分より重い相手に強くなる',
        category: 'Technique',
        triggerRate: 1.0
    },
    'EscapeArtist': {
        id: 'EscapeArtist',
        name: 'うっちゃり',
        description: '土俵際で逆転しやすくなる',
        category: 'Mind',
        triggerRate: 0.3
    },
    'StaminaGod': {
        id: 'StaminaGod',
        name: '無尽蔵',
        description: '長期戦になってもバテない',
        category: 'Body',
        triggerRate: 1.0
    },
    'Bulldozer': {
        id: 'Bulldozer',
        name: '重戦車',
        description: '「体」属性の押しが強くなる',
        category: 'Body',
        triggerRate: 1.0
    },
    'Lightning': {
        id: 'Lightning',
        name: '電光石火',
        description: '「技」属性の速攻が決まる',
        category: 'Technique',
        triggerRate: 0.5
    },
    'Intimidation': {
        id: 'Intimidation',
        name: '横綱相撲',
        description: '格下の相手を萎縮させる',
        category: 'Mind',
        triggerRate: 1.0
    },
};

export const SKILL_INFO = SKILL_DATA;
export const ALL_SKILLS = Object.keys(SKILL_DATA) as SkillType[];
