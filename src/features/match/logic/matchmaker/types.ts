import { Wrestler, SkillType } from '../../../../types';

export interface CalculationResult {
    winChance: number;
    eastTriggeredSkills: SkillType[];
    westTriggeredSkills: SkillType[];
}

export interface IMatchmakingStrategy {
    calculateWinChance(east: Wrestler, west: Wrestler): CalculationResult;
}
