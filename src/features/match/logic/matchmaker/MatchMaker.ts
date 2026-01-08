
import { Wrestler } from '../../../../types';
import { IMatchmakingStrategy } from './types';
import { MakuuchiStrategy } from './MakuuchiStrategy';
import { StandardWinStrategy } from './StandardWinStrategy';

export class MatchMaker {
    private strategies: Record<string, IMatchmakingStrategy>;

    constructor() {
        // Initialize strategies with pure win logic
        const standard = new StandardWinStrategy();
        this.strategies = {
            'Makuuchi': new MakuuchiStrategy(),
            'Juryo': standard,
            'Makushita': standard,
            'Sandanme': standard,
            'Jonidan': standard,
            'Jonokuchi': standard,
            'MaeZumo': standard
        };
    }

    public calculateWinChance(east: Wrestler, west: Wrestler, tacticalBonus?: { east?: boolean, west?: boolean }): { winChance: number, eastTriggeredSkills: any[], westTriggeredSkills: any[] } {
        // Delegate to strategy based on East wrestler's division (usually same)
        const div = this.getDivision(east.rank);
        const strategy = this.strategies[div] || this.strategies['Makuuchi'];
        // Note: Strategies might need update to accept bonus, or we handle it here by modifying stats temporarily?
        // Changing strategy signature is better. But for now, let's wrap stats here if easier?
        // 'Wrestler' interface has stats. We can pass a derived object.

        let effectiveEast = east;
        let effectiveWest = west;

        if (tacticalBonus?.east) {
            effectiveEast = {
                ...east,
                stats: {
                    mind: east.stats.mind * 1.15,
                    technique: east.stats.technique * 1.15,
                    body: east.stats.body * 1.15
                }
            };
        }
        if (tacticalBonus?.west) {
            effectiveWest = {
                ...west,
                stats: {
                    mind: west.stats.mind * 1.15,
                    technique: west.stats.technique * 1.15,
                    body: west.stats.body * 1.15
                }
            };
        }

        return strategy.calculateWinChance(effectiveEast, effectiveWest);
    }

    private getDivision(rank: string): string {
        if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
        return rank;
    }
}

export const matchMaker = new MatchMaker();
