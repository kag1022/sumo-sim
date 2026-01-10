import { useGame } from '../../../context/GameContext';
import { useCollection } from '../../collection/hooks/useCollection';
import { TrainingType, Matchup, SaveData } from '../../../types';
import { generateDailyMatches } from '../../match/logic/matchmaker/DailyScheduler';
import { generateCandidates } from '../../wrestler/logic/scouting';
import { MAX_TP, TP_RECOVER_WEEKLY } from '../../../utils/constants';
import { checkForWeeklyEvent } from '../../events/logic/eventEngine';
import { saveGame } from '../../../utils/storage';
import { formatHybridDate } from '../../../utils/time';

// Services
import { processDailyMatches } from '../../match/services/matchService';
import { processBanzukeUpdate } from '../../banzuke/services/banzukeService';
import { processMonthlyResources } from '../../heya/services/resourceService';

/**
 * 時間進行とフェーズ管理を担当するフック
 * 日付進行、場所/育成フェーズ切り替え、場所終了処理を管理
 */
export const useGameTime = () => {
    const {
        currentDate,
        funds,
        wrestlers,
        retiredWrestlers,
        heyas,
        gamePhase,
        gameMode,
        setFunds,
        setWrestlers,
        advanceDate,
        addLog,
        setGamePhase,
        setBashoFinished,
        setYushoWinners,
        setLastMonthBalance,
        okamiLevel,
        reputation,
        logs,
        setReputation,
        todaysMatchups,
        setTodaysMatchups,
        trainingPoints,
        setTrainingPoints,
        bashoFinished,
        lastMonthBalance,
        isInitialized,
        oyakataName,
        yushoHistory,
        setYushoHistory,
        setRetiringQueue,
        usedNames,
        matchesProcessed,
        setMatchesProcessed,
        autoRecruitAllowed,
        setActiveEvent,
        setCandidates,
        kimariteCounts,
        unlockedAchievements,
    } = useGame();

    const { recordKimarite } = useCollection();

    /**
     * 時間を進める（育成期間は週単位、本場所は日単位）
     * @param trainingType 育成方針タイプ
     */
    const advanceTime = (trainingType: TrainingType) => {
        let daysToAdvance = 0;
        let nextWrestlersState = [...wrestlers];

        // Check next state
        if (gamePhase === 'training') {
            // --- TRAINING MODE (Weekly) ---
            daysToAdvance = 7;

            setCandidates(generateCandidates(3, reputation));

            const targetDate = new Date(currentDate);
            targetDate.setDate(targetDate.getDate() + 7);

            let collisionDay = -1;

            if ((currentDate.getMonth() + 1) % 2 !== 0 && currentDate.getDate() < 10) {
                if (targetDate.getDate() >= 10) {
                    collisionDay = 10;
                }
            }

            // Training & Passive Growth Logic
            let updatedWrestlers = [...wrestlers];

            if (collisionDay !== -1) {
                daysToAdvance = collisionDay - currentDate.getDate();
                setGamePhase('tournament');
                addLog({
                    key: 'log.tourney.start',
                    message: "本場所（初日）が始まります！",
                    type: 'info'
                }, 'info');

                // Reset specific basho stats before tournament starts
                updatedWrestlers = updatedWrestlers.map(w => ({
                    ...w,
                    currentBashoStats: { wins: 0, losses: 0, matchHistory: [], boutDays: [] }
                }));
                nextWrestlersState = updatedWrestlers;

                // Create Day 1 Schedule
                const day1Matches = generateDailyMatches(updatedWrestlers, 1);

                const matchups: Matchup[] = day1Matches.map(m => ({
                    east: m.east,
                    west: m.west,
                    division: m.division,
                    winnerId: null
                }));

                setTodaysMatchups(matchups);
                setMatchesProcessed(false);
                addLog({
                    key: 'log.tourney.day1_schedule',
                    message: "初日の取組が発表されました。",
                    type: 'info'
                }, 'info');
            }

            if (daysToAdvance > 0) {
                // TP Recovery (Weekly)
                setTrainingPoints(prev => Math.min(prev + TP_RECOVER_WEEKLY, MAX_TP));

                // Create Heya Strength Map for performance
                const heyaStrengthMap = new Map<string, number>();
                heyas.forEach(h => heyaStrengthMap.set(h.id, h.strengthMod));

                const updateStat = (current: number, gain: number, potential: number) => {
                    const potentialFactor = Math.max(0, (potential - current) / potential);
                    return Math.min(potential, current + (gain * potentialFactor));
                };

                const applyDecay = (val: number) => {
                    return val > 80 ? val - (0.05 * daysToAdvance) : val;
                };

                updatedWrestlers = wrestlers.map(w => {
                    if (w.injuryStatus === 'injured') return w;

                    let newStats = { ...w.stats };
                    let stressGain = 0;

                    // 1. Decay
                    newStats.body = applyDecay(newStats.body);
                    newStats.technique = applyDecay(newStats.technique);
                    newStats.mind = applyDecay(newStats.mind);

                    // 2. Training Effect (Active)
                    const isPlayerHeya = w.heyaId === 'player_heya';

                    if (isPlayerHeya) {
                        const trainingMod = 1.0;
                        switch (trainingType) {
                            case 'shiko':
                                newStats.body = updateStat(newStats.body, 0.5 * trainingMod, w.potential);
                                stressGain = 15;
                                break;
                            case 'teppo':
                                newStats.technique = updateStat(newStats.technique, 0.5 * trainingMod, w.potential);
                                stressGain = 15;
                                break;
                            case 'moushi_ai':
                                newStats.mind = updateStat(newStats.mind, 0.5 * trainingMod, w.potential);
                                newStats.body = updateStat(newStats.body, 0.2 * trainingMod, w.potential);
                                newStats.technique = updateStat(newStats.technique, 0.2 * trainingMod, w.potential);
                                stressGain = 25;
                                break;
                            case 'rest':
                                w.stress = Math.max(0, (w.stress || 0) - 20);
                                return w;
                        }
                    } else {
                        // CPU Passive Growth
                        const heyaStr = heyaStrengthMap.get(w.heyaId) || 1.0;
                        newStats.body = updateStat(newStats.body, 0.1 * heyaStr, w.potential);
                        newStats.technique = updateStat(newStats.technique, 0.1 * heyaStr, w.potential);
                    }

                    return { ...w, stats: newStats, stress: Math.min(100, (w.stress || 0) + stressGain) };
                });

                // 3. Okami Relief
                const okamiRelief = [0, 2, 4, 6, 8, 10][okamiLevel] || 0;
                const totalRelief = okamiRelief * daysToAdvance;

                updatedWrestlers = updatedWrestlers.map(w => ({
                    ...w,
                    stress: Math.max(0, w.stress - totalRelief)
                }));

                if (collisionDay === -1) {
                    nextWrestlersState = updatedWrestlers;
                }

                setWrestlers(nextWrestlersState);
                triggerAutoSave({ wrestlers: nextWrestlersState, heyas, funds, reputation, okamiLevel });
            }
        } else {
            // --- TOURNAMENT MODE (Day by Day) ---
            if (matchesProcessed) return;

            daysToAdvance = 1;

            // USE SERVICE: Process Daily Matches
            const result = processDailyMatches(
                wrestlers,
                todaysMatchups,
                currentDate,
                okamiLevel
            );

            // Update State with result
            setTodaysMatchups(result.updatedMatchups);
            setWrestlers(result.updatedWrestlers);
            nextWrestlersState = result.updatedWrestlers;

            if (result.fundsChange !== 0) {
                setFunds(prev => prev + result.fundsChange);
            }
            if (result.reputationChange !== 0) {
                setReputation(Math.max(0, Math.min(100, reputation + result.reputationChange)));
            }
            if (result.tpChange !== 0) {
                setTrainingPoints(prev => Math.min(prev + result.tpChange, MAX_TP));
            }

            result.logs.forEach(l => addLog(l, 'info'));

            setMatchesProcessed(true);

            // Record Kimarite & Achievements (Player Heya Only)
            result.updatedMatchups.forEach(match => {
                if (match.winnerId && match.kimarite) {
                    const winner = match.winnerId === match.east.id ? match.east : match.west;
                    if (winner.heyaId === 'player_heya') {
                        recordKimarite(match.kimarite);
                    }
                }
            });
        }

        setWrestlers(nextWrestlersState);

        // NEW EVENT SYSTEM (Weekly Only)
        if (gamePhase === 'training') {
            const newEvent = checkForWeeklyEvent(funds, reputation, currentDate, wrestlers, okamiLevel);
            if (newEvent) {
                setActiveEvent(newEvent);
            }
        }

        // Advance Date
        if (daysToAdvance > 0) {
            advanceDate(daysToAdvance);

            if (gamePhase === 'tournament') {
                if (currentDate.getDate() >= 24) { // Senshuraku
                    handleBashoEnd(nextWrestlersState);
                } else {
                    // Next day pairings
                    const nextDate = new Date(currentDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    const nextDay = nextDate.getDate() - 9;

                    const nextMatches = generateDailyMatches(nextWrestlersState, nextDay);
                    const nextMatchups: Matchup[] = nextMatches.map(m => ({
                        east: m.east,
                        west: m.west,
                        division: m.division,
                        winnerId: null
                    }));
                    setTodaysMatchups(nextMatchups);
                    setMatchesProcessed(false);
                    addLog({
                        key: 'log.tourney.next_day_schedule',
                        params: { day: nextDay },
                        message: `${nextDay}日目の取組が発表されました。`,
                        type: 'info'
                    }, 'info');
                }
            }
        }
    };

    /**
     * 場所終了処理を行う
     * @param finalWrestlers 場所終了時点の力士リスト
     */
    const handleBashoEnd = (finalWrestlers: import('../../../types').Wrestler[]) => {
        setBashoFinished(true);
        setGamePhase('training');

        const banzukeDateId = formatHybridDate(currentDate, 'tournament');

        // USE SERVICE: Banzuke Update
        const banzukeResult = processBanzukeUpdate(finalWrestlers, heyas, currentDate, banzukeDateId);

        // Apply Updates
        setYushoWinners(banzukeResult.yushoWinners);
        setYushoHistory(prev => [...prev, ...banzukeResult.yushoHistoryEntry]);

        if (banzukeResult.fundsChange !== 0) {
            setFunds(prev => prev + banzukeResult.fundsChange);
        }

        banzukeResult.logs.forEach(l => addLog(l, 'info'));

        setRetiringQueue(prev => [...prev, ...banzukeResult.retiringQueue]);

        // Apply wrestler updates (Banzuke + Retirement Status)
        let currentWrestlers = banzukeResult.updatedWrestlers;

        // USE SERVICE: Resources (Recruiting, Monthly Balance)
        const resourceResult = processMonthlyResources(
            currentWrestlers,
            heyas,
            okamiLevel,
            reputation,
            autoRecruitAllowed
        );

        setLastMonthBalance(resourceResult.fundsChange);
        setFunds(prev => prev + resourceResult.fundsChange);
        resourceResult.logs.forEach(l => addLog(l, 'info'));

        // Final wrestler update
        setWrestlers(resourceResult.updatedWrestlers);

        addLog({
            key: 'log.tourney.basho_end',
            params: { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 },
            message: `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月場所終了。`,
            type: 'info'
        }, 'info');
    };

    /**
     * 場所結果モーダルを閉じる
     */
    const closeBashoModal = () => {
        setBashoFinished(false);
    };

    /**
     * オートセーブをトリガーする
     * @param currentState 現在のゲーム状態
     */
    const triggerAutoSave = (currentState: any) => {
        const data: SaveData = {
            version: 2,
            timestamp: Date.now(),
            gameState: {
                currentDate: currentDate.toISOString(),
                funds: currentState.funds,
                reputation: currentState.reputation,
                okamiLevel: currentState.okamiLevel,
                gamePhase,
                gameMode,
                bashoFinished,
                lastMonthBalance,
                isInitialized,
                oyakataName,
                trainingPoints,
                matchesProcessed,
                todaysMatchups,
                autoRecruitAllowed,
                kimariteCounts,
                unlockedAchievements
            },
            wrestlers: currentState.wrestlers,
            retiredWrestlers,
            heyas,
            yushoHistory,
            logs,
            usedNames
        };
        saveGame(data);
    };

    /**
     * 優勝履歴を記録する（互換性のため維持）
     */
    const recordYushoHistory = () => {
        return [];
    };

    return {
        advanceTime,
        closeBashoModal,
        triggerAutoSave,
        recordYushoHistory,
    };
};
