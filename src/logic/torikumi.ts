import { Rikishi } from './types';

interface MatchPair {
  east: Rikishi;
  west: Rikishi;
}

/**
 * Main function to generate matches for a specific day.
 */
export function makeMatches(day: number, rikishis: Rikishi[]): MatchPair[] {
  // Sort rikishis based on criteria for the day
  // Days 1-12: Mostly by Rank
  // Days 13-15: "Wari" - By Number of Wins (Top contenders face each other)
  
  const sortedRikishis = [...rikishis];
  
  if (day >= 13) {
      // Sort primarily by Wins (descending), then by Rank
      sortedRikishis.sort((a, b) => {
          if (b.currentBasho.wins !== a.currentBasho.wins) {
              return b.currentBasho.wins - a.currentBasho.wins;
          }
          // Secondary sort by Rank (just reusing the array order if it was already sorted by rank, 
          // but better to be explicit if we have a rank value helper. 
          // For now assuming input 'rikishis' is roughly rank-ordered or we don't care strictly for secondary.)
          return 0; 
      });
  } else {
      // Sort by Rank (Order in array is usually Rank based 1Y -> M16)
      // We assume the input 'rikishis' comes in Banzuke order. 
      // If not, we should sort.
      // For now, trusting the caller passes them in Rank order.
  }

  // const matches: MatchPair[] = [];
  // const assigned = new Set<string>();

  // Simple recursive backtracking or iterative retry approach for Deadlock prevention
  // Since N=42 is small, we can try a greedy approach with limited backtracking or shuffle.
  // Here we implement a "lookahead" or "retry" simple approach.

  // We will try to match from top to bottom.
  
  // NOTE: In real sumo, it's East vs West often, but basically nearby ranks.
  
  // const pool = sortedRikishis.filter(r => !r.isKyujo && !r.career.totalAbsences); 
  // Wait, Kyujo rikishi still need "matches" generated so they can default to Fusen?
  // User Requirement: "If opponent is Kyujo, record Fusensho".
  // This implies Kyujo rikishi are IN the matching pool, but the result is automatic.
  // So we include everyone.
  
  const activePool = [...sortedRikishis];

  const pairs = attemptPairing(activePool, day);
  
  if (!pairs) {
      // Fallback: If strict stable avoidance failed, maybe relax rules or shuffle?
      // For this simulation, we'll try a shuffled rank sort or just simple adjacent force 
      // if it fails (rare with 42 rikishi unless stable distribution is skewed).
      console.warn(`Day ${day}: Strict pairing failed. Retrying with relaxed rules...`);
      return attemptPairing(activePool, day, true) || [];
  }

  return pairs;
}

/**
 * Try to pair up the pool. Returns null if deadlock.
 */
function attemptPairing(pool: Rikishi[], _day: number, relaxRules: boolean = false): MatchPair[] | null {
    const matches: MatchPair[] = [];
    const used = new Set<string>();

    for (let i = 0; i < pool.length; i++) {
        const r1 = pool[i];
        if (used.has(r1.id)) continue;

        let bestOpponent: Rikishi | null = null;
        
        // Search for nearest available opponent
        for (let j = i + 1; j < pool.length; j++) {
            const r2 = pool[j];
            if (used.has(r2.id)) continue;

            // Check Stable Constraint
            if (!relaxRules && r1.heyaId === r2.heyaId) {
                // Same stable, skip
                continue;
            }
            
            // Check if they already fought this basho?
            // Real sumo tries to avoid rematches.
            // We need to check history.
            // Simplification: We don't have "who fought who" history in Rikishi object easily specifically for this basho 
            // without parsing history logs. 
            // For MVP, we skip this check or assume simulated randomness avoids it enough. 
            // (Adding strictly: we need a record of opponents in currentBasho)
            
            // Assuming we take the first valid one (greedy) because list is sorted by Rank/Score.
            bestOpponent = r2;
            break;
        }

        if (bestOpponent) {
            used.add(r1.id);
            used.add(bestOpponent.id);
            matches.push({ east: r1, west: bestOpponent });
        } else {
            // Deadlock: r1 has no valid opponent left (all remaining are same stable?)
            return null; 
        }
    }
    return matches;
}
