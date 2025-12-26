import { Rikishi, BashoOutcome, MatchResult } from './types';
import { makeMatches } from './torikumi';
import { calculateMatchOutcome } from './match';

export interface MatchLogEntry {
    eastName: string;
    westName: string;
    eastRank: string;
    westRank: string;
    result: MatchResult | 'Fusensho';
    winnerName: string;
    kimarite: string; // Added Kimarite for UI
}

export interface DailyLog {
    day: number;
    matches: MatchLogEntry[];
}

export function simulateBasho(rikishis: Rikishi[]): DailyLog[] {
    const logs: DailyLog[] = [];
    for (let day = 1; day <= 15; day++) {
        logs.push(simulateDay(day, rikishis));
    }
    return logs;
}

export function simulateDay(day: number, rikishis: Rikishi[]): DailyLog {
    // 1. Kyujo Check (Random Injury)
    rikishis.forEach(r => {
        if (!r.isKyujo) {
            // Ultra low chance of injury per day (0.3%)
            if (Math.random() < 0.003) {
                r.isKyujo = true;
            }
        }
    });

    // 2. Make Matches
    const matches = makeMatches(day, rikishis);
    
    const dailyLog: DailyLog = { day, matches: [] };

    // 3. Resolve Matches
    for (const match of matches) {
        const { east, west } = match;
        
        let result: MatchResult | 'Fusensho';
        let winnerId: string;
        let loserId: string;
        let kimarite = '';

        // Handle Kyujo (Fusensho)
        if (east.isKyujo && west.isKyujo) {
            continue; 
        } else if (east.isKyujo) {
            winnerId = west.id;
            loserId = east.id;
            result = 'Fusensho';
            kimarite = '不戦勝';
            updateDailyStats(west, 'Win');
            updateDailyStats(east, 'Absent');
        } else if (west.isKyujo) {
            winnerId = east.id;
            loserId = west.id;
            result = 'Fusensho';
            kimarite = '不戦勝';
            updateDailyStats(east, 'Win');
            updateDailyStats(west, 'Absent');
        } else {
            // Fight!
            const outcome = calculateMatchOutcome(east, west);
            result = outcome;
            winnerId = outcome.winnerId;
            loserId = outcome.loserId;
            kimarite = outcome.kimarite;

            // Update Stats
            const w = (winnerId === east.id) ? east : west;
            const l = (loserId === east.id) ? east : west;
            
            updateDailyStats(w, 'Win');
            updateDailyStats(l, 'Loss');

            // Update Conditions
            w.condition = outcome.winnerPostMatchCondition;
            l.condition = outcome.loserPostMatchCondition;
        }

        // Log
        dailyLog.matches.push({
            eastName: east.name,
            westName: west.name,
            eastRank: `${east.rank}`,
            westRank: `${west.rank}`,
            result: result,
            winnerName: (winnerId === east.id) ? east.name : west.name,
            kimarite: kimarite
        });
    }
    
    return dailyLog;
}

function updateDailyStats(r: Rikishi, outcome: BashoOutcome) {
    r.currentBasho.history.push(outcome);
    if (outcome === 'Win') r.currentBasho.wins++;
    if (outcome === 'Loss') r.currentBasho.losses++;
    if (outcome === 'Absent') {
        r.currentBasho.losses++;
        r.currentBasho.absences++;
    }
}

