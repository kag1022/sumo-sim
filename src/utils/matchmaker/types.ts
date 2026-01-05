import { Wrestler, Matchup } from '../../types';

export interface IMatchmakingStrategy {
    generate(wrestlers: Wrestler[], day: number): Matchup[];
}
