
import { Wrestler, Matchup } from '../../../types';
import { matchMaker } from '../logic/matchmaker/MatchMaker';

interface DailyMatchResult {
    updatedWrestlers: Wrestler[];
    updatedMatchups: Matchup[];
    logs: string[];
}

/**
 * 毎日（本場所中）の取組結果を処理するサービス
 */
export const processDailyMatches = (
    wrestlers: Wrestler[],
    todaysMatchups: Matchup[],
    currentDate: Date,
    okamiLevel: number
): DailyMatchResult => {

    const logs: string[] = [];
    const tournamentDay = currentDate.getDate() - 9; // 10th is Day 1

    // 1. Calculate outcomes
    // 1. Calculate outcomes
    const processedMatchups = todaysMatchups.map(match => {
        const result = matchMaker.calculateWinChance(match.east, match.west);
        const isEastWinner = Math.random() < result.winChance;
        const winner = isEastWinner ? match.east : match.west;
        const triggeredSkills = isEastWinner ? result.eastTriggeredSkills : result.westTriggeredSkills;

        return {
            ...match,
            winnerId: winner.id,
            kimarite: 'Oshidashi', // Temporary default, logic should be improved later
            triggeredSkills: triggeredSkills
        };
    });

    // 2. Update Stats
    const updates = new Map<string, { win: boolean, opponentId: string, kimarite: string }>();

    processedMatchups.forEach(m => {
        const winnerId = m.winnerId!;
        const loserId = m.east.id === winnerId ? m.west.id : m.east.id;

        // Simple Kimarite for now
        updates.set(winnerId, { win: true, opponentId: loserId, kimarite: 'Oshidashi' });
        updates.set(loserId, { win: false, opponentId: winnerId, kimarite: 'Oshidashi' });
    });

    const updatedWrestlers = wrestlers.map(w => {
        const res = updates.get(w.id);
        if (!res) return w; // No match today

        const relief = [0, 2, 4, 6, 8, 10][okamiLevel] || 2;
        let newStats = { ...w.currentBashoStats };

        // Win/Loss
        newStats.wins += res.win ? 1 : 0;
        newStats.losses += res.win ? 0 : 1;
        newStats.matchHistory = [...newStats.matchHistory, res.opponentId];
        newStats.boutDays = [...(newStats.boutDays || []), tournamentDay];

        // Stress
        const stressChange = res.win ? -2 : 3;
        let newStress = Math.max(0, (w.stress || 0) + stressChange - relief);

        // Kimarite (Not stored in stats currently, just implicitly in history if needed?)
        // The original code didn't store kimarite in stats object, just history of opponents.

        return {
            ...w,
            currentBashoStats: newStats,
            stress: newStress
        };
    });

    logs.push(`${tournamentDay}日目の取組が終了しました。`);

    return {
        updatedWrestlers,
        updatedMatchups: processedMatchups,
        logs: processedMatchups
            .filter(m => m.east.heyaId === 'player_heya' || m.west.heyaId === 'player_heya')
            .map(m => {
                const winner = m.winnerId === m.east.id ? m.east : m.west;
                const skills = m.triggeredSkills || [];
                // Dramatic Log
                let skillText = "";
                if (skills.length > 0) {
                    const skillNames: Record<string, string> = {
                        'IronHead': '鉄の額',
                        'GiantKiller': '巨漢殺し',
                        'EscapeArtist': 'うっちゃり',
                        'StaminaGod': '無尽蔵',
                        'Bulldozer': '重戦車',
                        'Lightning': '電光石火',
                        'Intimidation': '横綱相撲'
                    };
                    const names = skills.map(s => `【${skillNames[s] as string || s}】`).join('');
                    skillText = `${names}が炸裂！`;
                }
                return `${winner.name}の勝ち。${skillText}決まり手は${m.kimarite}。`;
            })
    };
};
