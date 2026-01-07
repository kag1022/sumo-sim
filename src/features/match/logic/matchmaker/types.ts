
import { Wrestler } from '../../../../types';

export interface IMatchmakingStrategy {
    calculateWinChance(east: Wrestler, west: Wrestler): number;
}
