import { Rikishi, Rank } from './types';

/**
 * Calculates updated Banzuke Points based on Basho performance.
 * Formula: NewBP = OldBP + (KachiKoshi * Factor)
 */
export function calculateBanzukePoints(rikishi: Rikishi) {
  const { wins } = rikishi.currentBasho;
  // Absences count as losses for BP calculation usually in simulation
  // const effectiveLosses = losses + absences; 
  // Wait, types.ts says losses includes absences? No, "losses" and "absences" are separate in basho output usually.
  // In basho.ts updateDailyStats: if Absent, losses++ and absences++. 
  // So 'losses' already contains absences.
  
  // const score = wins - effectiveLosses; // Net wins (e.g. 8-7 = +1)
  // Actually, Kachi-koshi margin is Wins - 7.5? Or just Wins - 8 for Kachi-koshi.
  // Standard approximation:
  // Kachi-koshi (8 wins): Promoted.
  // Make-koshi (7 wins): Demoted.
  
  // Weights by Rank (Higher ranks are volatile or sticky?)
  // In this system, we use BP to SORT.
  // So we need to translate Wins directly to BP delta.
  
  let factor = 15; // Base volatility
  
  if (rikishi.rank === 'Maegashira') {
      factor = 20; // Maegashira moves fast
  } else if (['Sekiwake', 'Komusubi'].includes(rikishi.rank)) {
      factor = 25; // Sanyaku moves very fast to open spots
  } else if (rikishi.rank === 'Ozeki') {
      factor = 0; // Ozeki BP is static-ish, they rely on Protection logic. 
      // But for sorting among Ozekis, we might want some movement.
      factor = 10;
  } else if (rikishi.rank === 'Yokozuna') {
      factor = 5; // Yokozuna rarely moves relative to others unless retirement
  }

  // Bonus logic: 
  // 10+ wins = Extra Bonus
  // 12+ or Yusho = Massive Bonus
  let bonus = 0;
  if (wins >= 10) bonus += 10;
  if (wins >= 12) bonus += 20;
  if (wins === 15) bonus += 50;
  
  // Calculate Delta
  const delta = (wins - 7.5) * factor + bonus; 
  // Result:
  // 8-7 = 0.5 * 20 + 0 = +10
  // 7-8 = -0.5 * 20 = -10
  
  rikishi.banzukePoint += delta;
}

/**
 * Re-assigns ranks to all rikishi based on BP and Special Rules.
 */
