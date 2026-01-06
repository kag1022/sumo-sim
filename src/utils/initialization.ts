import { Wrestler, Heya, Rank } from '../types';
import { generateHeyas, generateFullRoster, generateUniqueName } from './dummyGenerator';

export interface InitialSettings {
    oyakataName: string;
    stableName: string;
    shikonaPrefix: string;
    hometown: string;
    location?: string;
    specialty?: string;
}

// Helper to create a specific player wrestler (with unique name)
const createPlayerWrestler = (
    id: string,
    heyaId: string,
    prefix: string,
    rank: Rank,
    rankNumber: number,
    age: number,
    potential: number,
    currentStatAvg: number,
    usedNames: string[] // Registry to check/update
): Wrestler => {
    // Generate unique name using the shared registry
    const name = generateUniqueName(usedNames, prefix, true); // Force prefix
    usedNames.push(name); // Register immediately

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
    // Initialize usedNames registry
    const usedNames: string[] = [];

    // 1. Create CPU World
    const cpuHeyas = generateHeyas();
    const cpuWrestlers = generateFullRoster(cpuHeyas, usedNames);

    // 2. Create Player Heya
    const playerHeya: Heya = {
        id: 'player_heya',
        name: settings.stableName + (settings.stableName.endsWith('部屋') ? '' : '部屋'),
        shikonaPrefix: settings.shikonaPrefix,
        strengthMod: 1.0,
        facilityLevel: 1,
        wrestlerCount: 4
    };

    // 3. Create Player Wrestlers (Specific Specs) - Pass usedNames to each call
    const playerWrestlers = [
        createPlayerWrestler('1', 'player_heya', settings.shikonaPrefix, 'Maegashira', 10, 28, 80, 65, usedNames),
        createPlayerWrestler('2', 'player_heya', settings.shikonaPrefix, 'Makushita', 30, 24, 70, 45, usedNames),
        createPlayerWrestler('3', 'player_heya', settings.shikonaPrefix, 'Jonidan', 50, 20, 90, 25, usedNames),
        createPlayerWrestler('4', 'player_heya', settings.shikonaPrefix, 'Jonokuchi', 1, 15, 50, 15, usedNames)
    ];

    // Names already registered inside createPlayerWrestler, no need to push again

    // 4. Combine all wrestlers
    const allWrestlers = [...playerWrestlers, ...cpuWrestlers];

    // 5. Combine all heyas
    const allHeyas = [playerHeya, ...cpuHeyas];

    return {
        heyas: allHeyas,
        wrestlers: allWrestlers,
        initialFunds: 10000000, // 10M JPY Start
        usedNames: usedNames
    };
};
