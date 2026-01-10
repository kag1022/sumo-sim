export type SkillTier = 'S' | 'A' | 'B' | 'C';
export type SkillEffectType = 'Passive' | 'Trigger' | 'Condition';

/**
 * 秘技スキルの定義
 */
export interface SkillDef {
    id: string; // SkillType string literal will be derived from keys
    tier: SkillTier;
    effectType: SkillEffectType;
    triggerRate?: number; // 0.0 - 1.0 (Optional, defaults to 1.0 for passives)
}

/**
 * スキルレジストリ
 */
export const SKILL_REGISTRY = {
    // --- Tier S (Legendary) ---
    'YokozunaSumo': {
        id: 'YokozunaSumo',
        tier: 'S',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'DemonFace': {
        id: 'DemonFace',
        tier: 'S',
        effectType: 'Condition', // Trigger logic
        triggerRate: 0.8
    },
    'Unstoppable': {
        id: 'Unstoppable',
        tier: 'S',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'Godspeed': {
        id: 'Godspeed',
        tier: 'S',
        effectType: 'Trigger',
        triggerRate: 0.4
    },
    'IronWall': {
        id: 'IronWall',
        tier: 'S',
        effectType: 'Passive',
        triggerRate: 1.0
    },

    // --- Tier A (Rare) ---
    'Herculean': {
        id: 'Herculean',
        tier: 'A',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'Technician': {
        id: 'Technician',
        tier: 'A',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'LightningFlash': {
        id: 'LightningFlash',
        tier: 'A',
        effectType: 'Trigger',
        triggerRate: 0.6
    },
    'GiantKiller': {
        id: 'GiantKiller',
        tier: 'A',
        effectType: 'Condition',
        triggerRate: 1.0
    },
    'LionHeart': {
        id: 'LionHeart',
        tier: 'A',
        effectType: 'Condition',
        triggerRate: 1.0
    },
    'Steamroller': {
        id: 'Steamroller',
        tier: 'A',
        effectType: 'Trigger',
        triggerRate: 0.5
    },

    // --- Tier B (Uncommon) ---
    'Resilience': {
        id: 'Resilience',
        tier: 'B',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'ThrustMaster': {
        id: 'ThrustMaster',
        tier: 'B',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'IronHead': { // Existing
        id: 'IronHead',
        tier: 'B',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'Bulldozer': { // Existing
        id: 'Bulldozer',
        tier: 'B',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'EscapeArtist': { // Existing
        id: 'EscapeArtist',
        tier: 'B',
        effectType: 'Trigger',
        triggerRate: 0.3
    },
    'Agility': {
        id: 'Agility',
        tier: 'B',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'GrupFighter': {
        id: 'GrupFighter',
        tier: 'B',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'StaminaGod': { // Existing
        id: 'StaminaGod',
        tier: 'B',
        effectType: 'Passive',
        triggerRate: 1.0
    },

    // --- Tier C (Common) ---
    'BasicTraining': {
        id: 'BasicTraining',
        tier: 'C',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'Cautious': {
        id: 'Cautious',
        tier: 'C',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'Daring': {
        id: 'Daring',
        tier: 'C',
        effectType: 'Condition',
        triggerRate: 1.0
    },
    'HardWorker': {
        id: 'HardWorker',
        tier: 'C',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'BigEater': {
        id: 'BigEater',
        tier: 'C',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'LuckyBoy': {
        id: 'LuckyBoy',
        tier: 'C',
        effectType: 'Trigger',
        triggerRate: 0.1
    },
    'CrowdPleaser': {
        id: 'CrowdPleaser',
        tier: 'C',
        effectType: 'Passive',
        triggerRate: 1.0
    },

    // --- Negative Skills (Tier C/N) ---
    'GlassKnees': {
        id: 'GlassKnees',
        tier: 'C',
        effectType: 'Passive',
        triggerRate: 0.1
    },
    'MoodSwinger': {
        id: 'MoodSwinger',
        tier: 'C',
        effectType: 'Passive',
        triggerRate: 1.0
    },
    'SlowStarter': {
        id: 'SlowStarter',
        tier: 'C',
        effectType: 'Condition',
        triggerRate: 1.0
    },
    'StageFright': {
        id: 'StageFright',
        tier: 'C',
        effectType: 'Condition',
        triggerRate: 1.0
    }
} as const;

export type SkillRegistryType = typeof SKILL_REGISTRY;
export type SkillKey = keyof SkillRegistryType;

// Helper to get list
export const ALL_SKILL_KEYS = Object.keys(SKILL_REGISTRY) as SkillKey[];
