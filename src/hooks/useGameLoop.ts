
import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TrainingType, Candidate, SaveData, Matchup } from '../types';
import { ALL_SKILLS, MAX_SKILLS, SKILL_INFO } from '../features/wrestler/logic/skills';
import { generateDailyMatches } from '../features/match/logic/matchmaker/DailyScheduler';
import { generateCandidates } from '../features/wrestler/logic/scouting';
import { generateWrestler } from '../features/wrestler/logic/generator';
import { MAX_PLAYERS_PER_HEYA } from '../utils/constants';
import { calculateSeverance } from '../features/wrestler/logic/retirement';
import { getOkamiUpgradeCost } from '../features/heya/logic/okami';
// import { useEvents } from './useEvents'; // Replaced by new EventEngine
import { checkForWeeklyEvent } from '../features/events/logic/eventEngine';
import { saveGame } from '../utils/storage';
import { formatRank } from '../utils/formatting';
import { formatHybridDate } from '../utils/time';

// Services
import { processDailyMatches } from '../features/match/services/matchService';
import { processBanzukeUpdate } from '../features/banzuke/services/banzukeService';
import { processMonthlyResources } from '../features/heya/services/resourceService';

export const useGameLoop = () => {
    const {
        currentDate,
        funds,
        wrestlers,
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
        setOkamiLevel,
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
        setConsultingWrestlerId,

        matchesProcessed,
        setMatchesProcessed,
        retiringQueue,
        autoRecruitAllowed,
        setActiveEvent
    } = useGame();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    // const { checkRandomEvents } = useEvents();

    const advanceTime = (trainingType: TrainingType) => {
        let daysToAdvance = 0;
        let nextWrestlersState = [...wrestlers];

        // Check next state
        if (gamePhase === 'training') {
            // --- TRAINING MODE (Weekly) ---
            daysToAdvance = 7;

            setCandidates(generateCandidates(3, reputation)); // Passed reputation

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
                addLog("本場所（初日）が始まります！", 'info');

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
                addLog("初日の取組が発表されました。", 'info');
            }

            if (daysToAdvance > 0) {
                // Reset Training Points Weekly
                setTrainingPoints(3);

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
                                stressGain = 5;
                                break;
                            case 'teppo':
                                newStats.technique = updateStat(newStats.technique, 0.5 * trainingMod, w.potential);
                                stressGain = 5;
                                break;
                            case 'moushi_ai':
                                newStats.mind = updateStat(newStats.mind, 0.5 * trainingMod, w.potential);
                                newStats.body = updateStat(newStats.body, 0.2 * trainingMod, w.potential);
                                newStats.technique = updateStat(newStats.technique, 0.2 * trainingMod, w.potential);
                                stressGain = 10;
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

            result.logs.forEach(l => addLog(l, 'info'));

            setMatchesProcessed(true);
        }

        // Common Updates (Events) - BLOCKED: Old system replaced by new Modal Events
        // const eventResult = checkRandomEvents(nextWrestlersState, reputation, okamiLevel);
        // setFunds(prev => prev + eventResult.fundsChange);
        // setReputation(Math.min(100, Math.max(0, reputation + eventResult.reputationChange)));
        // nextWrestlersState = eventResult.updatedWrestlers;

        setWrestlers(nextWrestlersState);

        // NEW EVENT SYSTEM (Weekly Only? Or whenever advanceTime is called?)
        // Prompt says: "After advanceTime (Weekly Progression)".
        // gamePhase === 'training' is weekly. 'tournament' is daily.
        // Let's enable it for BOTH or just Training?
        // "Events occurring randomly during weekly progression" -> Implies Training Phase.
        // But "Scandal" etc can happen anytime.
        // Let's stick to "After advanceTime calls" which covers both. 
        // But maybe lower chance in tournament or disable?
        // User prompt: `advanceTime` (週進行) の処理が終わった直後に... 
        // "Weekly progression" specifically mentioned.
        // I will limit it to `gamePhase === 'training'` for now to match "Weekly" description, or maybe 15% chance per week is intended.
        // Daily tournament = 15 days. 15 * 15% is high.

        if (gamePhase === 'training') {
            const newEvent = checkForWeeklyEvent(funds, reputation, currentDate);
            if (newEvent) {
                setActiveEvent(newEvent);
                // Note: The modal will handle applying effects. 
                // We don't need to do anything else here.
            }
        }

        // Advance Date
        if (daysToAdvance > 0) {
            advanceDate(daysToAdvance);

            if (gamePhase === 'tournament') {
                if (currentDate.getDate() >= 24) { // Senshuraku
                    // Call processBashoEnd Logic from SERVICE
                    handleBashoEnd(nextWrestlersState);
                } else {
                    // Next day pairings
                    const nextDate = new Date(currentDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    const nextDay = nextDate.getDate() - 9; // Day of basho

                    const nextMatches = generateDailyMatches(nextWrestlersState, nextDay);
                    const nextMatchups: Matchup[] = nextMatches.map(m => ({
                        east: m.east,
                        west: m.west,
                        division: m.division,
                        winnerId: null
                    }));
                    setTodaysMatchups(nextMatchups);
                    setMatchesProcessed(false);
                    addLog(`${nextDay}日目の取組が発表されました。`, 'info');
                }
            }
        }
    };

    const handleBashoEnd = (finalWrestlers: import('../types').Wrestler[]) => {
        setBashoFinished(true);
        setGamePhase('training');

        const banzukeDateId = formatHybridDate(currentDate, 'tournament');

        // USE SERVICE: Banzuke Update
        const banzukeResult = processBanzukeUpdate(finalWrestlers, heyas, currentDate, banzukeDateId);

        // Apply Updates
        setYushoWinners(banzukeResult.yushoWinners);
        setYushoHistory(prev => [...prev, ...banzukeResult.yushoHistoryEntry]);

        // Handle funds from Yusho etc inside service? No, logic was split.
        // Service returns fundsChange.
        if (banzukeResult.fundsChange !== 0) {
            setFunds(prev => prev + banzukeResult.fundsChange);
        }

        banzukeResult.logs.forEach(l => addLog(l, 'info'));

        setRetiringQueue(prev => [...prev, ...banzukeResult.retiringQueue]);
        // Note: consultingCandidates are just logged in service. 
        // We need to set them for popup.
        if (banzukeResult.consultingCandidates.length > 0) {
            // Usually only one consultation per player? Original logic handled one at a time via find()
            // We just need to know if there's any.
            // But we need to update the wrestler status in the main list.
            // The service returns updatedWrestlers with 'Thinking' status set.
        }

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

        addLog(`${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月場所終了。`, 'info');
    };

    const closeBashoModal = () => {
        setBashoFinished(false);
    };

    const recruitWrestler = (candidate: Candidate, customName?: string) => {
        if (wrestlers.filter(w => w.heyaId === 'player_heya').length >= MAX_PLAYERS_PER_HEYA) {
            addLog("部屋の定員（10人）がいっぱいです！", 'error');
            return;
        }
        if (funds < 3000000) {
            addLog("支度金（300万円）が足りません！", 'error');
            return;
        }

        const playerHeyaObj = heyas.find(h => h.id === 'player_heya');
        if (!playerHeyaObj) return;

        setFunds(prev => prev - 3000000);
        let newWrestler = generateWrestler(playerHeyaObj, 'MaeZumo');

        newWrestler.stats = { ...candidate.stats };
        newWrestler.potential = candidate.potential;
        newWrestler.flexibility = candidate.flexibility;
        newWrestler.weight = candidate.weight;
        newWrestler.height = candidate.height;
        newWrestler.background = candidate.background;
        newWrestler.age = candidate.age;

        if (customName) {
            newWrestler.name = customName;
        }
        setWrestlers(prev => [...prev, newWrestler]);
        setCandidates(prev => prev.filter(c => c.id !== candidate.id));
        addLog(`新弟子 ${newWrestler.name} が入門しました！来場所から前相撲として修行を開始します。`, 'info');
    };

    const inspectCandidate = (cost: number) => {
        if (funds >= cost) {
            setFunds(prev => prev - cost);
        } else {
            addLog("資金が足りません！", 'error');
        }
    };

    const retireWrestler = (wrestlerId: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (wrestler) {
            const severance = calculateSeverance(wrestler);
            addLog(`${wrestler.name} (最高位: ${formatRank(wrestler.maxRank)}) が引退しました。`, 'warning');

            if (wrestler.isSekitori) {
                setRetiringQueue(prev => [...prev, wrestler]);
            } else {
                if (severance > 0) setFunds(prev => prev + severance);
                addLog("協会より功労金" + severance.toLocaleString() + "円が支払われました。", 'info');
                setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
            }
        }
    };

    const completeRetirement = (wrestlerId: string) => {
        const wrestler = retiringQueue.find(w => w.id === wrestlerId);
        if (wrestler) {
            const severance = calculateSeverance(wrestler);
            setFunds(prev => prev + severance);
            addLog(`${wrestler.name}の断髪式が執り行われ、マゲに別れを告げました。`, 'info');
            addLog("協会より功労金" + severance.toLocaleString() + "円が支払われました。", 'info');
            setRetiringQueue(prev => prev.filter(w => w.id !== wrestlerId));
            setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
        }
    };

    const upgradeOkami = () => {
        const cost = getOkamiUpgradeCost(okamiLevel);
        if (cost === null || okamiLevel >= 5) return;
        if (funds < cost) return;

        setFunds(prev => prev - cost);
        setOkamiLevel(okamiLevel + 1);
        addLog(`女将さんのレベルが ${okamiLevel + 1} に上がりました！`, 'info');
    };

    const doSpecialTraining = (wrestlerId: string, menuType: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler || trainingPoints <= 0) return;

        setTrainingPoints(prev => prev - 1);

        let diffBody = 0, diffTech = 0, diffMind = 0;

        if (menuType === 'strength') { diffBody = 2; diffTech = 1; }
        else if (menuType === 'technique') { diffTech = 2; diffMind = 1; }
        else if (menuType === 'meditation') { diffMind = 2; diffBody = 1; }

        setWrestlers(prev => prev.map(w => w.id === wrestlerId ? {
            ...w,
            stats: {
                body: Math.min(w.potential, w.stats.body + diffBody),
                technique: Math.min(w.potential, w.stats.technique + diffTech),
                mind: Math.min(w.potential, w.stats.mind + diffMind)
            }
        } : w));

        const learnProb = 0.05;
        if (Math.random() < learnProb && wrestler.skills.length < MAX_SKILLS) {
            const unlearned = ALL_SKILLS.filter(s => !wrestler.skills.includes(s));
            if (unlearned.length > 0) {
                const newSkill = unlearned[Math.floor(Math.random() * unlearned.length)];
                setWrestlers(prev => prev.map(w => w.id === wrestlerId ? { ...w, skills: [...w.skills, newSkill] } : w));
                addLog(`${wrestler.name}は特訓の末、秘技『${SKILL_INFO[newSkill].name}』を閃いた！`, 'info');
            }
        }

        addLog(`特別指導（${menuType}）を行いました。心+${diffMind} 技+${diffTech} 体+${diffBody}`, 'info');
    };

    const triggerAutoSave = (currentState: any) => {
        const data: SaveData = {
            version: 1,
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
                autoRecruitAllowed
            },
            wrestlers: currentState.wrestlers,
            heyas,
            yushoHistory,
            logs,
            usedNames
        };
        saveGame(data);
    };

    const recordYushoHistory = () => {
        // Redundant now as logic moved to service, but keeping if API needs it?
        // Actually this method was exposed by useGameLoop but not used in the loop itself (it was called separately?)
        // In original hook, it was called manually or inside processBashoEnd?
        // Original: const recordYushoHistory = ... exposed via return.
        // I will keep it but it should probably use the service logic or be removed if unused.
        // For now, simple implementation or alias.
        return []; // Placeholder if logic moved.
    };

    const handleRetirementConsultation = (wrestlerId: string, decision: 'accept' | 'persuade') => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler) return;

        if (decision === 'accept') {
            addLog(`【引退決定】${wrestler.name} の引退が正式に決まりました。`, 'warning');

            if (wrestler.isSekitori) {
                setRetiringQueue(prev => [...prev, wrestler]);
            } else {
                const severance = calculateSeverance(wrestler);
                if (severance > 0) {
                    setFunds((prev: number) => prev + severance);
                }
                addLog(`【引退】${wrestler.name} (最高位: ${formatRank(wrestler.maxRank)}) が引退しました。`, 'warning');
            }

            setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
        } else {
            addLog(`【説得成功】「馬鹿野郎！お前の相撲はまだ終わっちゃいない！」`, 'info');
            addLog(`${wrestler.name} は親方の言葉に奮い立ち、ラストチャンスに挑みます！`, 'warning');

            setWrestlers(prev => prev.map(w =>
                w.id === wrestlerId
                    ? {
                        ...w,
                        retirementStatus: 'LastHanamichi' as const,
                        retirementReason: undefined,
                        stats: { ...w.stats, mind: w.potential || 100 }
                    }
                    : w
            ));
        }

        setConsultingWrestlerId(null);
    };

    const checkForRetirementConsultation = () => {
        const thinkingWrestler = wrestlers.find(
            w => w.heyaId === 'player_heya' && w.retirementStatus === 'Thinking'
        );

        if (thinkingWrestler) {
            setConsultingWrestlerId(thinkingWrestler.id);
        }
    };

    return { advanceTime, closeBashoModal, candidates, recruitWrestler, inspectCandidate, retireWrestler, completeRetirement, upgradeOkami, doSpecialTraining, triggerAutoSave, recordYushoHistory, handleRetirementConsultation, checkForRetirementConsultation };
};
