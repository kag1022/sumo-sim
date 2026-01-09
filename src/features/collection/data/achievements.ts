
import { KimariteDef } from '../../match/data/kimariteData';

/**
 * 実績定義
 */
export interface Achievement {
    id: string;
    condition: (counts: Record<string, number>, kimariteData: readonly KimariteDef[]) => boolean;
    isSecret?: boolean; // 解除されるまで詳細を隠すか
}

/**
 * 実績リスト
 */
export const ACHIEVEMENTS: Achievement[] = [
    // ==========================================
    // 初歩的な実績
    // ==========================================
    {
        id: 'first_win',
        condition: (counts) => Object.values(counts).some(c => c > 0)
    },
    {
        id: 'collector_beginner',
        condition: (counts) => Object.keys(counts).length >= 10
    },
    {
        id: 'collector_master',
        condition: (counts) => Object.keys(counts).length >= 30,
        isSecret: true
    },

    // ==========================================
    // スタイル別マスター
    // ==========================================
    {
        id: 'push_master',
        condition: (counts, kimariteData) => {
            const pushIds = kimariteData.filter(k => k.type === 'Push').map(k => k.id);
            const total = pushIds.reduce((sum, id) => sum + (counts[id] || 0), 0);
            return total >= 100;
        }
    },
    {
        id: 'grapple_master',
        condition: (counts, kimariteData) => {
            const ids = kimariteData.filter(k => k.type === 'Grapple').map(k => k.id);
            const total = ids.reduce((sum, id) => sum + (counts[id] || 0), 0);
            return total >= 100;
        }
    },
    {
        id: 'throw_master',
        condition: (counts, kimariteData) => {
            const ids = kimariteData.filter(k => k.type === 'Throw').map(k => k.id);
            const total = ids.reduce((sum, id) => sum + (counts[id] || 0), 0);
            return total >= 50;
        }
    },
    {
        id: 'tech_master',
        condition: (counts, kimariteData) => {
            const ids = kimariteData.filter(k => k.type === 'Tech').map(k => k.id);
            const total = ids.reduce((sum, id) => sum + (counts[id] || 0), 0);
            return total >= 50;
        }
    },

    // ==========================================
    // レア技・特殊条件
    // ==========================================
    {
        id: 'special_move',
        condition: (counts, kimariteData) => {
            const ids = kimariteData.filter(k => k.type === 'Special').map(k => k.id);
            const total = ids.reduce((sum, id) => sum + (counts[id] || 0), 0);
            return total >= 1;
        }
    },
    {
        id: 'legendary_witness',
        condition: (counts, kimariteData) => {
            const ids = kimariteData.filter(k => k.rarity === 'Legendary').map(k => k.id);
            const total = ids.reduce((sum, id) => sum + (counts[id] || 0), 0);
            return total >= 1;
        },
        isSecret: true
    },
    {
        id: 'reverse_king',
        condition: (counts) => (counts['utchari'] || 0) > 0 || (counts['izori'] || 0) > 0,
        isSecret: true
    },
    {
        id: 'kimarite_complete',
        condition: (counts, kimariteData) => {
            // 定義されている全決まり手のカウントが1以上
            return kimariteData.every(k => (counts[k.id] || 0) > 0);
        },
        isSecret: true
    }
];
