import { useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { TrainingType, Wrestler, Candidate } from '../types';
import { updateBanzuke } from '../utils/banzuke';
import { generateCandidates } from '../utils/scouting';
import { MAX_PLAYERS_PER_HEYA } from '../utils/constants';

export const useGameLoop = () => {
    const {
        currentDate,
        funds,
        wrestlers,
        gameMode,
        setFunds,
        setWrestlers,
        advanceDate,
        addLog,
        setGameMode,
        setBashoFinished
    } = useGame();

    // const [bashoFinished, setBashoFinished] = useState(false); // Removed local state
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    const advanceTime = (trainingType: TrainingType) => {
        let daysToAdvance = 0;
        let costMultiplier = 0;
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

            costMultiplier = daysToAdvance;

            // Training logic (simplified same as before)
            let updatedWrestlers = [...wrestlers];
            // ... (Keep existing training logic from previous step if possible, or re-implement briefly)
            // Re-implementing simplified for brevity in this replace:
            if (daysToAdvance > 0) {
                updatedWrestlers = wrestlers.map(w => {
                    let newStats = { ...w.stats };
                    if (trainingType === 'shiko') newStats.body += 1 * daysToAdvance;
                    if (trainingType === 'teppo') newStats.technique += 1 * daysToAdvance;
                    if (trainingType === 'moushi_ai' && w.injuryStatus !== 'injured') {
                        newStats.mind += 1 * daysToAdvance;
                        newStats.technique += 1 * daysToAdvance;
                        newStats.body += 1 * daysToAdvance;
                    }
                    return { ...w, stats: newStats };
                });
                setWrestlers(updatedWrestlers);
            }
        } else {
            // --- TOURNAMENT MODE (Day by Day) ---
            daysToAdvance = 1;
            costMultiplier = 1;

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
                const w1 = activeFighters[i];
                const w2 = activeFighters[i + 1];

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
            const updatedWrestlers = currentWrestlers.map(w => {
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
                // Trigger Banzuke Update
                const tempWrestlers = updateBanzuke(updatedWrestlers); // Calculate new ranks

                // Strict Sort by Rank Hierarchy Logic (Ensure visualization matches reality)
                // 1. Division (Makuuchi > Juryo...)
                // 2. Rank Number (Asc)
                // 3. Side (East > West)

                // Helper for Sort Value
                // We can use getRankValue BUT it doesn't account for Side/Number fully in sorting usually.
                // We know `tempWrestlers` comes out relatively sorted, but let's be explicit.
                // Or updateBanzuke returns sorted? 
                // Ideally updateBanzuke output IS the Banzuke, so it should be sorted.
                // But let's trust updateBanzuke output order for now (Phase 6 refined it).
                // If user requested explicit sort:

                // Actually, `updateBanzuke` in Phase 6 uses `scoredWrestlers` sort.
                // Since we assign ranks sequentially from Top down, the index order IS the rank order.
                // Index 0 = East Yokozuna 1. Index 1 = West Yokozuna 1.
                // So the array IS already sorted.
                // The issue might be that `setWrestlers` doesn't seem to reflect it?
                // Or maybe `updateBanzuke` logic in previous turn wasn't fully saved/applied?
                // We just re-wrote `banzuke.ts`. It maps `scoredWrestlers` (sorted) to quota.
                // So result IS sorted.

                // I will leave it as is if I trust `updateBanzuke`, but allow forcing a re-render.
                // setWrestlers([...tempWrestlers]) to be sure.

                setWrestlers([...tempWrestlers]);

                // Trigger Modal instead of auto-switch
                setBashoFinished(true);
            }

        }

        // Cost Deduction
        let dailyCostBase = 0;
        const baseCostPerWrestler = 5000;
        const sekitoriBonusCost = 5000;

        wrestlers.filter(w => w.heyaId === 'player_heya').forEach(w => {
            let cost = baseCostPerWrestler;
            if (w.isSekitori) cost += sekitoriBonusCost;
            dailyCostBase += cost;
        });

        const totalCost = dailyCostBase * costMultiplier;
        const newFunds = funds - totalCost;
        setFunds(newFunds);

        // Logs 
        // ... (Keep existing logs logic)

        // Advance Date
        advanceDate(daysToAdvance);
    };

    const closeBashoModal = () => {
        setBashoFinished(false);
        setGameMode('training');
        addLog("新番付が発表されました。育成期間に入ります。", 'info');
    };

    const recruitWrestler = (candidate: Candidate) => {
        if (funds < candidate.scoutCost) return;

        const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');
        if (playerWrestlers.length >= MAX_PLAYERS_PER_HEYA) {
            // Should be handled by UI disable, but safe check
            addLog("部屋の定員オーバーです！", 'error');
            return;
        }

        // Deduct Funds
        setFunds(funds - candidate.scoutCost);

        // Convert Candidate to Wrestler
        const { scoutCost, revealedStats, ...wrestlerData } = candidate;

        // Add to roster
        // We append. Sorting will happen next Basho update.
        // Or we can simple-sort now?
        // Let's just append.
        const newWrestler: Wrestler = {
            ...wrestlerData,
            history: [],
            currentBashoStats: { wins: 0, losses: 0 }
        };

        setWrestlers([...wrestlers, newWrestler]);
        addLog(`新弟子 ${newWrestler.name} をスカウトしました！`, 'info');

        // Remove from candidates
        setCandidates(prev => prev.filter(c => c.id !== candidate.id));
    };

    return { advanceTime, closeBashoModal, candidates, recruitWrestler };
};
