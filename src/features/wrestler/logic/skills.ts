import { SkillType } from '../../../types';
import { SKILL_REGISTRY, SkillDef as RegistrySkillDef } from '../data/skillRegistry';

export const MAX_SKILLS = 3;

export type SkillCategory = 'Body' | 'Technique' | 'Mind';

export interface SkillDef extends RegistrySkillDef {
    category: SkillCategory;
}

const mapCategory = (skill: RegistrySkillDef): SkillCategory => {
    // Simple heuristic mapping based on existing skills and intuition
    if (['YokozunaSumo', 'DemonFace', 'EscapeArtist', 'LionHeart', 'Cautious', 'Daring', 'MoodSwinger', 'StageFright', 'Intimidation'].includes(skill.id)) return 'Mind';
    if (['Godspeed', 'Technician', 'LightningFlash', 'Agility', 'LuckyBoy', 'Lightning', 'GiantKiller'].includes(skill.id)) return 'Technique';
    return 'Body'; // Default to Body
};

export const SKILL_DATA: Record<SkillType, SkillDef> = Object.values(SKILL_REGISTRY).reduce((acc, skill) => {
    acc[skill.id as SkillType] = {
        ...skill,
        category: mapCategory(skill)
    };
    return acc;
}, {} as Record<SkillType, SkillDef>);

export const SKILL_INFO = SKILL_DATA;
export const ALL_SKILLS = Object.keys(SKILL_DATA) as SkillType[];
