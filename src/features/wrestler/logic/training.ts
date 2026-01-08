import { Wrestler, SkillType } from '../../../types';
import { ALL_SKILLS, MAX_SKILLS } from './skills';

type TrainingResult = {
    updatedWrestler: Wrestler;
    diffBody: number;
    diffTech: number;
    diffMind: number;
    learnedSkill?: SkillType;
};

export const calculateSpecialTrainingResult = (wrestler: Wrestler, menuType: string): TrainingResult => {
    let diffBody = 0, diffTech = 0, diffMind = 0;
    let stressGain = 0;
    let learnedSkill: SkillType | undefined;

    switch (menuType) {
        case 'shiko':
            diffBody = 2;
            stressGain = 15;
            break;
        case 'teppo':
            diffTech = 2;
            stressGain = 15;
            break;
        case 'moushi_ai':
            diffBody = 1; diffTech = 1; diffMind = 1;
            stressGain = 25;
            break;
        case 'meditation':
            diffMind = 2;
            stressGain = -10;
            break;
        default:
            console.warn(`Unknown training type: ${menuType}`);
            break;
    }

    const { stats, potential, stress } = wrestler;

    const newStats = {
        body: Math.min(potential, stats.body + diffBody),
        technique: Math.min(potential, stats.technique + diffTech),
        mind: Math.min(potential, stats.mind + diffMind)
    };

    const newStress = Math.max(0, (stress || 0) + stressGain);

    const learnProb = 0.05;

    // Skill learning logic
    if (Math.random() < learnProb && wrestler.skills.length < MAX_SKILLS) {
        const unlearned = ALL_SKILLS.filter(s => !wrestler.skills.includes(s));
        if (unlearned.length > 0) {
            learnedSkill = unlearned[Math.floor(Math.random() * unlearned.length)];
        }
    }

    const updatedWrestler: Wrestler = {
        ...wrestler,
        stats: newStats,
        stress: newStress,
        skills: learnedSkill ? [...wrestler.skills, learnedSkill] : wrestler.skills
    };

    return {
        updatedWrestler,
        diffBody,
        diffTech,
        diffMind,
        learnedSkill
    };
};
