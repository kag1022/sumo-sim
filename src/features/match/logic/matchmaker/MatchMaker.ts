
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

    public calculateWinChance(east: Wrestler, west: Wrestler): number {
        // Delegate to strategy based on East wrestler's division (usually same)
        const div = this.getDivision(east.rank);
        const strategy = this.strategies[div] || this.strategies['Makuuchi'];
        return strategy.calculateWinChance(east, west);
    }

    private getDivision(rank: string): string {
        if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
        return rank;
    }
}

export const matchMaker = new MatchMaker();
