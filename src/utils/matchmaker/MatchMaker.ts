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

    // ... (previous code)

    public calculateWinChance(east: Wrestler, west: Wrestler): number {
        const getScore = (w: Wrestler) => (w.stats.body + w.stats.technique + w.stats.mind) / 3;

        const scoreA = getScore(east);
        const scoreB = getScore(west);

        // Base Probability
        // If A=100, B=100 -> 0.5
        // If A=150, B=100 -> A is 50% stronger? 
        // Simple ratio: A / (A + B)
        // Or difference based? 
        // User said: "Current: (Heart+Tech+Body)/3 ... Random width is large"
        // Let's stick to A / (A+B) as base, but modify it.

        const total = scoreA + scoreB;
        if (total === 0) return 0.5;

        let chanceA = scoreA / total;

        // Rank Bonus (Intimidation)
        // RankDiff = Value(A) - Value(B)
        // Yokozuna (1000) vs Maegashira 1 (100) -> Diff 900?
        const valA = this.getRankValue(east.rank);
        const valB = this.getRankValue(west.rank);
        const diff = valA - valB;

        // User: "RankDiff * 2%" (Max 20%)
        // If values are 100-scale:
        // Yokozuna vs Ozeki (1000 vs 400? Need to check map).
        // Let's normalize Diff.
        // Assuming specific Scale.

        // Let's check RANK_VALUE_MAP values in memory effectively:
        // Y: 1500, O: 1000, S: 500, K: 300, M1: 170...
        // Let's just use a reasonable scaling factor.
        // 2% per "Rank Step"?
        // Let's assume Diff > 0 means A is higher.

        // Apply Bonus
        // Arbitrary scale: 100 points of Rank Value = 2%?
        const rankBonus = (diff / 100) * 0.02;
        // Clamp to +/- 20%
        const clampedBonus = Math.max(-0.2, Math.min(0.2, rankBonus));

        chanceA += clampedBonus;

        // Yokozuna Special Bonus vs Non-Yokozuna/Ozeki (Flattening the weak)
        // "Yokozuna vs Flat/Lower -> Fixed +15%"
        if (east.rank === 'Yokozuna' && !['Yokozuna', 'Ozeki'].includes(west.rank)) {
            chanceA += 0.15;
        }
        if (west.rank === 'Yokozuna' && !['Yokozuna', 'Ozeki'].includes(east.rank)) {
            chanceA -= 0.15;
        }

        // Reduce Variance for High Skill Gap
        // If Chance > 70%, boost it further?
        // User: "Reduce random width... Giant Killing 5-10%"
        // If chance is 80%, makes it 90%?
        // Sigmoid-like curve?
        // Simple approach: shift towards 0 or 1.
        if (chanceA > 0.6) chanceA += 0.05;
        if (chanceA < 0.4) chanceA -= 0.05;

        return Math.max(0.05, Math.min(0.95, chanceA));
    }

    private getRankValue(rank: Rank): number {
        // Simple internal map or import
        // If imported RANK_VALUE_MAP works, fine.
        const map: Record<string, number> = {
            'Yokozuna': 1000,
            'Ozeki': 500,
            'Sekiwake': 300,
            'Komusubi': 200,
            'Maegashira': 100,
            'Juryo': 50,
            'Makushita': 30,
            'Sandanme': 20,
            'Jonidan': 10,
            'Jonokuchi': 5,
            'MaeZumo': 0
        };
        return map[rank] || 0;
    }

    private getDivision(rank: Rank): string {

        if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
        return rank;
    }
}

export const matchMaker = new MatchMaker();
