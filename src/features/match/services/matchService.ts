
import { Wrestler, Matchup } from '../../../types';
import { matchMaker } from '../logic/matchmaker/MatchMaker';

interface DailyMatchResult {
    updatedWrestlers: Wrestler[];
    updatedMatchups: Matchup[];
    logs: string[];
    fundsChange: number;
    reputationChange: number;
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

    let totalFundsChange = 0;
    let totalReputationChange = 0;

    // 1. Calculate outcomes
    const processedMatchups = todaysMatchups.map(match => {
        const result = matchMaker.calculateWinChance(match.east, match.west);
        const isEastWinner = Math.random() < result.winChance;
        const winner = isEastWinner ? match.east : match.west;
        const loser = isEastWinner ? match.west : match.east;
        const triggeredSkills = isEastWinner ? result.eastTriggeredSkills : result.westTriggeredSkills;

        // Kinboshi Logic Check
        const isKinboshi = match.tags?.includes('KinboshiChallenge') &&
            winner.rank === 'Maegashira' &&
            loser.rank === 'Yokozuna';

        if (isKinboshi) {
            // Log for everyone (Major Event)
            logs.push(`【大金星！】${winner.name}、横綱${loser.name}を破り、座布団が舞う！`);

            // Player Bonus (Winner)
            if (winner.heyaId === 'player_heya') {
                totalFundsChange += 100000;
                totalReputationChange += 3;
                // Motivation Boost handled below in stats
            }

            // Player Penalty (Loser)
            if (loser.heyaId === 'player_heya') {
                totalReputationChange -= 1; // Disgrace for Yokozuna
            }
        }

        return {
            ...match,
            winnerId: winner.id,
            kimarite: 'Oshidashi', // Temporary default
            triggeredSkills: triggeredSkills,
            isKinboshi // Pass this flag if we wanted to store it in history, but for now just using it for logs/stats
        };
    });

    // 2. Update Stats
    const updates = new Map<string, { win: boolean, opponentId: string, kinboshi: boolean }>();

    processedMatchups.forEach(m => {
        const winnerId = m.winnerId!;
        const loserId = m.east.id === winnerId ? m.west.id : m.east.id;
        const isKinboshi = !!(m as any).isKinboshi;

        updates.set(winnerId, { win: true, opponentId: loserId, kinboshi: isKinboshi });
        updates.set(loserId, { win: false, opponentId: winnerId, kinboshi: false });
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

        // Stress & Motivation
        let stressChange = res.win ? -2 : 3;

        // Kinboshi Effect: Massive stress relief / Confidence boost
        if (res.win && res.kinboshi) {
            stressChange -= 20; // Huge boost
        }

        let newStress = Math.max(0, (w.stress || 0) + stressChange - relief);

        return {
            ...w,
            currentBashoStats: newStats,
            stress: newStress
        };
    });

    if (logs.length === 0) {
        logs.push(`${tournamentDay}日目の取組が終了しました。`);
    }

    // Filter normal regular logs, keep special ones
    const playerMatchLogs = processedMatchups
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
        });

    return {
        updatedWrestlers,
        updatedMatchups: processedMatchups,
        logs: [...logs, ...playerMatchLogs],
        fundsChange: totalFundsChange,
        reputationChange: totalReputationChange
    };
};
