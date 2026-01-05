import { Wrestler, Matchup, Rank } from '../../types';
import { MakuuchiStrategy } from './MakuuchiStrategy';
import { JuryoStrategy } from './JuryoStrategy';
import { MakushitaStrategy } from './MakushitaStrategy';

class MatchMaker {
    private strategies: Record<string, any>;

    constructor() {
        this.strategies = {
            'Makuuchi': new MakuuchiStrategy(),
            'Juryo': new JuryoStrategy(),
            'Makushita': new MakushitaStrategy('Makushita'),
            'Sandanme': new MakushitaStrategy('Sandanme'),
            'Jonidan': new MakushitaStrategy('Jonidan'),
            'Jonokuchi': new MakushitaStrategy('Jonokuchi')
        };
    }

    public generateMatchups(wrestlers: Wrestler[], day: number): Matchup[] {
        // Filter eligible wrestlers
        const validWrestlers = wrestlers.filter(w =>
            w.rank !== 'MaeZumo' && w.injuryStatus !== 'injured'
        );

        // Group by Division
        const byDivision: Record<string, Wrestler[]> = {
            'Makuuchi': [],
            'Juryo': [],
            'Makushita': [],
            'Sandanme': [],
            'Jonidan': [],
            'Jonokuchi': []
        };

        validWrestlers.forEach(w => {
            const div = this.getDivision(w.rank);
            if (byDivision[div]) {
                byDivision[div].push(w);
            }
        });

        let allMatchups: Matchup[] = [];

        // Generate for each division
        for (const [div, list] of Object.entries(byDivision)) {
            const strategy = this.strategies[div];
            if (strategy) {
                const divisionMatchups = strategy.generate(list, day);
                allMatchups = [...allMatchups, ...divisionMatchups];
            }
        }

        return allMatchups;
    }

    private getDivision(rank: Rank): string {
        if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
        return rank;
    }
}

export const matchMaker = new MatchMaker();
