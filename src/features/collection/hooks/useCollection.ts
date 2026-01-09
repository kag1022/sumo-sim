
import { useCallback } from 'react';
import { useGame } from '../../../context/GameContext';
import { findKimariteById } from '../../match/data/kimariteData';

/**
 * コレクション（決まり手図鑑・実績）操作用フック
 */
export const useCollection = () => {
    const {
        kimariteCounts,
        setKimariteCounts,
        unlockedAchievements
    } = useGame();

    /**
     * 決まり手を記録する
     * @param id 決まり手ID
     */
    const recordKimarite = useCallback((id: string) => {
        // IDで検索
        const def = findKimariteById(id);
        if (!def) return; // 定義にないものは無視

        // カウント更新
        setKimariteCounts(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));
    }, [setKimariteCounts]);

    // 実績解除ロジックは <AchievementSystem /> に移動しました
    // useCollection は純粋なデータ操作/参照フックとして機能します

    return {
        recordKimarite,
        kimariteCounts,
        unlockedAchievements
    };
};
