
import { Wrestler, Division, YushoRecord, Heya } from '../../../types';
import { updateBanzuke } from '../logic/banzuke';
import { shouldRetire, shouldUpdateMaxRank, calculateSeverance } from '../../wrestler/logic/retirement';
import { formatRank } from '../../../utils/formatting';



/**
 * 場所終了時の処理（優勝決定、番付編成、引退判定）
 */
// Helper to get division
const rankToDivision = (rank: string): string => {
    if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
    return rank;
};

export interface YushoResult {
    winnersMap: Record<string, Wrestler>;
    yushoHistoryEntry: YushoRecord[];
    logs: (string | import('../../../types').LogData)[];
    fundsChange: number;
}

/**
 * 優勝者を決定する (Determine Yusho Winners)
 */
export const calculateYusho = (
    wrestlers: Wrestler[],
    heyas: Heya[],
    banzukeDateId: string
): YushoResult => {
    const logs: (string | import('../../../types').LogData)[] = [];
    let fundsChange = 0;

    const divisions = ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'];
    const winnersMap: Record<string, Wrestler> = {};

    divisions.forEach(division => {
        // Only consider wrestlers active in this basho (not absent entire time?) 
        // Existing logic just filters by rank.
        const divisionWrestlers = wrestlers.filter(w => rankToDivision(w.rank) === division);

        if (divisionWrestlers.length > 0) {
            divisionWrestlers.sort((a, b) => {
                if (b.currentBashoStats.wins !== a.currentBashoStats.wins) return b.currentBashoStats.wins - a.currentBashoStats.wins;
                return 0; // Higher rank wins tie (simplified)
                // Real Sumo: Playoff if tie. Simplified: Rank wins.
            });
            winnersMap[division] = divisionWrestlers[0];
        }
    });

    // Log History
    const newRecords: YushoRecord[] = Object.entries(winnersMap).map(([div, winner]) => {
        const heya = heyas.find(h => h.id === winner.heyaId);
        return {
            bashoId: banzukeDateId,
            division: div as Division,
            wrestlerId: winner.id,
            wrestlerName: winner.name,
            wrestlerNameEn: winner.reading,
            heyaName: heya ? heya.name : 'Unknown',
            heyaNameEn: heya ? (heya.nameEn || heya.name) : 'Unknown',
            rank: formatRank(winner.rank),
            wins: winner.currentBashoStats.wins,
            losses: winner.currentBashoStats.losses
        };
    });

    const makuuchiWinner = winnersMap['Makuuchi'];
    if (makuuchiWinner) {
        logs.push({
            key: 'log.tourney.yusho_makuuchi',
            params: { name: makuuchiWinner.name, wins: makuuchiWinner.currentBashoStats.wins, losses: makuuchiWinner.currentBashoStats.losses },
            message: `幕内最高優勝: ${makuuchiWinner.name} (${makuuchiWinner.currentBashoStats.wins}勝${makuuchiWinner.currentBashoStats.losses}敗)`,
            type: 'warning'
        });
        if (makuuchiWinner.heyaId === 'player_heya') {
            fundsChange += 10000000;
            logs.push({
                key: 'log.tourney.prize_money',
                params: { amount: '1,000' },
                message: "優勝賞金 1,000万円を獲得しました！",
                type: 'info'
            });
        }
    }

    return {
        winnersMap,
        yushoHistoryEntry: newRecords,
        logs,
        fundsChange
    };
};

export interface BanzukeUpdateResult {
    updatedWrestlers: Wrestler[];
    retiringQueue: Wrestler[];
    consultingCandidates: Wrestler[];
    logs: (string | import('../../../types').LogData)[];
    fundsChange: number;
}

/**
 * 番付編成と引退処理を行う (Update Ranks & Handle Retirement)
 */
