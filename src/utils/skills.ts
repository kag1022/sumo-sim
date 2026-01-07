import { SkillType } from '../types';

/** スキルの名前と効果説明 */
export const SKILL_INFO: Record<SkillType, { name: string; description: string }> = {
    IronHead: { name: '鉄の額', description: '常に戦闘力+5%' },
    GiantKiller: { name: '巨漢殺し', description: '相手が20kg以上重い場合、戦闘力+15%' },
    EscapeArtist: { name: '逃げ足', description: '心属性判定時、ボーナス+20%' },
    StaminaGod: { name: '無尽蔵', description: '長期戦で有利（将来実装）' },
    Bulldozer: { name: '重戦車', description: '体属性判定時、ボーナス+10%' },
};

/** 全スキルタイプのリスト */
export const ALL_SKILLS: SkillType[] = ['IronHead', 'GiantKiller', 'EscapeArtist', 'StaminaGod', 'Bulldozer'];

/** 最大習得可能スキル数 */
export const MAX_SKILLS = 3;

/** 特訓時のスキル習得確率 (15%) */
export const SKILL_LEARN_CHANCE = 0.15;
