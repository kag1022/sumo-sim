/**
 * ゲームループのコンポーザーフック
 * 各機能フックを統合し、既存のインターフェースを維持
 */

import { useGame } from '../context/GameContext';
import { useGameTime } from '../features/game/hooks/useGameTime';
import { useWrestlerActions } from '../features/wrestler/hooks/useWrestlerActions';
import { useHeyaManagement } from '../features/heya/hooks/useHeyaManagement';

export const useGameLoop = () => {
    // Context から candidates を取得
    const { candidates } = useGame();

    // Feature hooks を呼び出し
    const gameTime = useGameTime();
    const wrestlerActions = useWrestlerActions();
    const heyaManagement = useHeyaManagement();

    // 戻り値を統合（既存インターフェース維持）
    return {
        // From useGameTime
        advanceTime: gameTime.advanceTime,
        closeBashoModal: gameTime.closeBashoModal,
        triggerAutoSave: gameTime.triggerAutoSave,
        recordYushoHistory: gameTime.recordYushoHistory,

        // From Context (candidates is now in Context)
        candidates,

        // From useWrestlerActions
        recruitWrestler: wrestlerActions.recruitWrestler,
        retireWrestler: wrestlerActions.retireWrestler,
        completeRetirement: wrestlerActions.completeRetirement,
        doSpecialTraining: wrestlerActions.doSpecialTraining,
        giveAdvice: wrestlerActions.giveAdvice,
        handleRetirementConsultation: wrestlerActions.handleRetirementConsultation,
        checkForRetirementConsultation: wrestlerActions.checkForRetirementConsultation,
        renameWrestler: wrestlerActions.renameWrestler,

        // From useHeyaManagement
        upgradeOkami: heyaManagement.upgradeOkami,
        inspectCandidate: heyaManagement.inspectCandidate,
    };
};
