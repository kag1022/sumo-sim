import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TrainingType, Wrestler, Candidate } from '../types';
import { matchMaker } from '../utils/matchmaker/MatchMaker';
import { updateBanzuke } from '../utils/banzuke';
import { generateCandidates } from '../utils/scouting';
import { generateWrestler } from '../utils/dummyGenerator';
import { MAX_PLAYERS_PER_HEYA, getRankValue } from '../utils/constants';
import { calculateIncome, calculateExpenses } from '../utils/economy';
import { calculateSeverance, shouldUpdateMaxRank } from '../utils/retirement';
import { getOkamiBudgetMultiplier, getOkamiUpgradeCost } from '../utils/okami';
import { useEvents } from './useEvents';

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
        setOkamiLevel,
        setReputation,
        setTodaysMatchups
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

            // Training logic
            let updatedWrestlers = [...wrestlers];
            if (daysToAdvance > 0) {
                const updateStat = (current: number, gain: number, potential: number) => {
                    const potentialFactor = Math.max(0, (potential - current) / potential);
                    return Math.min(potential, current + (gain * potentialFactor));
                };

                const applyDecay = (val: number) => {
                    return val > 80 ? val - (0.05 * daysToAdvance) : val;
                };

                updatedWrestlers = wrestlers.map(w => {
                    let newStats = { ...w.stats };
                    let stressGain = 0;

                    // 1. Decay
                    newStats.mind = applyDecay(newStats.mind);
                    newStats.technique = applyDecay(newStats.technique);
                    newStats.body = applyDecay(newStats.body);

                    // 2. Training Gain & Stress
                    const p = w.potential;
                    const isHealthy = w.injuryStatus !== 'injured';

                    if (isHealthy) {
                        if (trainingType === 'shiko') {
                            newStats.body = updateStat(newStats.body, 1.0 * daysToAdvance, p);
                            newStats.mind = updateStat(newStats.mind, 0.2 * daysToAdvance, p);
                            newStats.technique = updateStat(newStats.technique, 0.2 * daysToAdvance, p);
                            stressGain = 2 * daysToAdvance;
                        } else if (trainingType === 'teppo') {
                            newStats.technique = updateStat(newStats.technique, 1.0 * daysToAdvance, p);
                            newStats.mind = updateStat(newStats.mind, 0.2 * daysToAdvance, p);
                            newStats.body = updateStat(newStats.body, 0.2 * daysToAdvance, p);
                            stressGain = 2 * daysToAdvance;
                        } else if (trainingType === 'moushi_ai') {
                            newStats.mind = updateStat(newStats.mind, 0.6 * daysToAdvance, p);
                            newStats.technique = updateStat(newStats.technique, 0.6 * daysToAdvance, p);
                            newStats.body = updateStat(newStats.body, 0.6 * daysToAdvance, p);
                            stressGain = 5 * daysToAdvance; // High stress
                        }
                    }

                    if (trainingType === 'rest') {
                        stressGain = -5 * daysToAdvance; // Rest reduces stress
                    }

                    // Apply Stress
                    let newStress = Math.min(100, Math.max(0, (w.stress || 0) + stressGain));

                    // Reset nextBoutDay if Basho is starting
                    const nextBoutDay = collisionDay !== -1 ? null : w.nextBoutDay;

                    return { ...w, stats: newStats, stress: newStress, nextBoutDay };
                });

                // 3. Okami Relief (Daily x Days)
                // Note: applyOkamiStressRelief is "per day" logic.
                // We simplify by calling it once with total relief calculation or iterating?
                // The util takes array. Let's do it manually here or update util.
                // Util: "Stress - X". So we do "X * days".
                // We'll reimplement inline for simplicity or loop.
                // Re-using util properly:
                // Actually let's just do it inline here to save loops.
                const okamiReliefPerDay = [0, 2, 4, 6, 8, 10][okamiLevel] || 2;
                const totalRelief = okamiReliefPerDay * daysToAdvance;

                updatedWrestlers = updatedWrestlers.map(w => ({
                    ...w,
                    stress: Math.max(0, w.stress - totalRelief)
                }));

                // 4. Random Events
                // For simplicity, we run ONE event check per week (batch).
                // Or daily? Daily is better for "Daily Life".
                // But simplified: Batch check.
                const eventResult = checkRandomEvents(updatedWrestlers, reputation, okamiLevel);

                updatedWrestlers = eventResult.updatedWrestlers;

                // Update Funds/Reputation from Events
                if (eventResult.fundsChange !== 0) setFunds((prev: number) => prev + eventResult.fundsChange);
                if (eventResult.reputationChange !== 0) setReputation(Math.max(0, Math.min(100, reputation + eventResult.reputationChange)));

                eventResult.logs.forEach(l => addLog(l.message, l.type));

                setWrestlers(updatedWrestlers);
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
                    const makuuchiWinner = winnersMap['Makuuchi'];
                    if (makuuchiWinner) {
                        addLog(`幕内最高優勝: ${makuuchiWinner.name} (${makuuchiWinner.currentBashoStats.wins}勝${makuuchiWinner.currentBashoStats.losses}敗)`, 'info');
                        if (makuuchiWinner.heyaId === 'player_heya') {
                            setFunds(funds + 10000000); // Need to use callback if funds changed in event loop?
                            // Actually funds logic is stable here.
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
                        const rookie = generateWrestler(heya, 'Jonokuchi');
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

        const severance = calculateSeverance(wrestler);
        setFunds((prev: number) => prev + severance);

        setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));

        addLog(`【引退】${wrestler.name} (最高位: ${wrestler.maxRank}) が引退しました。断髪式にて ¥${severance.toLocaleString()} のご祝儀を受け取りました。`, 'warning');
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

    return { advanceTime, closeBashoModal, candidates, recruitWrestler, inspectCandidate, retireWrestler, upgradeOkami };
};

