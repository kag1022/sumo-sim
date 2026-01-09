import { Wrestler, Heya, Rank, GameMode } from '../../../types';
import { generateHeyas, generateFullRoster } from '../../wrestler/logic/generator';
import { ShikonaGenerator } from '../../wrestler/logic/ShikonaGenerator';

const shikonaGen = new ShikonaGenerator();

export interface InitialSettings {
    oyakataName: string;
    stableName: string;
    shikonaPrefix: string;
    shikonaPrefixReading: string; // Added reading
    hometown: string;
    location?: string;
    specialty?: string;
    mode: GameMode;
}

// Helper to create a specific player wrestler (with unique name)
const createPlayerWrestler = (
    id: string,
    heyaId: string,
    prefix: string,
    prefixReading: string, // Accept Reading
    origin: string,
    rank: Rank,
    rankNumber: number,
    age: number,
    potential: number,
    currentStatAvg: number,
    usedNames: string[] // Registry to check/update
): Wrestler => {
    // Generate unique name using the generator
    const shikona = shikonaGen.generate({
        heyaPrefix: { char: prefix, read: prefixReading }, // Use actual reading
        origin: origin
    });

    // Retry if conflicting
    let attempts = 0;
    while (usedNames.includes(shikona.kanji) && attempts < 20) {
        // Force regenerate to try get new combination
        const nextShikona = shikonaGen.generate({
            heyaPrefix: { char: prefix, read: prefixReading },
            origin: origin
        });
        if (nextShikona.kanji !== shikona.kanji) {
            Object.assign(shikona, nextShikona); // Hacky update
        }
        attempts++;
    }
    if (usedNames.includes(shikona.kanji)) {
        shikona.kanji += '継';
    }

    usedNames.push(shikona.kanji);

    const stats = {
        mind: currentStatAvg,
        technique: currentStatAvg,
        body: currentStatAvg
    };

    return {
        id: `player-${id}`,
        heyaId,
        name: shikona.kanji,
        reading: shikona.reading,
        origin: origin,
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
        stress: 0,
        skills: [],
        retirementStatus: 'None'
    };
};

export const initializeGameData = (settings: InitialSettings) => {
    // Initialize usedNames registry
    const usedNames: string[] = [];

    // 1. Create CPU World
    const cpuHeyas = generateHeyas();
    const cpuWrestlers = generateFullRoster(cpuHeyas, usedNames);

    // 2. Create Player Heya
    // Determine player roster based on Mode
    let playerWrestlers: Wrestler[] = [];
    let initialFunds = 10000000;

    if (settings.mode === 'Establish') {
        // A. Establish Mode (Hard / Start-up)
        // Funds: 3M
        // Roster: 1 Rookie (High Potential)
        initialFunds = 3000000;

        // High potential rookie (MaeZumo or Jonokuchi)
        const rookie = createPlayerWrestler(
            '1', 'player_heya', settings.shikonaPrefix, settings.shikonaPrefixReading, settings.hometown,
            'Jonokuchi', 30, // Rank
            18, 90, 40, // Age, Potential, Stats
            usedNames
        );
        playerWrestlers = [rookie];

    } else {
        // B. Inherit Mode (Normal / Legacy)
        // Funds: 15M
        // Roster: ~6 Wrestlers (Mixed)
        initialFunds = 15000000;

        playerWrestlers = [
            // 1. Head (Makushita)
            createPlayerWrestler('1', 'player_heya', settings.shikonaPrefix, settings.shikonaPrefixReading, settings.hometown, 'Makushita', 10, 26, 75, 60, usedNames),
            // 2. Sandanme
            createPlayerWrestler('2', 'player_heya', settings.shikonaPrefix, settings.shikonaPrefixReading, settings.hometown, 'Sandanme', 20, 24, 70, 45, usedNames),
            createPlayerWrestler('3', 'player_heya', settings.shikonaPrefix, settings.shikonaPrefixReading, settings.hometown, 'Sandanme', 80, 22, 80, 40, usedNames),
            // 3. Jonidan
            createPlayerWrestler('4', 'player_heya', settings.shikonaPrefix, settings.shikonaPrefixReading, settings.hometown, 'Jonidan', 15, 20, 60, 30, usedNames),
            createPlayerWrestler('5', 'player_heya', settings.shikonaPrefix, settings.shikonaPrefixReading, settings.hometown, 'Jonidan', 85, 19, 70, 25, usedNames),
            // 4. Jonokuchi
            createPlayerWrestler('6', 'player_heya', settings.shikonaPrefix, settings.shikonaPrefixReading, settings.hometown, 'Jonokuchi', 10, 18, 50, 20, usedNames),
        ];
    }

    // Create Player Heya Struct
    const playerHeya: Heya = {
        id: 'player_heya',
        name: settings.stableName + (settings.stableName.endsWith('部屋') ? '' : '部屋'),
        nameEn: settings.stableName, // Todo: Add English input in start screen
        shikonaPrefix: settings.shikonaPrefix,
        shikonaPrefixReading: settings.shikonaPrefixReading,
        strengthMod: 1.0,
        facilityLevel: 1,
        wrestlerCount: playerWrestlers.length
    };

    // 4. Combine all wrestlers
    const allWrestlers = [...playerWrestlers, ...cpuWrestlers];

    // 5. Combine all heyas
    const allHeyas = [playerHeya, ...cpuHeyas];

    return {
        heyas: allHeyas,
        wrestlers: allWrestlers,
        initialFunds: initialFunds,
        usedNames: usedNames
    };
};