export function assignRanks(rikishis: Rikishi[]) {
    // 1. Calculate new BP for everyone
    rikishis.forEach(calculateBanzukePoints);

    // 2. Sort by BP descending
    // Note: We need to respect Ozeki/Yokozuna protection logic separately?
    // Actually, normally we sort everyone, THEN fill slots.
    // BUT Ozeki/Yokozuna are special. They DON'T fall just because someone passed their BP.
    // They only fall if they meet Demotion Criteria.
    
    // Strategy:
    // Separate into specific pools.
    const yokozuna = rikishis.filter(r => r.rank === 'Yokozuna');
    const ozeki = rikishis.filter(r => r.rank === 'Ozeki');
    const others = rikishis.filter(r => !['Yokozuna', 'Ozeki'].includes(r.rank));
    
    // Handle Yokozuna Demotion (Retirement recommended, but here we just keep them)
    // Yokozuna Logic: They stay Yokozuna unless retired.
    // For this simulation, we keep them at top regardless of BP (unless we implement Recommendation to Retire).
    
    // Handle Ozeki Demotion / Kadoban
    const remainingOzeki: Rikishi[] = [];
    const demotedOzeki: Rikishi[] = [];
    
    ozeki.forEach(r => {
        const wins = r.currentBasho.wins;
        if (r.isKadoban && wins < 8) {
             // DEMOTION
             demotedOzeki.push(r);
             r.isKadoban = false; // Reset flag (now Sekiwake with special return rights handled manually? 
             // Or we track "was Ozeki" for next basho logic specifically. Simplified here.)
        } else {
            // Keep Ozeki
            remainingOzeki.push(r);
            if (wins < 8) {
                r.isKadoban = true;
            } else {
                r.isKadoban = false;
            }
        }
    });

    // Handle Ozeki Promotion (from Others)
    // Criteria: Sekiwake with 33+ wins over 3 basho? 
    // Simplified: Sekiwake who won 12+ this basho AND has high BP?
    // Let's use strict BP threshold or "Wins >= 12 and Rank=Sekiwake" for game fun.
    // We'll scan `others` later after sorting.

    // 3. Main Sorting of Challengers
    // Add demoted Ozeki to others pool
    others.push(...demotedOzeki);
    
    // Sort others by BP
    others.sort((a, b) => b.banzukePoint - a.banzukePoint);

    // 4. Fill Slots
    const newRankings: Rikishi[] = [];
    
    // 4a. Yokozuna (Fixed)
    // Sort Yokozuna by BP among themselves
    yokozuna.sort((a, b) => b.banzukePoint - a.banzukePoint);
    newRankings.push(...yokozuna);
    
    // 4b. Ozeki (Fixed + Promotions)
    // Check top of 'others' for Ozeki Promotion
    // Rule: Sekiwake + (high wins approx).
    // Let's say if Sekiwake (previously) AND wins >= 12 -> Promote.
  // Check for Ozeki promotion candidates
  // const promotedToOzeki: Rikishi[] = []; (Unused)
    // We need to know PREVIOUS rank. It is in r.rank currently (before we update).
    
    // Filter out candidates from 'others' who deserve Ozeki
    // Iterate carefully since we are modifying the list we draw from?
    // Just pick top ones.
    
    // Add existing Ozekis first
    remainingOzeki.sort((a, b) => b.banzukePoint - a.banzukePoint);
    const finalOzekiList = [...remainingOzeki];

    // Check promotions
    // We can't easily check "Last 3 basho wins". 
    // We'll use "13+ Wins" this basho as instant promotion for excitement.
    for (let i = 0; i < others.length; i++) {
        const cand = others[i];
        if (['Sekiwake'].includes(cand.rank) && cand.currentBasho.wins >= 12) {
             // Promotable!
             finalOzekiList.push(cand);
             // Remove from others
             others.splice(i, 1);
             i--;
             // Bonus BP for promotion
             cand.banzukePoint += 100;
        }
    }
    
    newRankings.push(...finalOzekiList);

    // 4c. Sekiwake (Target 2, max dynamic)
    const sekiwakeCount = 2;
    for (let i = 0; i < sekiwakeCount; i++) {
        if (others.length > 0) {
            newRankings.push(others.shift()!);
        }
    }
    // "Sekiwake 3" if someone has really high wins (e.g. 11+)?
    // Optional. Sticking to 2 for strictness.

    // 4d. Komusubi (Target 2)
    const komusubiCount = 2;
    for (let i = 0; i < komusubiCount; i++) {
        if (others.length > 0) {
             newRankings.push(others.shift()!);
        }
    }

    // 4e. Maegashira (Rest)
    newRankings.push(...others);

    // 5. Apply Rank Strings and Numbers
    const countByRank: Record<string, number> = { Yokozuna: 0, Ozeki: 0, Sekiwake: 0, Komusubi: 0, Maegashira: 0 };
    
    newRankings.forEach((r, index) => {
       // Determine Rank Name based on position in list is tricky because we merged groups.
       // We need to know WHICH group they fell into.
       // We can rely on the order: Y -> O -> S -> K -> M
       
       // Identification:
       let newRank: Rank = 'Maegashira';
       if (yokozuna.includes(r)) newRank = 'Yokozuna';
       else if (finalOzekiList.includes(r)) newRank = 'Ozeki';
       // Getting S/K from the spliced list is harder since we shifted them out of 'others'.
       // We can detect by index in newRankings vs known counts?
       else {
           // They came from 'others'.
           // The first 'sekiwakeCount' of 'others' became Sekiwake.
           // The next 'komusubiCount' became Komusubi.
           // The rest are Maegashira.
           // We need to calculate their offset in the non-Y/O portion.
           const nonYOIndex = index - (yokozuna.length + finalOzekiList.length);
           if (nonYOIndex < sekiwakeCount) newRank = 'Sekiwake';
           else if (nonYOIndex < sekiwakeCount + komusubiCount) newRank = 'Komusubi';
           else newRank = 'Maegashira';
       }

       r.rank = newRank;
       countByRank[newRank]++;
       
       // Assign Side
       r.side = (countByRank[newRank] % 2 === 1) ? 'East' : 'West';
       
       // Assign Number
       // Y/O/S/K usually don't have "numbers" visible like "Sekiwake 1", but internally 1 is fine.
       // Maegashira needs correct number.
       if (newRank === 'Maegashira') {
           r.rankNumber = Math.ceil(countByRank[newRank] / 2);
       } else {
           r.rankNumber = Math.ceil(countByRank[newRank] / 2);
       }
    });

    // Re-assign the input array to match new order (in place or update reference?)
    // TypeScript references: updating the objects is enough, but order in array matters for SimulationRunner display.
    // We should overwrite the array contents or return a new array.
    // The caller passes `rikishis[]`. We can splice it.
    rikishis.length = 0;
    rikishis.push(...newRankings);
}

/**
 * Awards Sansho based on performance.
 */
export function awardSpecialPrizes(rikishis: Rikishi[]) {
    rikishis.forEach(r => {
        if (r.rank === 'Yokozuna' || r.rank === 'Ozeki' || r.isKyujo) return; // Only Maegashira/San'yaku get Sansho? (Actually Sanyaku can get it)
        
        // Define criteria
        const wins = r.currentBasho.wins;
        if (wins < 8) return; // Must be Kachi-koshi

        const prizes: string[] = [];

        // 1. Shukun-sho (Outstanding Performance)
        // Usually for beating Yokozuna/Ozeki or winning the Yusho.
        // We track "Kinboshi" separately, but let's assume if wins >= 11 and defeated high rankers (we don't track opponents easily here).
        // Simplified: Wins >= 12
        if (wins >= 12) {
            prizes.push('Shukun-sho');
            r.career.specialPrizes.shukun++;
        }

        // 2. Kanto-sho (Fighting Spirit)
        // 10+ wins usually.
        if (wins >= 10 && !prizes.includes('Shukun-sho')) { // Usually can get both?
            prizes.push('Kanto-sho');
            r.career.specialPrizes.kanto++;
        }

        // 3. Gino-sho (Technique)
        // High Technique stat base check + Kachi-koshi
        if (r.stats.technique > 85 && wins >= 9) {
             prizes.push('Gino-sho');
             r.career.specialPrizes.gino++;
        }
        
        if (prizes.length > 0) {
            // Log or store in history if we had a detailed history entry this turn.
            // For now, simple console log inside runner or updating career counts is done.
        }
    });
}
