import { useGame } from '../../../context/GameContext';
import { getOkamiUpgradeCost } from '../logic/okami';

/**
 * 部屋の経営・成長に関するフック
 * 女将さんレベルアップ、スカウト調査費用支払いを管理
 */
export const useHeyaManagement = () => {
    const {
        funds,
        setFunds,
        okamiLevel,
        setOkamiLevel,
        addLog,
    } = useGame();

    /**
     * 女将さんのレベルをアップグレードする
     * 資金を消費してレベルを1上げる
     */
    const upgradeOkami = () => {
        const cost = getOkamiUpgradeCost(okamiLevel);
        if (cost === null || okamiLevel >= 5) return;
        if (funds < cost) return;

        setFunds(prev => prev - cost);
        setOkamiLevel(okamiLevel + 1);
        addLog({
            key: 'log.action.okami_upgrade',
            params: { level: okamiLevel + 1 },
            message: `女将さんのレベルが ${okamiLevel + 1} に上がりました！`,
            type: 'info'
        }, 'info');
    };

    /**
     * スカウト候補の調査費用を支払う
     * @param cost 調査費用
     */
    const inspectCandidate = (cost: number) => {
        if (funds >= cost) {
            setFunds(prev => prev - cost);
        } else {
            addLog({
                key: 'log.error.insufficient_funds',
                message: "資金が足りません！",
                type: 'error'
            }, 'error');
        }
    };

    return {
        upgradeOkami,
        inspectCandidate,
    };
};
