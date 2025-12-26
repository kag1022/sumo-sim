import { Rikishi, Rank, Side, RikishiStatus } from './types';

// Helper to create a fresh Rikishi
export function createRikishi(
  id: string,
  name: string,
  heyaId: string,
  rank: Rank,
  rankNumber: number,
  side: Side,
  stats: RikishiStatus,
  age: number
): Rikishi {
  return {
    id,
    name,
    heyaId,
    rank,
    rankNumber,
    side,
    stats,
    banzukePoint: 0, // Will be set by logic or estimation
    condition: 1.0,
    age,
    experience: 0,
    isKyujo: false,
    isKadoban: false,
    currentBasho: {
      wins: 0,
      losses: 0,
      absences: 0,
      history: []
    },
    career: {
      totalWins: 0,
      totalLosses: 0,
      totalAbsences: 0,
      highestRank: rank,
      bashoHistory: [],
      specialPrizes: { shukun: 0, kanto: 0, gino: 0 },
      kinboshi: 0,
      championships: 0
    }
  };
}

// Mock Data Generators

const HEYA_IDS = ['Isegahama', 'Kokonoe', 'Takasago', 'Sadogatake', 'Dewanoumi', 'Tokitsukaze', 'Nishonoseki'];
const POSSIBLE_NAMES = [
  'Terunofuji', 'Kirishima', 'Hoshoryu', 'Takakeisho', 'Kotonowaka', 
  'Daieisho', 'Wakamotoharu', 'Abi', 'Ura', 'Gonoyama', 
  'Atamifuji', 'Midorifuji', 'Shodai', 'Meisei', 'Asanoyama',
  'Tobizaru', 'Hiradoumi', 'Nishikigi', 'Ryuden', 'Shonannoumi',
  'Kinbozan', 'Hokutofuji', 'Oho', 'Onosato', 'Tamawashi',
  'Sadanoumi', 'Ichiyamamoto', 'Mitakeumi', 'Takanosho', 'Myogiryu',
  'Tsurugisho', 'Endo', 'Churanoumi', 'Shimazuumi', 'Roga',
  'Kotoshoho', 'Bushozan', 'Onosho', 'Takayasu', 'Nishikifuji', 'Kotoeko', 'Aoiyama'
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStat(base: number, variance: number): number {
  return Math.min(100, Math.max(1, base + randomInt(-variance, variance)));
}

// Generate 42 Makunouchi Rikishi
export function generateMockRikishi(): Rikishi[] {
  const rikishis: Rikishi[] = [];
  let nameIndex = 0;

  // Configuration for slots (Example: 1Y, 3O, 2S, 2K, rest M)
  const slots = [
    { rank: 'Yokozuna', count: 1, baseStat: 95 },
    { rank: 'Ozeki', count: 3, baseStat: 88 },
    { rank: 'Sekiwake', count: 2, baseStat: 82 },
    { rank: 'Komusubi', count: 2, baseStat: 78 }
  ];

  // Fill Sanyaku
  for (const slot of slots) {
    for (let i = 0; i < slot.count; i++) {
        const side: Side = i % 2 === 0 ? 'East' : 'West';
        // Rank number is 1 for Sanyaku usually, or ordering. 
        // For simplicity, Yokozuna/Ozeki don't use numbers visually but we can store 1.
        const rName = POSSIBLE_NAMES[nameIndex++] || `Unknown-${nameIndex}`;
        const heya = HEYA_IDS[randomInt(0, HEYA_IDS.length - 1)];
        const age = randomInt(22, 35);
        
        const r = createRikishi(
            `r-${nameIndex}`,
            rName,
            heya,
            slot.rank as Rank,
            1,
            side,
            {
                power: randomStat(slot.baseStat, 5),
                technique: randomStat(slot.baseStat, 5),
                mind: randomStat(slot.baseStat, 5)
            },
            age
        );
        // Rough BP estimation for initial sort
        r.banzukePoint = estimateInitialBP(slot.rank as Rank, 1);
        rikishis.push(r);
    }
  }

  // Fill Maegashira (Remaining to reach 42)
  const currentCount = rikishis.length;
  const maegashiraCount = 42 - currentCount;
  
  for (let i = 0; i < maegashiraCount; i++) {
      const rankNum = Math.floor(i / 2) + 1; // M1 East, M1 West, M2 East...
      const side: Side = i % 2 === 0 ? 'East' : 'West';
      const rName = POSSIBLE_NAMES[nameIndex++] || `Maegashira-${nameIndex}`;
      const heya = HEYA_IDS[randomInt(0, HEYA_IDS.length - 1)];
      const age = randomInt(20, 38);
      
      // Stats decrease as rank lowers
      const baseStat = 75 - (rankNum * 1.5); 

      const r = createRikishi(
          `r-${nameIndex}`,
          rName,
          heya,
          'Maegashira',
          rankNum,
          side,
          {
              power: randomStat(baseStat, 8),
              technique: randomStat(baseStat, 8),
              mind: randomStat(baseStat, 8)
          },
          age
      );
      r.banzukePoint = estimateInitialBP('Maegashira', rankNum);
      rikishis.push(r);
  }

  return rikishis;
}

function estimateInitialBP(rank: Rank, rankNumber: number): number {
    // Base BP Table
    // Yokozuna: 1000
    // Ozeki: 800
    // Sekiwake: 600
    // Komusubi: 500
    // Maegashira 1: 400 ... -10 per rank
    switch (rank) {
        case 'Yokozuna': return 1000;
        case 'Ozeki': return 800;
        case 'Sekiwake': return 600;
        case 'Komusubi': return 500;
        case 'Maegashira': return 400 - (rankNumber * 10);
        case 'Juryo': return 100;
        default: return 0;
    }
}

export function applyGrowthAndDecay(rikishi: Rikishi) {
    const { age, currentBasho } = rikishi;
    const isWinner = currentBasho.wins >= 8;

    // Growth for Youngsters (Age < 25)
    if (age < 25) {
        // High XP gain
        let xpGain = 10;
        if (isWinner) xpGain += 20;
        if (currentBasho.wins >= 10) xpGain += 30; // Bonus for double digits
        
        rikishi.experience += xpGain;

        // Level Up check (Simulated)
        if (rikishi.experience >= 100) {
            rikishi.experience -= 100;
            // Boost a random stat
            const roll = Math.random();
            if (roll < 0.33) rikishi.stats.power = Math.min(100, rikishi.stats.power + 2);
            else if (roll < 0.66) rikishi.stats.technique = Math.min(100, rikishi.stats.technique + 2);
            else rikishi.stats.mind = Math.min(100, rikishi.stats.mind + 2);
        }
    }

    // Decay for Veterans (Age >= 33)
    if (age >= 33) {
        // Chance to decay based on age
        const decayChance = (age - 30) * 0.1; // 33->0.3, 40->1.0
        if (Math.random() < decayChance) {
            // Body declines first
            rikishi.stats.power = Math.max(10, rikishi.stats.power - 1);
            if (age >= 35) rikishi.stats.technique = Math.max(10, rikishi.stats.technique - 1); // Skills fade slower
        }
    }
}
