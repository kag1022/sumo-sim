import { Wrestler } from '../types';
import { mitigateScandalImpact } from '../utils/okami';

export interface EventResult {
    updatedWrestlers: Wrestler[];
    reputationChange: number;
    fundsChange: number;
    logs: { message: string, type: 'info' | 'warning' | 'error' }[];
}

export const useEvents = () => {

    const checkRandomEvents = (
        wrestlers: Wrestler[],
        reputation: number,
        okamiLevel: number
    ): EventResult => {
        let updatedWrestlers = [...wrestlers];
        let reputationChange = 0;
        let fundsChange = 0;
        const logs: { message: string, type: 'info' | 'warning' | 'error' }[] = [];

        // 1. Stress Evaluation (Boycott Check)
        updatedWrestlers = updatedWrestlers.map(w => {
            // Boycott if Stress > 80 (Chance based on personality? For now simplified 10% daily chance if >80)
            if ((w.stress || 0) > 80) {
                if (Math.random() < 0.1) {
                    // Boycott: No Training (Handled by flagging or just logging? 
                    // Ideally we set a flag. For simplicity, we just spike stress more or log warning?
                    // User req: "Experience 0 for a few days". 
                    // We don't have "Temporary Status Effects" system yet.
                    // Alternative: Reduce Stats slightly (Sabotage) or just Log.
                    // Let's Log heavily and maybe reduce 'mind' (motivation).
                    logs.push({
                        message: `【稽古拒否】${w.name} がストレスのあまり稽古をボイコットしています... (心 -5)`,
                        type: 'warning'
                    });
                    return { ...w, stats: { ...w.stats, mind: Math.max(1, w.stats.mind - 5) } };
                }
            }
            return w;
        });

        // 2. Scandal (Bad Event)
        // Trigger: High Stress OR Low Potential/Bad Luck
        // Chance: Base 0.05% per wrestler. +1% if Stress > 95. (Reduced from 0.1% / +2% / >90)
        wrestlers.forEach(w => {
            let scandalChance = 0.0005; // 0.05%
            if ((w.stress || 0) > 95) scandalChance += 0.01; // +1% risk

            if (Math.random() < scandalChance) {
                // SCANDAL!
                if (w.heyaId === 'player_heya') {
                    // Player Penalty
                    const baseRepLoss = 20;
                    const mitigatedLoss = mitigateScandalImpact(baseRepLoss, okamiLevel);
                    const fine = 1000000; // 1M Fine

                    reputationChange -= mitigatedLoss;
                    fundsChange -= fine;

                    logs.push({
                        message: `【不祥事】${w.name} が街でトラブルを起こしました！罰金100万円が発生しました。 (評判 -${mitigatedLoss})`,
                        type: 'error'
                    });

                    if (baseRepLoss > mitigatedLoss) {
                        logs.push({
                            message: `女将さんの迅速な対応により、世間への悪影響は最小限に抑えられました！`,
                            type: 'info'
                        });
                    }
                } else {
                    // CPU Scandal (Log Only, no penalty)
                    logs.push({
                        message: `【噂】${w.name} (他部屋) が街でトラブルを起こしたようです...`,
                        type: 'warning'
                    });
                }
            }
        });

        // 3. Good Events
        // Donation (Tanimachi)
        // Chance: Based on Reputation. Rep 100 = 5% daily? Rep 0 = 0%.
        const donationChance = (reputation / 100) * 0.05;
        if (Math.random() < donationChance) {
            const amount = 500000; // 500k
            fundsChange += amount;
            reputationChange += 1; // Bonus rep
            logs.push({
                message: `【タニマチ】評判を聞きつけた後援会から寄付金 ¥${amount.toLocaleString()} を頂きました！`,
                type: 'info'
            });
        }

        // Okami Special Meal (Rare)
        // Chance: 1% Fixed
        if (Math.random() < 0.01) {
            updatedWrestlers = updatedWrestlers.map(w => ({ ...w, stress: 0, injuryStatus: 'healthy', injuryDuration: 0 }));
            logs.push({
                message: `【女将さんの手料理】女将さんが特製ちゃんこを振る舞いました！全力士のストレスと体調が全快しました！`,
                type: 'info'
            });
        }

        return {
            updatedWrestlers,
            reputationChange,
            fundsChange,
            logs
        };
    };

    return { checkRandomEvents };
};
