import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TrainingType, Wrestler, Candidate, Heya, YushoRecord, SaveData, Division } from '../types';
import { matchMaker } from '../utils/matchmaker/MatchMaker';
import { updateBanzuke } from '../utils/banzuke';
import { generateCandidates } from '../utils/scouting';
import { generateWrestler } from '../utils/dummyGenerator';
import { MAX_PLAYERS_PER_HEYA, getRankValue } from '../utils/constants';
import { calculateIncome, calculateExpenses } from '../utils/economy';
import { calculateSeverance, shouldUpdateMaxRank } from '../utils/retirement';
import { getOkamiBudgetMultiplier, getOkamiUpgradeCost } from '../utils/okami';
import { useEvents } from './useEvents';
import { saveGame } from '../utils/storage';
import { formatRank } from '../utils/formatting';
import { formatHybridDate } from '../utils/time';

export const useGameLoop = () => {
    const {
        currentDate,
        funds,
        wrestlers,
        heyas,
        gameMode,
        setFunds,
        setWrestlers,
        advanceDate,
        addLog,
        setGameMode,
        setBashoFinished,
        setYushoWinners,
        setLastMonthBalance,
        // Phase 19
        okamiLevel,
        reputation,
        logs,
        setOkamiLevel,
        setReputation,
        setTodaysMatchups,
        trainingPoints,
        setTrainingPoints,
        // Added for Save/History
        bashoFinished,
        lastMonthBalance,
        isInitialized,
        oyakataName,
        yushoHistory,
        setYushoHistory,
        setRetiringQueue,
        usedNames
    } = useGame();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const { checkRandomEvents } = useEvents();

    const advanceTime = (trainingType: TrainingType) => {
        let daysToAdvance = 0;

        // Check next state
        if (gameMode === 'training') {
            // --- TRAINING MODE (Weekly) ---
            daysToAdvance = 7;

            setCandidates(generateCandidates(3));

            const targetDate = new Date(currentDate);
            targetDate.setDate(targetDate.getDate() + 7);

            let collisionDay = -1;

            if ((currentDate.getMonth() + 1) % 2 !== 0 && currentDate.getDate() < 10) {
                if (targetDate.getDate() >= 10) {
                    collisionDay = 10;
                }
            }

            if (collisionDay !== -1) {
                daysToAdvance = collisionDay - currentDate.getDate();
                setGameMode('tournament');
                addLog("本場所（初日）が始まります！", 'info');
            }

            // Training & Passive Growth Logic
            let updatedWrestlers = [...wrestlers];
            if (daysToAdvance > 0) {
                // Reset Training Points Weekly
                setTrainingPoints(3);

                // Create Heya Strength Map for performance
                const heyaStrengthMap = new Map<string, number>();
                heyas.forEach(h => heyaStrengthMap.set(h.id, h.strengthMod));

                const updateStat = (current: number, gain: number, potential: number) => {
                    const potentialFactor = Math.max(0, (potential - current) / potential);
                    // Passive growth is slower than active
                    return Math.min(potential, current + (gain * potentialFactor));
                };

                const applyDecay = (val: number) => {
                    // Slower decay
                    return val > 80 ? val - (0.05 * daysToAdvance) : val;
                };

                updatedWrestlers = wrestlers.map(w => {
                    // Skip injured
                    if (w.injuryStatus === 'injured') return w;

                    let newStats = { ...w.stats };
                    let stressGain = 0;

                    // 1. Decay
                    newStats.mind = applyDecay(newStats.mind);
                    newStats.technique = applyDecay(newStats.technique);
                    newStats.body = applyDecay(newStats.body);

                    // 2. Passive Growth Calculation
                    const heyaMod = heyaStrengthMap.get(w.heyaId) || 1.0;
                    const p = w.potential;

                    // Base growth per week (7 days) approx 0.5 - 1.0 adjusted by potential?
                    // User said: (Base + Random) * StrengthMod * PotentialFactor
                    // Let's define Base ~ 0.2 per day? = 1.4 per week.
                    // Random ~ 0.0 - 0.5.

                    const growthBase = (0.2 + Math.random() * 0.1) * daysToAdvance;
                    const growth = growthBase * heyaMod;

                    // Apply to all stats (General growth) or randomized focus?
                    // General growth for passive.
                    newStats.body = updateStat(newStats.body, growth, p);
                    newStats.technique = updateStat(newStats.technique, growth, p);
                    newStats.mind = updateStat(newStats.mind, growth, p);

                    // Stress from training (Passive)
                    stressGain = 0.5 * daysToAdvance;

                    // If Player's selected "Weekly Policy" (trainingType), apply EXTRA bonus to Player Wrestlers?
                    // The user instructions implies "Active Training" is the SPECIAL command.
                    // The "Weekly Policy" (shiko/teppo etc) from previous UI might still be valid for Player's wrestlers as "Focus"?
                    // Let's keep the Weekly Policy bonus for Player Heya wrestlers to maintain that feature.
                    if (w.heyaId === 'player_heya') {
                        if (trainingType === 'shiko') {
                            newStats.body = updateStat(newStats.body, 1.0 * daysToAdvance, p); // Extra focus
                            stressGain += 1 * daysToAdvance;
                        } else if (trainingType === 'teppo') {
                            newStats.technique = updateStat(newStats.technique, 1.0 * daysToAdvance, p);
                            stressGain += 1 * daysToAdvance;
                        } else if (trainingType === 'moushi_ai') {
                            newStats.body = updateStat(newStats.body, 0.5 * daysToAdvance, p);
                            newStats.technique = updateStat(newStats.technique, 0.5 * daysToAdvance, p);
                            newStats.mind = updateStat(newStats.mind, 0.5 * daysToAdvance, p);
                            stressGain += 3 * daysToAdvance;
                        } else if (trainingType === 'rest') {
                            stressGain = -3 * daysToAdvance; // Rest
                        }
                    }

                    // Apply Stress
                    let newStress = Math.min(100, Math.max(0, (w.stress || 0) + stressGain));

                    // Reset nextBoutDay if Basho is starting
                    const nextBoutDay = collisionDay !== -1 ? null : w.nextBoutDay;

                    return { ...w, stats: newStats, stress: newStress, nextBoutDay };
                });

                // 3. Okami Relief (Daily x Days)
                const okamiReliefPerDay = [0, 2, 4, 6, 8, 10][okamiLevel] || 2;
                const totalRelief = okamiReliefPerDay * daysToAdvance;

                updatedWrestlers = updatedWrestlers.map(w => ({
                    ...w,
                    stress: Math.max(0, w.stress - totalRelief)
                }));

                // 4. Random Events
                const eventResult = checkRandomEvents(updatedWrestlers, reputation, okamiLevel);

                updatedWrestlers = eventResult.updatedWrestlers;

                // Update Funds/Reputation from Events
                if (eventResult.fundsChange !== 0) setFunds((prev: number) => prev + eventResult.fundsChange);
                if (eventResult.reputationChange !== 0) setReputation(Math.max(0, Math.min(100, reputation + eventResult.reputationChange)));

                eventResult.logs.forEach(l => addLog(l.message, l.type));

                setWrestlers(updatedWrestlers);

                // Auto-Save Weekly
                triggerAutoSave({ wrestlers: updatedWrestlers, heyas, funds: funds + eventResult.fundsChange, reputation: Math.max(0, Math.min(100, reputation + eventResult.reputationChange)), okamiLevel });
            }
        } else {
            // --- TOURNAMENT MODE (Day by Day) ---
            daysToAdvance = 1;

            const currentWrestlers = [...wrestlers];
            const tournamentDay = currentDate.getDate() - 9; // 10th is Day 1

            // 1. Generate Matchups for Today
            const todaysMatchups = matchMaker.generateMatchups(currentWrestlers, tournamentDay);

            // 2. Decide Winners & Prepare Updates
            const updates = new Map<string, { win: boolean, opponentId: string }>();

            todaysMatchups.forEach(matchup => {
                const s1 = matchup.east.stats.body + matchup.east.stats.technique + matchup.east.stats.mind;
                const s2 = matchup.west.stats.body + matchup.west.stats.technique + matchup.west.stats.mind;
                const total = s1 + s2;
                const eastChance = total > 0 ? s1 / total : 0.5;

                // Random Outcome based on Stats
                const eastWins = Math.random() < eastChance;

                // Set Winner in Matchup Object (Mutation ok for generic usage/display)
                matchup.winnerId = eastWins ? matchup.east.id : matchup.west.id;

                updates.set(matchup.east.id, { win: eastWins, opponentId: matchup.west.id });
                updates.set(matchup.west.id, { win: !eastWins, opponentId: matchup.east.id });
            });

            // Update Global State for Matchups (UI Display)
            setTodaysMatchups([...todaysMatchups]);

            // 3. Update Wrestlers Stats
            let updatedWrestlers = currentWrestlers.map(w => {
                const res = updates.get(w.id);

                // Okami Relief (Daily)
                const okamiRelief = [0, 2, 4, 6, 8, 10][okamiLevel] || 2;
                let nextBoutDay = w.nextBoutDay;
                let stressChange = 0;
                let newStats = { ...w.currentBashoStats };

                if (res) {
                    stressChange = res.win ? -2 : 3;
                    newStats.wins += res.win ? 1 : 0;
                    newStats.losses += res.win ? 0 : 1;
                    newStats.matchHistory = [...newStats.matchHistory, res.opponentId];

                    // Schedule next bout for Makushita and below
                    if (!w.isSekitori) {
                        const matchesPlayed = newStats.wins + newStats.losses;
                        const remainingMatches = 7 - matchesPlayed;
                        const remainingDays = 15 - tournamentDay;

                        // Default gap is 2 (Run - Rest - Run)
                        let gap = 2;

                        // Check if we have luxury to rest 2 days (gap=3)
                        // Need: remainingMatches * 2 + 1 (buffer) <= remainingDays
                        // e.g. 2 matches left, need 4 days. If 6 days left, can gap=3 once.
                        if (remainingDays > (remainingMatches * 2 + 2)) {
                            if (Math.random() < 0.5) gap = 3;
                        }

                        // If very tight, forced to verify if gap=2 is even possible is tricky here without lookahead.
                        // But if we strictly follow "gap=2", we consume 2 days per match.
                        // If remainingDays < remainingMatches * 2, we are in trouble.
                        // Ideally "gap=1" (Consecutive) handles emergency.
                        if (remainingDays < remainingMatches * 2) {
                            gap = 1; // Emergency consecutive fight
                        }

                        nextBoutDay = tournamentDay + gap;
                    } else {
                        nextBoutDay = null; // Sekitori fight daily (or handled implicitly)
                    }
                }

                let newStress = Math.max(0, (w.stress || 0) + stressChange - okamiRelief);

                return {
                    ...w,
                    stress: newStress,
                    currentBashoStats: newStats,
                    nextBoutDay: nextBoutDay
                };
            });

            setWrestlers(updatedWrestlers);

            // Basho End Check
            if (currentDate.getDate() >= 24) {
                const divisions = ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'];
                const rankToDivision = (rank: string): string => {
                    if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
                    return rank;
                };

                const winnersMap: Record<string, Wrestler> = {};

                divisions.forEach(division => {
                    const divisionWrestlers = updatedWrestlers.filter(w => rankToDivision(w.rank) === division);

                    if (divisionWrestlers.length > 0) {
                        divisionWrestlers.sort((a, b) => {
                            if (b.currentBashoStats.wins !== a.currentBashoStats.wins) return b.currentBashoStats.wins - a.currentBashoStats.wins;
                            const rA = getRankValue(a.rank);
                            const rB = getRankValue(b.rank);
                            if (rA !== rB) return rB - rA;
                            if ((a.rankNumber || 999) !== (b.rankNumber || 999)) return (a.rankNumber || 999) - (b.rankNumber || 999);
                            if (a.rankSide === 'East' && b.rankSide === 'West') return -1;
                            if (a.rankSide === 'West' && b.rankSide === 'East') return 1;
                            return 0;
                        });
                        winnersMap[division] = divisionWrestlers[0];
                    }
                });

                if (Object.keys(winnersMap).length > 0) {
                    setYushoWinners(winnersMap);

                    // --- Log Yusho History ---
                    const newRecords: YushoRecord[] = Object.entries(winnersMap).map(([div, winner]) => {
                        const heya = heyas.find(h => h.id === winner.heyaId);
                        return {
                            bashoId: formatHybridDate(currentDate, 'tournament'),
                            division: div as Division, // cast string key to Division
                            wrestlerName: winner.name,
                            heyaName: heya ? heya.name : 'Unknown',
                            rank: formatRank(winner.rank), // simplified format
                            wins: winner.currentBashoStats.wins,
                            losses: winner.currentBashoStats.losses
                        };
                    });
                    setYushoHistory(prev => [...prev, ...newRecords]);

                    const makuuchiWinner = winnersMap['Makuuchi'];
                    if (makuuchiWinner) {
                        addLog(`幕内最高優勝: ${makuuchiWinner.name} (${makuuchiWinner.currentBashoStats.wins}勝${makuuchiWinner.currentBashoStats.losses}敗)`, 'info');
                        if (makuuchiWinner.heyaId === 'player_heya') {
                            setFunds(funds + 10000000); // Need to use callback if funds changed in event loop?
                            // actually funds logic is stable here.
                            addLog("優勝賞金 1,000万円を獲得しました！", 'info');
                        }
                    }
                }

                updatedWrestlers = updatedWrestlers.map(w => {
                    if (w.rank === 'MaeZumo') {
                        addLog(`【新序出世】${w.name} が序ノ口に昇進しました！`, 'info');
                        return { ...w, rank: 'Jonokuchi', rankNumber: 50 };
                    }
                    return w;
                });

                let nextWrestlers = updateBanzuke(updatedWrestlers);

                const survivingWrestlers: Wrestler[] = [];
                let retiredCount = 0;

                nextWrestlers.forEach(w => {
                    let shouldRetire = false;
                    if (w.heyaId !== 'player_heya') {
                        if (w.age >= 35 && ['Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'].includes(w.rank)) shouldRetire = true;
                        if (w.age >= 30 && ['Sandanme', 'Jonidan', 'Jonokuchi'].includes(w.rank) && w.injuryStatus === 'injured') shouldRetire = true;
                        if (w.age >= 40) shouldRetire = true;
                    }

                    if (shouldRetire) {
                        retiredCount++;
                    } else {
                        let newMax = w.maxRank;
                        if (shouldUpdateMaxRank(w.rank, w.maxRank)) {
                            newMax = w.rank;
                        }
                        let newStats = { ...w.stats };
                        if (w.age >= 30) {
                            const decayChance = w.age >= 35 ? 0.3 : 0.1;
                            if (Math.random() < decayChance) {
                                newStats.body = Math.max(1, newStats.body - 1);
                                if (w.age >= 35) newStats.technique = Math.max(1, newStats.technique - 1);
                            }
                        }

                        survivingWrestlers.push({
                            ...w,
                            maxRank: newMax,
                            stats: newStats
                        });
                    }
                });

                for (let i = 0; i < retiredCount; i++) {
                    if (heyas.length > 0) {
                        const heya = heyas[Math.floor(Math.random() * heyas.length)];
                        const rookie = generateWrestler(heya, 'Jonokuchi', usedNames);
                        survivingWrestlers.push(rookie);
                    }
                }

                if (retiredCount > 0) {
                    addLog(`${retiredCount}名の力士が引退し、${retiredCount}名の新弟子が入門しました。`, 'info');
                }

                setWrestlers(survivingWrestlers);
                setBashoFinished(true);
            }
        }

        // --- MONTHLY PROCESSING ---
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + daysToAdvance);

        if (nextDate.getMonth() !== currentDate.getMonth()) {
            const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');

            const income = calculateIncome(playerWrestlers);
            const expenseBase = calculateExpenses(playerWrestlers);

            // Okami Budget Cut
            const multiplier = getOkamiBudgetMultiplier(okamiLevel);
            const expense = Math.floor(expenseBase * multiplier);
            const saved = expenseBase - expense;

            const netBalance = income.total - expense;

            // Update Funds
            // NOTE: setFunds uses state. We should be careful about sequential updates.
            // But here we are at end of function.
            // Better to use functional update if funds might have changed during events?
            // "funds" var is closure captured. Events update funds via setFunds. 
            // So "funds" here is STALE if events fired?
            // Yes.
            // We should trust setFunds(prev => prev + ...) logic.
            // Here: setFunds(prev => prev + netBalance);

            setFunds((prev: number) => prev + netBalance);
            setLastMonthBalance(netBalance);

            addLog(`【収支報告】収入: ¥${income.total.toLocaleString()} - 支出: ¥${expense.toLocaleString()} = 収支: ¥${netBalance.toLocaleString()}`, netBalance >= 0 ? 'info' : 'warning');
            if (saved > 0) {
                addLog(`(女将さんの功績により、経費 ¥${saved.toLocaleString()} を節約しました)`, 'info');
            }
        }

        if (nextDate.getFullYear() !== currentDate.getFullYear()) {
            setWrestlers(prev => prev.map(w => ({ ...w, age: w.age + 1 })));
            addLog("新年を迎えました。力士たちが1つ歳をとりました。", 'info');
        }

        if (nextDate.getMonth() !== currentDate.getMonth()) {
            setWrestlers(prev => prev.map(w => ({ ...w, timeInHeya: (w.timeInHeya || 0) + 1 })));
        }

        advanceDate(daysToAdvance);
    };


    const closeBashoModal = () => {
        setBashoFinished(false);
        setGameMode('training');
        addLog("新番付が発表されました。育成期間に入ります。", 'info');
    };

    const inspectCandidate = (cost: number): boolean => {
        if (funds < cost) return false;
        setFunds((prev: number) => prev - cost);
        return true;
    };

    const recruitWrestler = (candidate: Candidate, customName?: string) => {
        if (funds < candidate.scoutCost) return;

        const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');
        if (playerWrestlers.length >= MAX_PLAYERS_PER_HEYA) {
            addLog("部屋の定員オーバーです！", 'error');
            return;
        }

        setFunds((prev: number) => prev - candidate.scoutCost);

        const { scoutCost, revealedStats, ...wrestlerData } = candidate;

        const newWrestler: Wrestler = {
            ...wrestlerData,
            name: customName && customName.trim() !== '' ? customName : wrestlerData.name,
            rank: 'MaeZumo',
            rankNumber: 1,
            history: [],
            currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
            nextBoutDay: null,
            stress: 0 // Init stress
        };

        setWrestlers(prev => [...prev, newWrestler]);
        addLog(`新弟子 ${newWrestler.name} が入門しました！来場所から前相撲として修行を開始します。`, 'info');
        setCandidates(prev => prev.filter(c => c.id !== candidate.id));
    };

    const retireWrestler = (wrestlerId: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler) return;

        // New Logic: If Sekitori, queue for Danpatsu-shiki
        if (wrestler.isSekitori) {
            setRetiringQueue(prev => [...prev, wrestler]);
            // Remove from active list immediately? 
            // If we remove immediately, the modal needs the object.
            // We pushed the object to queue, so it's safe.
            setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
            return;
        }

        // Non-Sekitori: Retire quietly
        const severance = calculateSeverance(wrestler); // Assuming this creates small amount or 0
        if (severance > 0) {
            setFunds((prev: number) => prev + severance);
        }

        setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
        addLog(`【引退】${wrestler.name} (最高位: ${formatRank(wrestler.rank)}) が引退しました。`, 'warning');
    };

    const completeRetirement = (wrestler: Wrestler) => {
        const severance = calculateSeverance(wrestler);
        if (severance > 0) {
            setFunds((prev: number) => prev + severance);
            addLog(`断髪式にて、協会より功労金 ¥${severance.toLocaleString()} が支払われました。`, 'info');
        }
        addLog(`【引退】${wrestler.name} の断髪式が執り行われ、マゲに別れを告げました。`, 'warning');

        // Remove from queue
        setRetiringQueue(prev => prev.filter(w => w.id !== wrestler.id));
    };

    const upgradeOkami = () => {
        const cost = getOkamiUpgradeCost(okamiLevel);
        if (!cost) return;
        if (funds < cost) {
            addLog("資金が不足しています。", 'error');
            return;
        }
        setFunds((prev: number) => prev - cost);
        setOkamiLevel(okamiLevel + 1);
        addLog(`女将さんのレベルが ${okamiLevel + 1} に上がりました！`, 'info');
    };

    // Special Training Logic
    const doSpecialTraining = (wrestlerId: string, menuType: TrainingType | 'meditation') => {
        if (trainingPoints <= 0) {
            alert("指導力が不足しています");
            return;
        }

        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler) return;

        if (wrestler.injuryStatus === 'injured') {
            alert("怪我をしている力士は特訓できません");
            return;
        }

        setTrainingPoints((prev: number) => prev - 1);

        let newStats = { ...wrestler.stats };
        let stressGain = 0;
        let diffBody = 0, diffTech = 0, diffMind = 0;

        const p = wrestler.potential;
        const getEfficiency = (current: number) => Math.max(0.1, (p - current) / p);
        const baseBoost = 2.0;

        if (menuType === 'shiko') {
            const gain = baseBoost * getEfficiency(newStats.body) * 2;
            newStats.body = Math.min(p, newStats.body + gain);
            diffBody = gain;
            stressGain = 5;
        } else if (menuType === 'teppo') {
            const gainT = baseBoost * getEfficiency(newStats.technique);
            const gainB = baseBoost * getEfficiency(newStats.body) * 0.5;
            newStats.technique = Math.min(p, newStats.technique + gainT);
            newStats.body = Math.min(p, newStats.body + gainB);
            diffTech = gainT;
            diffBody = gainB;
            stressGain = 5;
        } else if (menuType === 'moushi_ai') {
            const gainT = baseBoost * getEfficiency(newStats.technique) * 1.5;
            const gainM = baseBoost * getEfficiency(newStats.mind);
            newStats.technique = Math.min(p, newStats.technique + gainT);
            newStats.mind = Math.min(p, newStats.mind + gainM);
            diffTech = gainT;
            diffMind = gainM;
            stressGain = 15;
        } else if (menuType === 'meditation') {
            const gainM = baseBoost * getEfficiency(newStats.mind) * 2;
            newStats.mind = Math.min(p, newStats.mind + gainM);
            diffMind = gainM;
            stressGain = -20;
        }

        const newStress = Math.min(100, Math.max(0, (wrestler.stress || 0) + stressGain));

        setWrestlers((prev: Wrestler[]) => prev.map((w: Wrestler) =>
            w.id === wrestlerId
                ? { ...w, stats: newStats, stress: newStress }
                : w
        ));

        addLog(`${wrestler.name}が${menuType === 'shiko' ? '四股' :
            menuType === 'teppo' ? '鉄砲' :
                menuType === 'moushi_ai' ? '申し合い' : '瞑想'
            }を行いました (心+${diffMind.toFixed(1)} 技+${diffTech.toFixed(1)} 体+${diffBody.toFixed(1)})`, 'info');
    };

    // History & Save Logic
    const triggerAutoSave = (currentState: { wrestlers: Wrestler[], heyas: Heya[], funds: number, reputation: number, okamiLevel: number, history?: YushoRecord[], usedNames?: string[] }) => {
        // We use the passed state to ensure we save the *latest* data after updates
        const saveData: SaveData = {
            version: 1,
            timestamp: Date.now(),
            gameState: {
                currentDate: currentDate.toISOString(),
                funds: currentState.funds,
                gameMode,
                bashoFinished,
                lastMonthBalance,
                isInitialized,
                oyakataName: oyakataName,
                okamiLevel: currentState.okamiLevel,
                reputation: currentState.reputation,
                trainingPoints
            },
            wrestlers: currentState.wrestlers,
            heyas: currentState.heyas,
            yushoHistory: yushoHistory.concat(currentState.history || []),
            logs: logs,
            usedNames: currentState.usedNames || []
        };
        saveGame(saveData);
    };

    const recordYushoHistory = (winners: Record<string, Wrestler>) => {
        const bashoId = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月場所`;

        const newRecords: YushoRecord[] = Object.entries(winners).map(([div, winner]) => {
            const heya = heyas.find(h => h.id === winner.heyaId);
            return {
                bashoId,
                division: div as Division,
                wrestlerName: winner.name,
                heyaName: heya ? heya.name : '不明',
                rank: formatRank(winner.rank, winner.rankSide, winner.rankNumber),
                wins: winner.currentBashoStats.wins,
                losses: winner.currentBashoStats.losses
            };
        });

        setYushoHistory(prev => [...prev, ...newRecords]);
        return newRecords; // Return for saving
    };

    return { advanceTime, closeBashoModal, candidates, recruitWrestler, inspectCandidate, retireWrestler, completeRetirement, upgradeOkami, doSpecialTraining, triggerAutoSave, recordYushoHistory };
};

