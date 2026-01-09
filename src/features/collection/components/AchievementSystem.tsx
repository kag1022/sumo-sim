import React, { useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { KIMARITE_DATA } from '../../match/data/kimariteData';

/**
 * 実績解除監視システム
 * GameContext内のカウントを監視し、条件を満たした実績を解除・ログ出力する
 * UIを持たない論理コンポーネント
 */
export const AchievementSystem: React.FC = () => {
    const {
        kimariteCounts,
        unlockedAchievements,
        setUnlockedAchievements,
        addLog
    } = useGame();

    // Strict Mode対策: このマウント内で処理済み、または現在処理中のIDを追跡
    // State更新が反映されるまでの間の重複実行を防ぐ
    const processingRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // すでに解除済みの実績を除外
        // processingRefも含めてチェックすることで、連打やStrictModeによる重複を防ぐ
        const lockedAchievements = ACHIEVEMENTS.filter(a =>
            !unlockedAchievements.includes(a.id) && !processingRef.current.has(a.id)
        );

        const newlyUnlocked: string[] = [];

        lockedAchievements.forEach(achievement => {
            if (achievement.condition(kimariteCounts, KIMARITE_DATA)) {
                newlyUnlocked.push(achievement.id);
                processingRef.current.add(achievement.id);
            }
        });

        if (newlyUnlocked.length > 0) {
            setUnlockedAchievements(prev => {
                // State update callback内で再確認 (念のため)
                const next = new Set(prev);
                const actualNew: string[] = [];

                newlyUnlocked.forEach(id => {
                    if (!next.has(id)) {
                        next.add(id);
                        actualNew.push(id);
                    }
                });

                return Array.from(next);
            });

            // 通知 (実際に新規解除されたものだけログ出力)
            // Note: setUnlockedAchievementsのcallback外でログを出すため、
            // ここでは newlyUnlocked をそのまま信じるが、processingRefでガードされているため安全
            newlyUnlocked.forEach(id => {
                const a = ACHIEVEMENTS.find(ach => ach.id === id);
                if (a) {
                    addLog({
                        key: 'log.achievement.unlock',
                        params: { id: a.id },
                        message: `Achievement Unlocked: ${a.id}`,
                        type: 'info'
                    });
                }
            });
        }
    }, [kimariteCounts, unlockedAchievements, setUnlockedAchievements, addLog]);

    return null;
};