export const applyBanzukeUpdate = (
    wrestlers: Wrestler[],
    currentDate: Date
): BanzukeUpdateResult => {
    const logs: (string | import('../../../types').LogData)[] = [];
    let fundsChange = 0;

    // 1. Promotion (Shinjo)
    let updatedWrestlers = wrestlers.map(w => {
        if (w.rank === 'MaeZumo') {
            if (w.heyaId === 'player_heya') {
                logs.push({
                    key: 'log.wrestler.promotion_shinjo',
                    params: { name: w.name },
                    message: `【新序出世】${w.name} が序ノ口に昇進しました！`,
                    type: 'info'
                });
            }
            return { ...w, rank: 'Jonokuchi' as const, rankNumber: 50 };
        }
        return w;
    });

    // 2. Update Banzuke
    let nextWrestlers = updateBanzuke(updatedWrestlers);

    // 3. Retirement & Aging
    const survivingWrestlers: Wrestler[] = [];
    const retiringQueue: Wrestler[] = [];
    const consultingCandidates: Wrestler[] = [];
    let retiredCount = 0;

    nextWrestlers.forEach(w => {
        const isPlayerHeya = w.heyaId === 'player_heya';
        const retirementCheck = shouldRetire(w, isPlayerHeya);
        let willRetire = false;

        if (!isPlayerHeya) {
            if (retirementCheck.retire) willRetire = true;
        } else {
            if (retirementCheck.retire) {
                willRetire = true;
                logs.push({
                    key: 'log.wrestler.retire_intent',
                    params: { name: w.name, reason: retirementCheck.reason },
                    message: `${w.name}は${retirementCheck.reason} により引退を決意しました。`,
                    type: 'info'
                });
            } else if (retirementCheck.shouldConsult) {
                const updatedWrestler = {
                    ...w,
                    retirementStatus: 'Thinking' as const,
                    retirementReason: retirementCheck.reason
                };
                consultingCandidates.push(updatedWrestler);
                survivingWrestlers.push(updatedWrestler);
                logs.push({
                    key: 'log.wrestler.refer_consult',
                    params: { name: w.name },
                    message: `【引退相談】${w.name}が引退について相談を求めています...`,
                    type: 'info'
                });
                return;
            }
        }

        if (willRetire) {
            retiredCount++;
            if (isPlayerHeya && w.isSekitori) {
                retiringQueue.push(w);
            } else if (isPlayerHeya) {
                fundsChange += calculateSeverance(w);
            }
        } else {
            // Check Aging / Stats Decay
            let newMax = w.maxRank;
            if (shouldUpdateMaxRank(w.rank, w.maxRank)) {
                newMax = w.rank;
            }
            let newStats = { ...w.stats };
            if (w.age >= 30) {
                const decayChance = w.age >= 35 ? 0.3 : 0.1;
                if (Math.random() < decayChance) {
                    newStats.body = Math.max(1, newStats.body - 1);
                    if (w.age >= 35) newStats.technique = Math.max(1, newStats.technique - 1);
                }
            }

            // LastHanamichi Check
            let newRetirementStatus = w.retirementStatus || 'None';
            if (w.retirementStatus === 'LastHanamichi' && w.currentBashoStats.wins >= 8) {
                newRetirementStatus = 'None';
                logs.push({
                    key: 'log.wrestler.revival',
                    params: { name: w.name },
                    message: `【復活】${w.name} がラストチャンスを見事に掴みました！現役続行決定！`,
                    type: 'warning'
                });
            }

            survivingWrestlers.push({
                ...w,
                maxRank: newMax,
                stats: newStats,
                retirementStatus: newRetirementStatus as any,
                age: w.age + (currentDate.getMonth() === 11 ? 1 : 0),
                currentBashoStats: { wins: 0, losses: 0, matchHistory: [], boutDays: [] },
                nextBoutDay: null
            });
        }
    });

    logs.push({
        key: 'log.info.retired_count',
        params: { count: retiredCount },
        message: `${retiredCount}名の力士が引退しました。`,
        type: 'info'
    });

    return {
        updatedWrestlers: survivingWrestlers,
        retiringQueue,
        consultingCandidates,
        logs,
        fundsChange
    };
};

/**
 * Legacy wrapper for backward compatibility if needed, 
 * or just remove it if I update all calls. 
 * I will remove the old function to force update.
 */
