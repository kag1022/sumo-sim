import { Rikishi, MatchResult } from './types';

// Weights for the scoring formula
const WEIGHTS = {
  power: 0.4,
  technique: 0.3,
  mind: 0.3
};

// Common Kimarite list (Legacy)
// const KIMARITE_LIST = ...

// function getRandomKimarite(): string {
//   const index = Math.floor(Math.random() * KIMARITE_LIST.length);
//   return KIMARITE_LIST[index];
// }

/**
 * Calculates the winning score for a rikishi against an opponent.
 * Formula: (Status * Weights) * Condition * RandomFactor
 */
function calculateScore(rikishi: Rikishi, _opponent: Rikishi): number {
  // Base Ability Score
  const abilityScore = 
    (rikishi.stats.power * WEIGHTS.power) +
    (rikishi.stats.technique * WEIGHTS.technique) +
    (rikishi.stats.mind * WEIGHTS.mind);

  // Condition Multiplier (e.g. 0.9 - 1.2)
  // We use the stored condition.
  const conditionMult = rikishi.condition;

  // Random Factor (e.g. 0.85 - 1.15) to simulate luck/uncertainty
  // "Not just random", but variation is essential.
  const randomFactor = 0.85 + (Math.random() * 0.3);

  return abilityScore * conditionMult * randomFactor;
}

export function calculateMatchOutcome(east: Rikishi, west: Rikishi): MatchResult {
    // 1. Check for Kyujo (Injury) - Handled before this usually, but good to safeguard
    // If one is absent, the other wins by Fusen.
    // However, the caller should usually handle Fusen before calling this logic, 
    // or we can handle it here if we pass flags. 
    // For now, assuming both are present.

    const scoreEast = calculateScore(east, west);
    const scoreWest = calculateScore(west, east);

    let winner: Rikishi;
    let loser: Rikishi;

    if (scoreEast > scoreWest) {
        winner = east;
        loser = west;
    } else {
        winner = west;
        loser = east;
    }

    // Decide Kimarite based on winner's stats
    const kimarite = decideKimarite(winner);

    // Condition updates for next day (simple fluctuation)
    // Winner might gain momentum, loser might lose confidence?
    // Or just random daily fluctuation.
    const winnerNewCond = Math.max(0.8, Math.min(1.2, winner.condition + (Math.random() * 0.05 - 0.02)));
    const loserNewCond = Math.max(0.8, Math.min(1.2, loser.condition + (Math.random() * 0.05 - 0.03)));

    return {
        winnerId: winner.id,
        loserId: loser.id,
        kimarite,
        winnerPostMatchCondition: winnerNewCond,
        loserPostMatchCondition: loserNewCond
    };
}

function decideKimarite(winner: Rikishi): string {
  const { power, technique } = winner.stats;
  const isPowerType = power > technique;
  
  const powerKimarite = ['Yorikiri', 'Oshidashi', 'Tsukidashi', 'Yoritaoshi', 'Abisetaoshi'];
  const techKimarite = ['Uwatenage', 'Shitatenage', 'Hatakikomi', 'Tsukiotoshi', 'Okuridashi', 'Kotengunage', 'Sukuinage'];
  
  // Chance to use preferred style
  const usePreferred = Math.random() < 0.7; // 70% chance to use main style
  
  let list = isPowerType ? powerKimarite : techKimarite;
  
  if (!usePreferred) {
      list = isPowerType ? techKimarite : powerKimarite;
  }
  
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
