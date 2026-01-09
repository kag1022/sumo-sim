/**
 * 部屋・経営関連の型定義
 */

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
}
