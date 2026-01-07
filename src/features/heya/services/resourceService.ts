
import { Wrestler, Heya } from '../../../types';
import { calculateIncome, calculateExpenses } from '../logic/economy';
import { getOkamiBudgetMultiplier } from '../logic/okami';
import { generateWrestler } from '../../wrestler/logic/generator';

interface ResourceUpdateResult {
    updatedWrestlers: Wrestler[];
    fundsChange: number;
    logs: string[];
}

/**
 * 毎月のリソース管理（給料、新弟子補充、その他維持費）
 */
export const processMonthlyResources = (
    wrestlers: Wrestler[],
    heyas: Heya[],
    okamiLevel: number,
    reputation: number,
    autoRecruitAllowed: boolean
): ResourceUpdateResult => {
    const logs: string[] = [];
    const survivingWrestlers = [...wrestlers];

    // 1. New Recruits (Replacement)
    let recruitedCount = 0;
    if (survivingWrestlers.length < 950) {
        const needed = 960 - survivingWrestlers.length;
        const recruitNum = Math.min(needed, Math.floor(Math.random() * 10) + 5);

        let eligibleHeyas = heyas;
        if (!autoRecruitAllowed) {
            eligibleHeyas = heyas.filter(h => h.id !== 'player_heya');
        }
        if (eligibleHeyas.length === 0) eligibleHeyas = heyas;

        for (let i = 0; i < recruitNum; i++) {
            const randomHeya = eligibleHeyas[Math.floor(Math.random() * eligibleHeyas.length)];
            const newWrestler = generateWrestler(randomHeya, 'MaeZumo');
            survivingWrestlers.push(newWrestler);
            recruitedCount++;
        }
    }

    if (recruitedCount > 0) {
        logs.push(`${recruitedCount}名の新弟子が入門しました。`);
    }

    // 2. Finances (Monthly Balance)
    const playerWrestlers = survivingWrestlers.filter(w => w.heyaId === 'player_heya');

    const incomeReport = calculateIncome(playerWrestlers);
    const income = incomeReport.total;
    const rawExpenses = calculateExpenses(playerWrestlers);
    const budgetMultiplier = getOkamiBudgetMultiplier(okamiLevel);
    const expense = Math.floor(rawExpenses * budgetMultiplier);
    const netBalance = income - expense;

    const savedPercentage = Math.round((1 - budgetMultiplier) * 100);
    if (savedPercentage > 0) {
        logs.push(`【収支報告】女将さんの功績により、経費 ${savedPercentage}% を節約しました。`);
    }

    // 3. Supporter Income
    const supporterIncome = reputation * 10000;
    if (supporterIncome > 0) {
        logs.push(`後援会より 支援金 ¥${supporterIncome.toLocaleString()} を受領しました。`);
    }

    return {
        updatedWrestlers: survivingWrestlers,
        fundsChange: netBalance + supporterIncome,
        logs
    };
};
