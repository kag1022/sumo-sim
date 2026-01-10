import { Candidate } from '../../../types';
import { useGame } from '../../../context/GameContext';
import { useGameLoop } from '../../../hooks/useGameLoop';
import ManagementModal from '../../heya/components/ManagementModal';
import { HistoryModal } from '../../banzuke/components/HistoryModal';
import BashoResultModal from '../../banzuke/components/BashoResultModal';
import YushoModal from '../../banzuke/components/YushoModal';
import { DanpatsuModal } from '../../wrestler/components/DanpatsuModal';
import { HelpModal } from '../../../components/HelpModal';
import { RetirementConsultationModal } from '../../../components/RetirementConsultationModal';
import { EventModal } from '../../events/components/EventModal';
import ScoutPanel from '../../wrestler/components/ScoutPanel';
import { MAX_PLAYERS_PER_HEYA } from '../../../utils/constants';
import { EncyclopediaModal } from '../../collection/components/EncyclopediaModal';
import { HeyaListModal } from '../../heya/components/HeyaListModal';

interface GameModalsProps {
    showManagement: boolean;
    showHistory: boolean;
    showScout: boolean;
    showEncyclopedia: boolean;
    showHeyaList: boolean;
    showHelp: boolean;
    onCloseManagement: () => void;
    onCloseHistory: () => void;
    onCloseScout: () => void;
    onCloseEncyclopedia: () => void;
    onCloseHeyaList: () => void;
    onCloseHelp: () => void;
    onRecruit: (candidate: Candidate, customName?: string) => void;
}

/**
 * ゲーム内の全モーダルを管理するコンポーネント
 * App.tsx から抽出し、モーダル表示ロジックを集約
 */
export const GameModals = ({
    showManagement,
    showHistory,
    showScout,
    showEncyclopedia,
    showHeyaList,
    showHelp,
    onCloseManagement,
    onCloseHistory,
    onCloseScout,
    onCloseEncyclopedia,
    onCloseHeyaList,
    onCloseHelp,
    onRecruit,
}: GameModalsProps) => {
    const {
        funds,
        setFunds,
        wrestlers,
        heyas,
        setHeyas,
        bashoFinished,
        lastMonthBalance,
        yushoWinners,
        setYushoWinners,
        okamiLevel,
        yushoHistory,
        retiringQueue,
        consultingWrestlerId,
    } = useGame();

    const {
        closeBashoModal,
        candidates,
        inspectCandidate,
        completeRetirement,
        upgradeOkami,
        handleRetirementConsultation,
    } = useGameLoop();

    const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');

    return (
        <>
            {/* Management Modal */}
            {showManagement && (
                <ManagementModal
                    okamiLevel={okamiLevel}
                    funds={funds}
                    lastMonthBalance={lastMonthBalance}
                    currentHeyaLevel={heyas.find(h => h.id === 'player_heya')?.facilityLevel || 1}
                    onUpgradeOkami={() => {
                        upgradeOkami();
                    }}
                    onUpgradeFacility={(level, cost, mod) => {
                        if (funds < cost) {
                            alert("資金が不足しています");
                            return;
                        }
                        setFunds(prev => prev - cost);
                        setHeyas(prev => prev.map(h =>
                            h.id === 'player_heya'
                                ? { ...h, facilityLevel: level, strengthMod: mod }
                                : h
                        ));
                    }}
                    onClose={onCloseManagement}
                />
            )}

            {/* History Modal */}
            {showHistory && (
                <HistoryModal
                    history={yushoHistory}
                    onClose={onCloseHistory}
                />
            )}

            {/* Basho Result Modal */}
            {bashoFinished && (
                <BashoResultModal
                    wrestlers={wrestlers}
                    onClose={closeBashoModal}
                />
            )}

            {/* Yusho Modal */}
            {yushoWinners && bashoFinished === false && (
                <YushoModal
                    winners={yushoWinners}
                    onClose={() => setYushoWinners(null)}
                />
            )}

            {/* Retirement Ceremony Overlay */}
            {retiringQueue.length > 0 && (
                <DanpatsuModal
                    wrestler={retiringQueue[0]}
                    onSnip={() => {
                        if (retiringQueue.length > 0) {
                            completeRetirement(retiringQueue[0].id);
                        }
                    }}
                />
            )}

            {/* Help Modal */}
            {showHelp && <HelpModal onClose={onCloseHelp} />}

            {/* Retirement Consultation Modal */}
            {consultingWrestlerId && (() => {
                const consultingWrestler = wrestlers.find(w => w.id === consultingWrestlerId);
                return consultingWrestler ? (
                    <RetirementConsultationModal
                        wrestler={consultingWrestler}
                        onAccept={() => handleRetirementConsultation(consultingWrestlerId, 'accept')}
                        onPersuade={() => handleRetirementConsultation(consultingWrestlerId, 'persuade')}
                    />
                ) : null;
            })()}

            {/* Event Modal */}
            <EventModal />

            {/* Scout Panel */}
            {showScout && (
                <ScoutPanel
                    candidates={candidates}
                    funds={funds}
                    currentCount={playerWrestlers.length}
                    limit={MAX_PLAYERS_PER_HEYA}
                    onRecruit={onRecruit}
                    onInspect={inspectCandidate}
                    onClose={onCloseScout}
                />
            )}

            {/* Encyclopedia Modal */}
            {showEncyclopedia && <EncyclopediaModal onClose={onCloseEncyclopedia} />}

            {/* Heya List Modal */}
            <HeyaListModal isOpen={showHeyaList} onClose={onCloseHeyaList} />
        </>
    );
};

export default GameModals;
