import { Wrestler, Heya, Rank } from '../types';
import { generateHeyas, generateFullRoster } from './dummyGenerator';

export interface InitialSettings {
    oyakataName: string;
    stableName: string;
    shikonaPrefix: string;
    hometown: string;
}

// Helper to create a specific player wrestler
const createPlayerWrestler = (
    id: string,
    heyaId: string,
    prefix: string,
    rank: Rank,
    rankNumber: number,
    age: number,
    potential: number,
    currentStatAvg: number // Mind/Tech/Body average
): Wrestler => {
    // Generate name: Prefix + Random Suffix
    // We'll reuse a simple suffix list or logic here to avoid circular dependency if possible, 
    // or just defined locally.
    const suffixes = ['龍', '山', '海', '川', '里', '風', '花', '国', '王', '丸'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = prefix + suffix;

    const stats = {
        mind: currentStatAvg,
        technique: currentStatAvg,
        body: currentStatAvg
    };

    return {
        id: `player-${id}`,
        heyaId,
        name,
        rank,
        rankSide: 'East',
        rankNumber,
        stats,
        isSekitori: ['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira', 'Juryo'].includes(rank),
        injuryStatus: 'healthy',
        history: [],
        currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
        nextBoutDay: null,
        potential,
        flexibility: 50,
        weight: 120 + Math.floor(Math.random() * 30),
        height: 170 + Math.floor(Math.random() * 15),
        background: 'スカウト',
        age,
        maxRank: rank,
        historyMaxLength: 0,
        timeInHeya: 0,
        injuryDuration: 0,
        consecutiveLoseOrAbsent: 0,
        stress: 0
    };
};

export const initializeGameData = (settings: InitialSettings) => {
    // 1. Create CPU World
    const cpuHeyas = generateHeyas(45);
    const cpuWrestlers = generateFullRoster(cpuHeyas);

    // 2. Create Player Heya
    const playerHeya: Heya = {
        id: 'player_heya',
        name: settings.stableName + (settings.stableName.endsWith('部屋') ? '' : '部屋'),
        shikonaPrefix: settings.shikonaPrefix,
        strengthMod: 1.0,
        wrestlerCount: 4
    };

    // 3. Create Player Wrestlers (Specific Specs)
    const playerWrestlers: Wrestler[] = [];

    // 1. Veteran (Makushita 5, Age 28, Pot 60, Stat 55)
    playerWrestlers.push(createPlayerWrestler('vet', 'player_heya', settings.shikonaPrefix, 'Makushita', 5, 28, 60, 55));

    // 2. Regular (Sandanme 20, Age 24, Pot 70, Stat 40)
    playerWrestlers.push(createPlayerWrestler('reg', 'player_heya', settings.shikonaPrefix, 'Sandanme', 20, 24, 70, 40));

    // 3. Super Rookie (Jonokuchi 15, Age 18, Pot 95, Stat 20)
    playerWrestlers.push(createPlayerWrestler('rook', 'player_heya', settings.shikonaPrefix, 'Jonokuchi', 15, 18, 95, 20));

    // 4. Jobber (Jonidan 50, Age 22, Pot 45, Stat 30)
    playerWrestlers.push(createPlayerWrestler('job', 'player_heya', settings.shikonaPrefix, 'Jonidan', 50, 22, 45, 30));

    // Combine All
    const allHeyas = [playerHeya, ...cpuHeyas];
    const allWrestlers = [...playerWrestlers, ...cpuWrestlers];

    return {
        heyas: allHeyas,
        wrestlers: allWrestlers,
        initialFunds: 10000000 // 10M JPY Start
    };
};
