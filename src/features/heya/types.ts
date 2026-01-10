/**
 * 部屋・経営関連の型定義
 */

/** 相撲部屋 */
export type HeyaSpecialty = 'Power' | 'Tech' | 'Stamina' | 'Balanced';

/** 相撲部屋 */
export interface Heya {
    id: string;
    name: string;
    nameEn: string;
    shikonaPrefix: string;
    shikonaPrefixReading: string; // Reading for Romanization (e.g., 'Asa')
    strengthMod: number; // 0.8 to 1.2
    facilityLevel: number; // 1-5
    wrestlerCount: number;
    // Extended Data
    oyakataName: string;       // 親方名 (例: 元横綱・仮想の年寄名跡)
    location: string;          // 所在地 (例: 東京都墨田区)
    foundedYear: number;       // 創設年 (例: 1950)
    specialty: HeyaSpecialty;  // 育成方針 (所属力士のステータス傾向に影響)
}
