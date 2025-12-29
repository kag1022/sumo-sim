import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TrainingType, Wrestler, Candidate } from '../types';
import { updateBanzuke } from '../utils/banzuke';
import { generateCandidates } from '../utils/scouting';
import { generateWrestler } from '../utils/dummyGenerator';
import { MAX_PLAYERS_PER_HEYA, getRankValue } from '../utils/constants';
import { calculateIncome, calculateExpenses } from '../utils/economy';
import { calculateSeverance, shouldUpdateMaxRank } from '../utils/retirement';

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
        setLastMonthBalance // New Context Action
    } = useGame();

    // const [bashoFinished, setBashoFinished] = useState(false); // Removed local state
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    const advanceTime = (trainingType: TrainingType) => {
        let daysToAdvance = 0;
        // let costMultiplier = 0; // Removed daily multiplier
        // let statsMultiplier = 1.0; 

        // Check next state
        if (gameMode === 'training') {
            // --- TRAINING MODE (Weekly) ---
            daysToAdvance = 7;
            // statsMultiplier = 2.0; // Weekly Logic

            // Generate New Candidates each week (if none exist or refresh?)
            // Let's refresh every week for variety
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

            // costMultiplier = daysToAdvance; // Removed

            // Training logic (simplified same as before)
            let updatedWrestlers = [...wrestlers];
            // ... (Keep existing training logic from previous step if possible, or re-implement briefly)
            // Re-implementing simplified for brevity in this replace:
            if (daysToAdvance > 0) {
                // Diminishing Returns Logic (Based on Potential)
                const updateStat = (current: number, gain: number, potential: number) => {
                    // Gain = Base * ((Potential - Current) / Potential)
                    // If current >= potential, gain is 0.
                    const potentialFactor = Math.max(0, (potential - current) / potential);
                    return Math.min(potential, current + (gain * potentialFactor));
                };

                // Decay Logic ( > 80 )
                const applyDecay = (val: number) => {
                    return val > 80 ? val - (0.05 * daysToAdvance) : val;
                };

                updatedWrestlers = wrestlers.map(w => {
                    let newStats = { ...w.stats };

                    // 1. Decay
                    newStats.mind = applyDecay(newStats.mind);
                    newStats.technique = applyDecay(newStats.technique);
                    newStats.body = applyDecay(newStats.body);

                    // 2. Training Gain
                    const p = w.potential;
                    if (trainingType === 'shiko') {
                        newStats.body = updateStat(newStats.body, 1.0 * daysToAdvance, p);
                        newStats.mind = updateStat(newStats.mind, 0.2 * daysToAdvance, p);
                        newStats.technique = updateStat(newStats.technique, 0.2 * daysToAdvance, p);
                    } else if (trainingType === 'teppo') {
                        newStats.technique = updateStat(newStats.technique, 1.0 * daysToAdvance, p);
                        newStats.mind = updateStat(newStats.mind, 0.2 * daysToAdvance, p);
                        newStats.body = updateStat(newStats.body, 0.2 * daysToAdvance, p);
                    } else if (trainingType === 'moushi_ai' && w.injuryStatus !== 'injured') {
                        newStats.mind = updateStat(newStats.mind, 0.6 * daysToAdvance, p);
                        newStats.technique = updateStat(newStats.technique, 0.6 * daysToAdvance, p);
                        newStats.body = updateStat(newStats.body, 0.6 * daysToAdvance, p);
                    }
                    // Rest: No Gain, just decay applied (maintenance failure) OR we can say Rest stops decay?
                    // "Maintain" usually implies training. So if they rest, they decay.

                    return { ...w, stats: newStats };
                });
                setWrestlers(updatedWrestlers);
            }
        } else {
            // --- TOURNAMENT MODE (Day by Day) ---
            daysToAdvance = 1;
            // costMultiplier = 1;

            // 1. Simulate Matches (Zero-Sum, Dynamic Pairing)
            // Group wrestlers by Score (Wins)
            // For Simplicity in Prototype: We shuffle everyone and pair them up.
            // Dynamic Matchmaking: Sort by Wins, then pair adjacent.

            // Clone for mutation
            let currentWrestlers = [...wrestlers];

            // Filter those who fight today.
            // Sekitori: Always fight.
            // Makushita & Below: Fight if Day is Odd? (Day 1, 3, 5... 13, 15 => 8 matches? Too many. Need 7).
            // Standard: Days 1,2, 3,4 ... block.
            // Simple Logic: Fight on Odd days (1,3,5,7,9,11,13). Day 15 is index 14??
            // Let's use Date object day? No, Tournament Day Counter is better.
            // We don't have explicit "Day 1-15" counter in state, but we can derive from Date.
            // Odd Month 10th = Day 1. 
            // Day X = (currentDate.getDate() - 9).
            // 10th (1), 11th (2)...

            const tournamentDay = currentDate.getDate() - 9;

            // Schedule: Lower ranks fight on Days 1, 3, 5, 7, 9, 11, 13 (Total 7).
            const lowerRanksFight = (tournamentDay % 2 !== 0) && (tournamentDay <= 13);

            // Active Fighters Pool
            const activeFighters = currentWrestlers.filter(w => {
                if (w.rank === 'MaeZumo') return false; // MaeZumo do not fight
                if (w.injuryStatus === 'injured') return false; // Injured skip
                if (w.isSekitori) return true; // Sekitori always fight
                return lowerRanksFight; // Makushita etc follow schedule
            });

            // Matchmaking
            // 1. Sort by Wins Desc (Group by Wins)
            activeFighters.sort((a, b) => b.currentBashoStats.wins - a.currentBashoStats.wins);

            // 2. Pair Adjacent
            // Note: activeFighters is a subset of currentWrestlers.
            // We need to map results back to currentWrestlers.
            // Let's create a map of updates.

            const updates = new Map<string, { win: boolean }>();

            for (let i = 0; i < activeFighters.length - 1; i += 2) {
                let w1 = activeFighters[i];
                let w2 = activeFighters[i + 1];

                // Avoid Same Heya Matchup
                if (w1.heyaId === w2.heyaId) {
                    // Try to finding a swap candidate in the remaining pool
                    for (let j = i + 2; j < activeFighters.length; j++) {
                        if (activeFighters[j].heyaId !== w1.heyaId) {
                            // Swap w2 with w[j]
                            const temp = w2;
                            activeFighters[i + 1] = activeFighters[j];
                            activeFighters[j] = temp;
                            w2 = activeFighters[i + 1]; // Update local ref
                            break;
                        }
                    }
                    // If no swap found (everyone remaining is same heya), we proceed with same-heya match (fallback)
                }

                // Determine Winner
                // Simple RNG for now (50/50) or weigh by stats?
                // "Stats close = 50/50". "Stats gap = favor strong".
                // Let's use Body/Tech/Mind sum.
                const s1 = w1.stats.body + w1.stats.technique + w1.stats.mind;
                const s2 = w2.stats.body + w2.stats.technique + w2.stats.mind;
                const total = s1 + s2;
                const w1Chance = s1 / total;

                // Random
                const r = Math.random();
                const w1Wins = r < w1Chance;

                updates.set(w1.id, { win: w1Wins });
                updates.set(w2.id, { win: !w1Wins });
            }

            // Apply Updates
            let updatedWrestlers = currentWrestlers.map(w => {
                const res = updates.get(w.id);
                if (res) {
                    return {
                        ...w,
                        currentBashoStats: {
                            wins: w.currentBashoStats.wins + (res.win ? 1 : 0),
                            losses: w.currentBashoStats.losses + (res.win ? 0 : 1)
                        }
                    };
                }
                return w;
            });

            setWrestlers(updatedWrestlers);

            // Check End of Tournament (Day 15 completed => Next Date is 16th day i.e. 25th)
            // Current is 24th (Day 15). Next 25th.
            if (currentDate.getDate() >= 24) {
                // Basho End!

                // 1. DETERMINE CHAMPIONS (All Divisions)
                const divisions = ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'];
                const rankToDivision = (rank: any): string => {
                    if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
                    return rank; // Matches Juryo, Makushita etc
                };

                const winnersMap: Record<string, Wrestler> = {};

                divisions.forEach(division => {
                    // Filter wrestlers in this division
                    const divisionWrestlers = updatedWrestlers.filter(w => rankToDivision(w.rank) === division);

                    if (divisionWrestlers.length > 0) {
                        // Sort by Wins DESC, then Rank Value DESC (Priority)
                        divisionWrestlers.sort((a, b) => {
                            if (b.currentBashoStats.wins !== a.currentBashoStats.wins) {
                                return b.currentBashoStats.wins - a.currentBashoStats.wins;
                            }
                            // Tie-breaker: Rank Priority
                            const rA = getRankValue(a.rank);
                            const rB = getRankValue(b.rank);
                            if (rA !== rB) return rB - rA; // Higher value first

                            // Same Rank Group: Rank Number
                            if ((a.rankNumber || 999) !== (b.rankNumber || 999)) return (a.rankNumber || 999) - (b.rankNumber || 999);

                            // East > West
                            if (a.rankSide === 'East' && b.rankSide === 'West') return -1;
                            if (a.rankSide === 'West' && b.rankSide === 'East') return 1;

                            return 0;
                        });

                        winnersMap[division] = divisionWrestlers[0];
                    }
                });

                if (Object.keys(winnersMap).length > 0) {
                    setYushoWinners(winnersMap);
                    // Prize Logic (Makuuchi only for money)
                    const makuuchiWinner = winnersMap['Makuuchi'];
                    if (makuuchiWinner) {
                        addLog(`幕内最高優勝: ${makuuchiWinner.name} (${makuuchiWinner.currentBashoStats.wins}勝${makuuchiWinner.currentBashoStats.losses}敗)`, 'info');
                        if (makuuchiWinner.heyaId === 'player_heya') {
                            setFunds(funds + 10000000);
                            addLog("優勝賞金 1,000万円を獲得しました！", 'info');
                        }
                    }
                }

                // 2. BANZUKE UPDATE (Resets Stats)
                // Promote MaeZumo -> Jonokuchi BEFORE or AFTER update?
                // Logic: MaeZumo who finished "training" (1 basho) get on banzuke.
                // We identify them by Rank 'MaeZumo'.
                // We should change their rank to 'Jonokuchi' BEFORE calling updateBanzuke?
                // updateBanzuke performs logic. If they are Jonokuchi, they get sorted.
                // But they have 0-0 stats. They will be ranked at bottom of Jonokuchi.

                updatedWrestlers = updatedWrestlers.map(w => {
                    if (w.rank === 'MaeZumo') {
                        addLog(`【新序出世】${w.name} が序ノ口に昇進しました！`, 'info');
                        return { ...w, rank: 'Jonokuchi', rankNumber: 50 }; // Promote
                    }
                    return w;
                });

                let nextWrestlers = updateBanzuke(updatedWrestlers);

                // 3. GENERATION TURNOVER (CPU Retirement)
                // Filter out retired wrestlers and Generate Replacements
                const survivingWrestlers: Wrestler[] = [];
                let retiredCount = 0;

                nextWrestlers.forEach(w => {
                    let shouldRetire = false;

                    // Manual Player Retirement is separate. Only check CPU.
                    if (w.heyaId !== 'player_heya') {
                        // Condition A: 35+ and Makushita or lower
                        if (w.age >= 35 && ['Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'].includes(w.rank)) {
                            shouldRetire = true;
                        }
                        // Condition B: 30+ and Sandanme or lower AND Injured
                        if (w.age >= 30 && ['Sandanme', 'Jonidan', 'Jonokuchi'].includes(w.rank) && w.injuryStatus === 'injured') {
                            shouldRetire = true;
                        }
                        // Condition C: 40+ (Force Retire)
                        if (w.age >= 40) {
                            shouldRetire = true;
                        }
                    }

                    if (shouldRetire) {
                        retiredCount++;
                    } else {
                        // SURVIVOR PROCESSING
                        // 1. Update Max Rank
                        let newMax = w.maxRank;
                        if (shouldUpdateMaxRank(w.rank, w.maxRank)) {
                            newMax = w.rank;
                        }
                        // 2. Decay check (re-implement from before or assume monthly? Let's do daily decay as implemented in previous step, so minimal here, or Age based decay?)
                        // User Req: "Decay > 30yo post-basho" logic was in previous code.
                        // Implemented:
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

                // Replenish
                for (let i = 0; i < retiredCount; i++) {
                    if (heyas.length > 0) {
                        const heya = heyas[Math.floor(Math.random() * heyas.length)];
                        // Rank 'Jonokuchi'
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
        // Check if Month Changed
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + daysToAdvance);

        // If Month Changed AND not Jan 1st (Initial)
        // Note: advanceDate updates `currentDate` state async, so we assume `currentDate` is "today".
        // If nextDate month != currentDate month, we trigger monthly process for the PASSED month?
        // Actually, typically bills are paid at end or start of month.
        // Let's pay when we CROSS the month boundary.

        if (nextDate.getMonth() !== currentDate.getMonth()) {
            // Month Changed!
            // Calculate Income/Expense
            const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');

            const income = calculateIncome(playerWrestlers);
            const expense = calculateExpenses(playerWrestlers);
            const netBalance = income.total - expense;

            // Update Funds
            // Note: funds is current state.
            const newFunds = funds + netBalance;
            setFunds(newFunds);
            setLastMonthBalance(netBalance);

            addLog(`【収支報告】収入: ¥${income.total.toLocaleString()} - 支出: ¥${expense.toLocaleString()} = 収支: ¥${netBalance.toLocaleString()} `, netBalance >= 0 ? 'info' : 'warning');
        }

        // --- NEW YEAR AGING ---
        if (nextDate.getFullYear() !== currentDate.getFullYear()) {
            setWrestlers(prev => prev.map(w => ({ ...w, age: w.age + 1 })));
            addLog("新年を迎えました。力士たちが1つ歳をとりました。", 'info');
        }

        // --- MONTHLY TENURE ---
        // Increment timeInHeya for player wrestlers only? Or all?
        // Let's do all for simplicity or player only if needed.
        // We can do this in the wrestler map above if we merged, but separated is fine.
        if (nextDate.getMonth() !== currentDate.getMonth()) {
            setWrestlers(prev => prev.map(w => ({ ...w, timeInHeya: (w.timeInHeya || 0) + 1 })));
        }

        // Advance Date
        advanceDate(daysToAdvance);
    };


    const closeBashoModal = () => {
        setBashoFinished(false);
        setGameMode('training');
        addLog("新番付が発表されました。育成期間に入ります。", 'info');
    };

    const inspectCandidate = (cost: number): boolean => {
        if (funds < cost) return false;
        setFunds(funds - cost); // Use direct value instead of callback if context is simple setter
        return true;
    };

    const recruitWrestler = (candidate: Candidate, customName?: string) => {
        if (funds < candidate.scoutCost) return;

        const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');
        if (playerWrestlers.length >= MAX_PLAYERS_PER_HEYA) {
            addLog("部屋の定員オーバーです！", 'error');
            return;
        }

        // Deduct Funds
        setFunds(funds - candidate.scoutCost);

        // Convert Candidate to Wrestler
        const { scoutCost, revealedStats, ...wrestlerData } = candidate;

        // Create new object explicitly to avoid spread overwrite issues
        const newWrestler: Wrestler = {
            ...wrestlerData,
            name: customName && customName.trim() !== '' ? customName : wrestlerData.name, // Explicit Name Overwrite
            rank: 'MaeZumo',
            rankNumber: 1,
            history: [],
            currentBashoStats: { wins: 0, losses: 0 }
        };

        setWrestlers([...wrestlers, newWrestler]);
        addLog(`新弟子 ${newWrestler.name} が入門しました！来場所から前相撲として修行を開始します。`, 'info');

        // Remove from candidates
        setCandidates(prev => prev.filter(c => c.id !== candidate.id));
    };

    const retireWrestler = (wrestlerId: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler) return;

        const severance = calculateSeverance(wrestler);
        setFunds(funds + severance);

        setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));

        addLog(`【引退】${wrestler.name} (最高位: ${wrestler.maxRank}) が引退しました。断髪式にて ¥${severance.toLocaleString()} のご祝儀を受け取りました。`, 'warning');
    };

    return { advanceTime, closeBashoModal, candidates, recruitWrestler, inspectCandidate, retireWrestler };
};
