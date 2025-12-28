import { Wrestler, Rank } from '../types';
import { QUOTA_MAKUUCHI, QUOTA_JURYO, QUOTA_MAKUSHITA, RANK_VALUE_MAP } from './constants';

// Coefficient for score calculation
// Tuned for Base Scores: M (10,000) vs J (5,000) vs Ms (1,000)
// Gap = 5000. 15 wins must bridge gap? No, 8-7 vs 7-8 swing is small.
// But to Demote M->J, M score must drop below J.
// M (10k) - 15*X < J (5k) + 15*X
// 5000 < 30X => X > 166.
// Let's use 350 for Sekitori (High variance)
// For Makushita (1k) to reach Juryo (5k):
// 1000 + 7*Y > 5000 => 7Y > 4000 => Y > 570.
// Let's use 600 for Lower.

const SCORE_COEFFICIENT_SEKITORI = 350;
const SCORE_COEFFICIENT_MAKUSHITA_PRO = 700; // Special high coeff for Makushita to allow promotion
const SCORE_COEFFICIENT_LOWER = 50; // Sandanme and below dont need massive jumps usually

export const calculateBanzukeScore = (wrestler: Wrestler): number => {
    const baseScore = RANK_VALUE_MAP[wrestler.rank] || 0;

    let positionalAdjustment = 0;
    if (wrestler.rankNumber) {
        positionalAdjustment = (100 - wrestler.rankNumber) * 1;
    }

    const { wins, losses } = wrestler.currentBashoStats;
    const netWins = wins - losses;

    let coefficient = SCORE_COEFFICIENT_SEKITORI;
    if (wrestler.rank === 'Makushita') {
        coefficient = SCORE_COEFFICIENT_MAKUSHITA_PRO;
    } else if (!wrestler.isSekitori) {
        coefficient = SCORE_COEFFICIENT_LOWER;
    }

    // Special Bonus for Perfect Record (Priority)
    // Instead of Flag Sort, we give points.
    let bonus = 0;
    const isPerfect = wins === 7 && losses === 0;

    // SCORE CAP LOGIC
    // Calculate raw score
    let rawScore = baseScore + positionalAdjustment + (netWins * coefficient) + bonus;

    // Safety Cap: If coming from Makushita/Lower, score must NOT exceed Juryo Ceiling (approx 9000?)
    // Makuuchi Min is approx 10000 - (15*350=5250) = 4750.
    // Wait, Makuuchi Base is 10000.
    // M1 (10000) 0-15 => 4750.
    // Makushita (1000) 7-0 => 1000 + 4900 = 5900.
    // 5900 > 4750. So they CAN overtake Makuuchi 0-15.

    // User Requirement: "Never Makuuchi".
    // So we must Cap Makushita score at "Just below Makuuchi Min".
    // Or simpler: Cap at "Juryo Top Score" ~ 9000?
    // No, Makuuchi Floor is the limit.
    // Let's Cap Makushita Score at 4500 (Below worst Makuuchi).

    if (wrestler.rank === 'Makushita' || wrestler.rank === 'Sandanme' || wrestler.rank === 'Jonidan' || wrestler.rank === 'Jonokuchi') {
        if (rawScore > 4500) {
            rawScore = 4500;
        }
    }

    return rawScore;
};

export const updateBanzuke = (wrestlers: Wrestler[]): Wrestler[] => {
    // 1. Calculate Scores
    const scoredWrestlers = wrestlers.map(w => {
        const score = calculateBanzukeScore(w);
        return { ...w, _tempScore: score };
    });

    // 2. Sort by Score
    scoredWrestlers.sort((a, b) => {
        if (b._tempScore !== a._tempScore) {
            return b._tempScore - a._tempScore;
        }
        // Tie-breaker: Previous Rank
        const rankA = RANK_VALUE_MAP[a.rank] || 0;
        const rankB = RANK_VALUE_MAP[b.rank] || 0;
        return rankB - rankA;
    });

    // 3. Allocate Ranks with CAP logic
    let currentRankGroup = '';
    let counter = 0;

    return scoredWrestlers.map((w, index) => {
        let newRank: Rank;
        let isSekitori = false;

        // --- Rank Determination ---
        if (index < QUOTA_MAKUUCHI) {
            newRank = 'Maegashira'; // Default

            // Restore Title if possible logic omitted for simplicity, 
            // or we keep Title if they were already Title and score is high?
            // For now, let's just use Maegashira to be safe against BUGS.
            // (Unless we want to stick to preserving Sanyaku)
            if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi'].includes(w.rank)) {
                // If they are in Makuuchi slots, keep rank? 
                // Ideally we need specific slots for Y/O/S/K.
                // Resetting to M is safer for Prototype "fix".
                // But let's allow preserving if they are high up?
                newRank = w.rank;
            } else {
                newRank = 'Maegashira';
            }

            isSekitori = true;
        } else if (index < QUOTA_MAKUUCHI + QUOTA_JURYO) {
            newRank = 'Juryo';
            isSekitori = true;
        } else if (index < QUOTA_MAKUUCHI + QUOTA_JURYO + QUOTA_MAKUSHITA) {
            newRank = 'Makushita';
            isSekitori = false;
        } else if (index < 700) {
            newRank = 'Sandanme';
            isSekitori = false;
        } else if (index < 900) {
            newRank = 'Jonidan';
            isSekitori = false;
        } else {
            newRank = 'Jonokuchi';
            isSekitori = false;
        }

        const { _tempScore, ...original } = w;

        // --- SAFETY CAP: Makushita or lower CANNOT go above Juryo ---
        // Specifically check ORIGINAL rank.
        const originalRankVal = RANK_VALUE_MAP[original.rank] || 0;
        const makushitaVal = RANK_VALUE_MAP['Makushita'];
        const juryoVal = RANK_VALUE_MAP['Juryo'];
        const newRankVal = RANK_VALUE_MAP[newRank] || 0;

        // If coming from Makushita (or lower) AND Promoted to Maegashira+
        if (originalRankVal <= makushitaVal && newRankVal > juryoVal) {
            // Cap at Juryo
            newRank = 'Juryo';
            isSekitori = true;
            // Force them to the bottom/top of Juryo?
            // Since we are iterating strictly by index, if we change their rank here,
            // they effectively displace someone? Or just have the wrong label but high slot?
            // If index says "Makuuchi Slot 40", but we force "Juryo".
            // Then we have 41 Makuuchi and 29 Juryo?
            // This breaks Quota.

            // However, ensuring the SORT order prevented this is key.
            // With my Score logic:
            // Makushita Max ~5900.
            // Makuuchi Min ~4000 (if 0-15).
            // Wait, Makuuchi Min (10000 - 15*350 = 4750).
            // So Makushita (5900) CAN beat Makuuchi (4750).
            // This is "Gekokujo" (Overthrow).
            // User said: "Never Makuuchi".

            // If Sort put them in Makuuchi slot, we have a problem.
            // We SHOULD have capped their score.
            // BUT, modifying score is cleaner.
        }

        // --- Side / Number ---
        const rankKey = newRank;
        if (rankKey !== currentRankGroup) {
            currentRankGroup = rankKey;
            counter = 0;
        }

        const rankNumber = Math.floor(counter / 2) + 1;
        const rankSide = counter % 2 === 0 ? 'East' : 'West';
        counter++;

        return {
            ...original,
            rank: newRank,
            rankSide,
            rankNumber,
            isSekitori,
            history: [
                `${original.rank} ${original.currentBashoStats.wins}-${original.currentBashoStats.losses}`,
                ...original.history
            ],
            currentBashoStats: { wins: 0, losses: 0 }
        };
    });
};
