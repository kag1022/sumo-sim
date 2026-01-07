import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TrainingType, Wrestler, Candidate, YushoRecord, SaveData, Division, Matchup } from '../types';
import { ALL_SKILLS, MAX_SKILLS, SKILL_INFO } from '../utils/skills';
import { matchMaker } from '../features/match/logic/matchmaker/MatchMaker';
import { generateDailyMatches } from '../features/match/logic/matchmaker/DailyScheduler';
import { updateBanzuke } from '../features/banzuke/logic/banzuke';
import { generateCandidates } from '../features/wrestler/logic/scouting';
import { generateWrestler } from '../features/wrestler/logic/generator';
import { MAX_PLAYERS_PER_HEYA } from '../utils/constants';
import { calculateIncome, calculateExpenses } from '../features/heya/logic/economy';
import { calculateSeverance, shouldUpdateMaxRank, shouldRetire } from '../features/wrestler/logic/retirement';
import { getOkamiBudgetMultiplier, getOkamiUpgradeCost } from '../features/heya/logic/okami';
import { useEvents } from './useEvents';
import { saveGame } from '../utils/storage';
import { formatRank } from '../utils/formatting';
import { formatHybridDate } from '../utils/time';

export const useGameLoop = () => {
    const {
        currentDate,
        funds,
        wrestlers,
        heyas,
        gamePhase,
        gameMode,
        setFunds,
        setWrestlers,
        advanceDate,
        addLog,
        setGamePhase,
        setBashoFinished,
        setYushoWinners,
        setLastMonthBalance,
        okamiLevel,
        reputation,
        logs,
        setOkamiLevel,
        setReputation,
        todaysMatchups,
        setTodaysMatchups,
        trainingPoints,
        setTrainingPoints,
        bashoFinished,
        lastMonthBalance,
        isInitialized,
        oyakataName,
        yushoHistory,
        setYushoHistory,
        setRetiringQueue,
        usedNames,
        setConsultingWrestlerId,

        matchesProcessed,
        setMatchesProcessed,
        retiringQueue // Add missing destructure
    } = useGame();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const { checkRandomEvents } = useEvents();

    const advanceTime = (trainingType: TrainingType) => {
        let daysToAdvance = 0;
        let nextWrestlersState = [...wrestlers];

        // Check next state
        if (gamePhase === 'training') {
            // --- TRAINING MODE (Weekly) ---
            daysToAdvance = 7;

            setCandidates(generateCandidates(3));

            const targetDate = new Date(currentDate);
            targetDate.setDate(targetDate.getDate() + 7);

            let collisionDay = -1;

            if ((currentDate.getMonth() + 1) % 2 !== 0 && currentDate.getDate() < 10) {
                if (targetDate.getDate() >= 10) {
                    collisionDay = 10;
                }
            }

            // Training & Passive Growth Logic
            let updatedWrestlers = [...wrestlers];

            if (collisionDay !== -1) {
                daysToAdvance = collisionDay - currentDate.getDate();
                setGamePhase('tournament');
                addLog("本場所（初日）が始まります！", 'info');

                // 力士のcurrentBashoStatsをリセット
                updatedWrestlers = updatedWrestlers.map(w => ({
                    ...w,
                    currentBashoStats: { wins: 0, losses: 0, matchHistory: [], boutDays: [] }
                }));
                // nextWrestlersState更新
                nextWrestlersState = updatedWrestlers;

                // 初日(Day 1)の割を作成
                const day1Matches = generateDailyMatches(updatedWrestlers, 1);

                // MatchPair[] -> Matchup[] 変換 (winnerIdはnull)
                const matchups: Matchup[] = day1Matches.map(m => ({
                    east: m.east,
                    west: m.west,
                    division: m.division,
                    winnerId: null
                }));

                setTodaysMatchups(matchups);
                setMatchesProcessed(false);
                addLog("初日の取組が発表されました。", 'info');
            }

            if (daysToAdvance > 0) {
                // Reset Training Points Weekly
                setTrainingPoints(3);

                // Create Heya Strength Map for performance
                const heyaStrengthMap = new Map<string, number>();
                heyas.forEach(h => heyaStrengthMap.set(h.id, h.strengthMod));

                const updateStat = (current: number, gain: number, potential: number) => {
                    const potentialFactor = Math.max(0, (potential - current) / potential);
                    // Passive growth is slower than active
                    return Math.min(potential, current + (gain * potentialFactor));
                };

                const applyDecay = (val: number) => {
                    // Slower decay
                    return val > 80 ? val - (0.05 * daysToAdvance) : val;
                };

                updatedWrestlers = wrestlers.map(w => {
                    // Skip injured
                    if (w.injuryStatus === 'injured') return w;

                    let newStats = { ...w.stats };
                    let stressGain = 0;

                    // 1. Decay
                    newStats.body = applyDecay(newStats.body);
                    newStats.technique = applyDecay(newStats.technique);
                    newStats.mind = applyDecay(newStats.mind);

                    // 2. Training Effect (Active)
                    const isPlayerHeya = w.heyaId === 'player_heya';

                    if (isPlayerHeya) {
                        // Active Training Bonus
                        const trainingMod = 1.0;
                        switch (trainingType) {
                            case 'shiko':
                                newStats.body = updateStat(newStats.body, 0.5 * trainingMod, w.potential);
                                stressGain = 5;
                                break;
                            case 'teppo':
                                newStats.technique = updateStat(newStats.technique, 0.5 * trainingMod, w.potential);
                                stressGain = 5;
                                break;
                            case 'moushi_ai':
                                newStats.mind = updateStat(newStats.mind, 0.5 * trainingMod, w.potential);
                                newStats.body = updateStat(newStats.body, 0.2 * trainingMod, w.potential);
                                newStats.technique = updateStat(newStats.technique, 0.2 * trainingMod, w.potential);
                                stressGain = 10;
                                break;
                            case 'rest':
                                w.stress = Math.max(0, (w.stress || 0) - 20);
                                return w; // No stat gain, just rest
                        }
                    } else {
                        // CPU Passive Growth
                        const heyaStr = heyaStrengthMap.get(w.heyaId) || 1.0;
                        newStats.body = updateStat(newStats.body, 0.1 * heyaStr, w.potential);
                        newStats.technique = updateStat(newStats.technique, 0.1 * heyaStr, w.potential);
                    }

                    return { ...w, stats: newStats, stress: Math.min(100, (w.stress || 0) + stressGain) };
                });

                // 3. Okami Relief (Daily x Days)
                const okamiRelief = [0, 2, 4, 6, 8, 10][okamiLevel] || 0;
                const totalRelief = okamiRelief * daysToAdvance;

                updatedWrestlers = updatedWrestlers.map(w => ({
                    ...w,
                    stress: Math.max(0, w.stress - totalRelief)
                }));

                // Update wrestlers state after training
                if (collisionDay === -1) {
                    nextWrestlersState = updatedWrestlers;
                }

                setWrestlers(nextWrestlersState);

                // Auto-Save Weekly
                triggerAutoSave({ wrestlers: nextWrestlersState, heyas, funds, reputation, okamiLevel });
            }
        } else {
            // --- TOURNAMENT MODE (Day by Day) ---

            // ガード: 二重実行防止
            if (matchesProcessed) {
                return;
            }

            daysToAdvance = 1;
            const tournamentDay = currentDate.getDate() - 9; // 10th is Day 1

            // 1. 今日の対戦結果を決定
            const processedMatchups = todaysMatchups.map(match => {
                const eastChance = matchMaker.calculateWinChance(match.east, match.west);
                const isEastWinner = Math.random() < eastChance;

                return {
                    ...match,
                    winnerId: isEastWinner ? match.east.id : match.west.id
                };
            });

            // 2. 結果をUIに反映（勝者表示）
            setTodaysMatchups(processedMatchups);

            // 3. 結果を力士Statsに反映
            let updatedWrestlers = [...wrestlers];
            const updates = new Map<string, { win: boolean, opponentId: string, kimarite: string }>();

            processedMatchups.forEach(m => {
                const winnerId = m.winnerId!;
                const loserId = m.east.id === winnerId ? m.west.id : m.east.id;
                updates.set(winnerId, { win: true, opponentId: loserId, kimarite: 'Oshidashi' });
                updates.set(loserId, { win: false, opponentId: winnerId, kimarite: 'Oshidashi' });
            });

            updatedWrestlers = updatedWrestlers.map(w => {
                const res = updates.get(w.id);
                if (!res) return w; // 試合なし

                const okamiRelief = [0, 2, 4, 6, 8, 10][okamiLevel] || 2;
                let newStats = { ...w.currentBashoStats };

                // 勝敗反映
                newStats.wins += res.win ? 1 : 0;
                newStats.losses += res.win ? 0 : 1;
                newStats.matchHistory = [...newStats.matchHistory, res.opponentId];
                newStats.boutDays = [...(newStats.boutDays || []), tournamentDay];

                // ストレス変動
                const stressChange = res.win ? -2 : 3;
                let newStress = Math.max(0, (w.stress || 0) + stressChange - okamiRelief);

                return {
                    ...w,
                    currentBashoStats: newStats,
                    stress: newStress
                };
            });

            nextWrestlersState = updatedWrestlers;
            setWrestlers(updatedWrestlers);
            setMatchesProcessed(true); // 処理完了
            addLog(`${tournamentDay}日目の取組が終了しました。`, 'info');
        }

        // Common Updates
        const eventResult = checkRandomEvents(nextWrestlersState, reputation, okamiLevel);
        setFunds(prev => prev + eventResult.fundsChange);
        setReputation(Math.min(100, Math.max(0, reputation + eventResult.reputationChange)));

        // Update wrestlers with event results
        nextWrestlersState = eventResult.updatedWrestlers;
        setWrestlers(nextWrestlersState);

        // Advance Date
        if (daysToAdvance > 0) {
            advanceDate(daysToAdvance);

            // もし場所中なら、翌日の対戦カードを作成する
            if (gamePhase === 'tournament') {

                // Basho End Check: 24th is the last day (Day 15)
                if (currentDate.getDate() >= 24) { // 24日(千秋楽)終了後
                    // 千秋楽終了後の処理（Stats更新済みのwrestlersを使用）
                    processBashoEnd(nextWrestlersState);
                } else {
                    // 翌日の割作成 (Day 2-15)
                    const nextDate = new Date(currentDate);
                    nextDate.setDate(nextDate.getDate() + 1); // 翌日の日付
                    const nextDay = nextDate.getDate() - 9; // 翌日が何日目か

                    const nextMatches = generateDailyMatches(nextWrestlersState, nextDay);
                    const nextMatchups: Matchup[] = nextMatches.map(m => ({
                        east: m.east,
                        west: m.west,
                        division: m.division,
                        winnerId: null
                    }));
                    setTodaysMatchups(nextMatchups);
                    setMatchesProcessed(false); // リセット
                    addLog(`${nextDay}日目の取組が発表されました。`, 'info');
                }
            }
        }
    };

    /**
     * 場所終了後の処理（表彰、番付編成、イベントなど）
     */
    const processBashoEnd = (finalWrestlers: Wrestler[]) => {
        setBashoFinished(true);
        setGamePhase('training');

        // 優勝者の決定
        const divisions = ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'];
        const winnersMap: Record<string, Wrestler> = {};
        const rankToDivision = (rank: string): string => {
            if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
            return rank;
        };

        divisions.forEach(division => {
            const divisionWrestlers = finalWrestlers.filter(w => rankToDivision(w.rank) === division);

            if (divisionWrestlers.length > 0) {
                divisionWrestlers.sort((a, b) => {
                    if (b.currentBashoStats.wins !== a.currentBashoStats.wins) return b.currentBashoStats.wins - a.currentBashoStats.wins;
                    // 決定戦ロジック省略（上位者優勝）
                    return 0;
                });
                winnersMap[division] = divisionWrestlers[0];
            }
        });

        setYushoWinners(winnersMap);

        // Log Yusho History
        const newRecords: YushoRecord[] = Object.entries(winnersMap).map(([div, winner]) => {
            const heya = heyas.find(h => h.id === winner.heyaId);
            return {
                bashoId: formatHybridDate(currentDate, 'tournament'),
                division: div as Division,
                wrestlerId: winner.id,
                wrestlerName: winner.name,
                heyaName: heya ? heya.name : 'Unknown',
                rank: formatRank(winner.rank),
                wins: winner.currentBashoStats.wins,
                losses: winner.currentBashoStats.losses
            };
        });
        setYushoHistory(prev => [...prev, ...newRecords]);

        const makuuchiWinner = winnersMap['Makuuchi'];
        if (makuuchiWinner) {
            addLog(`幕内最高優勝: ${makuuchiWinner.name} (${makuuchiWinner.currentBashoStats.wins}勝${makuuchiWinner.currentBashoStats.losses}敗)`, 'info');
            if (makuuchiWinner.heyaId === 'player_heya') {
                setFunds(prev => prev + 10000000);
                addLog("優勝賞金 1,000万円を獲得しました！", 'info');
            }
        }

        // 新序出世
        let updatedWrestlers = finalWrestlers.map(w => {
            if (w.rank === 'MaeZumo') {
                addLog(`【新序出世】${w.name} が序ノ口に昇進しました！`, 'info');
                return { ...w, rank: 'Jonokuchi' as const, rankNumber: 50 };
            }
            return w;
        });

        // 番付編成
        let nextWrestlers = updateBanzuke(updatedWrestlers);

        const survivingWrestlers: Wrestler[] = [];
        let retiredCount = 0;

        // 引退判定
        nextWrestlers.forEach(w => {
            const isPlayerHeya = w.heyaId === 'player_heya';
            const retirementCheck = shouldRetire(w, isPlayerHeya);
            let willRetire = false;

            if (!isPlayerHeya) {
                // CPU
                if (retirementCheck.retire) willRetire = true;
            } else {
                // Player
                if (retirementCheck.retire) {
                    willRetire = true;
                    addLog(`${w.name}は${retirementCheck.reason} により引退を決意しました。`, 'error');
                } else if (retirementCheck.shouldConsult) {
                    // Consultation
                    const updatedWrestler = {
                        ...w,
                        retirementStatus: 'Thinking' as const,
                        retirementReason: retirementCheck.reason
                    };
                    survivingWrestlers.push(updatedWrestler);
                    addLog(`【引退相談】${w.name}が引退について相談を求めています...`, 'warning');
                    return;
                }
            }

            if (willRetire) {
                retiredCount++;
                if (isPlayerHeya && w.isSekitori) {
                    setRetiringQueue(prev => [...prev, w]);
                }
            } else {
                // Aging / Decay
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
                    addLog(`【復活】${w.name} がラストチャンスを見事に掴みました！現役続行決定！`, 'info');
                }

                survivingWrestlers.push({
                    ...w,
                    maxRank: newMax,
                    stats: newStats,
                    retirementStatus: newRetirementStatus as any,
                    age: w.age + (currentDate.getMonth() === 11 ? 1 : 0), // Birthday logic approximation
                    // Reset Basho Stats
                    currentBashoStats: { wins: 0, losses: 0, matchHistory: [], boutDays: [] },
                    nextBoutDay: null // Clear bout day
                });
            }
        });

        // 新弟子
        let recruitedCount = 0;
        if (survivingWrestlers.length < 950) {
            const needed = 960 - survivingWrestlers.length;
            const recruitNum = Math.min(needed, Math.floor(Math.random() * 10) + 5);
            for (let i = 0; i < recruitNum; i++) {
                const randomHeya = heyas[Math.floor(Math.random() * heyas.length)];
                survivingWrestlers.push(generateWrestler(randomHeya, 'MaeZumo'));
                recruitedCount++;
            }
        }

        // Monthly Balance
        const playerWrestlers = survivingWrestlers.filter(w => w.heyaId === 'player_heya');

        const incomeReport = calculateIncome(playerWrestlers);
        const income = incomeReport.total;
        const rawExpenses = calculateExpenses(playerWrestlers);
        const budgetMultiplier = getOkamiBudgetMultiplier(okamiLevel);
        const expense = Math.floor(rawExpenses * budgetMultiplier);
        const netBalance = income - expense;

        setLastMonthBalance(netBalance);

        // Apply finances
        setFunds(prev => prev + netBalance);

        const savedPercentage = Math.round((1 - budgetMultiplier) * 100);
        if (savedPercentage > 0) {
            addLog(`【収支報告】女将さんの功績により、経費 ${savedPercentage}% を節約しました。`, 'info');
        }

        setWrestlers(survivingWrestlers);
        addLog(`${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月場所終了。${retiredCount}名の力士が引退し、${recruitedCount}名の新弟子が入門しました。`, 'info');
    };

    const closeBashoModal = () => {
        setBashoFinished(false);
    };

    const recruitWrestler = (candidate: Candidate, customName?: string) => {
        if (wrestlers.filter(w => w.heyaId === 'player_heya').length >= MAX_PLAYERS_PER_HEYA) {
            addLog("部屋の定員（10人）がいっぱいです！", 'error');
            return;
        }
        if (funds < 3000000) {
            addLog("支度金（300万円）が足りません！", 'error');
            return;
        }

        const playerHeyaObj = heyas.find(h => h.id === 'player_heya');
        if (!playerHeyaObj) return;

        setFunds(prev => prev - 3000000);
        let newWrestler = generateWrestler(playerHeyaObj, 'MaeZumo');
        // generateWrestler doesn't take candidate stats directly, so updates stats manually from candidate
        // Or generator needs update. For now, overwrite stats.
        newWrestler.stats = { ...candidate.stats };
        newWrestler.potential = candidate.potential;
        newWrestler.flexibility = candidate.flexibility;
        newWrestler.weight = candidate.weight;
        newWrestler.height = candidate.height;
        newWrestler.background = candidate.background;
        newWrestler.age = candidate.age;

        if (customName) {
            newWrestler.name = customName;
        }
        setWrestlers(prev => [...prev, newWrestler]);
        setCandidates(prev => prev.filter(c => c.id !== candidate.id));
        addLog(`新弟子 ${newWrestler.name} が入門しました！来場所から前相撲として修行を開始します。`, 'info');
    };

    const inspectCandidate = (cost: number) => {
        if (funds >= cost) {
            setFunds(prev => prev - cost);
        } else {
            addLog("資金が足りません！", 'error');
        }
    };

    const retireWrestler = (wrestlerId: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (wrestler) {
            // Player manual retirement logic
            const severance = calculateSeverance(wrestler);

            addLog(`${wrestler.name} (最高位: ${formatRank(wrestler.maxRank)}) が引退しました。`, 'warning');

            if (wrestler.isSekitori) {
                // Sekitori Queue
                setRetiringQueue(prev => [...prev, wrestler]);
            } else {
                // Instant
                if (severance > 0) setFunds(prev => prev + severance);
                addLog("協会より功労金" + severance.toLocaleString() + "円が支払われました。", 'info');
                // Remove
                setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
            }
        }
    };

    const completeRetirement = (wrestlerId: string) => {
        const wrestler = retiringQueue.find(w => w.id === wrestlerId);
        if (wrestler) {
            const severance = calculateSeverance(wrestler);
            setFunds(prev => prev + severance);
            addLog(`${wrestler.name}の断髪式が執り行われ、マゲに別れを告げました。`, 'info');
            addLog("協会より功労金" + severance.toLocaleString() + "円が支払われました。", 'info');
            setRetiringQueue(prev => prev.filter(w => w.id !== wrestlerId));
            // Finally remove from wrestler list if still there (usually filtered out in processBashoEnd, but for updatedWrestlers logic)
            setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
        }
    };

    const upgradeOkami = () => {
        const cost = getOkamiUpgradeCost(okamiLevel);
        if (cost === null || okamiLevel >= 5) return;
        if (funds < cost) return;

        setFunds(prev => prev - cost);
        setOkamiLevel(okamiLevel + 1);
        addLog(`女将さんのレベルが ${okamiLevel + 1} に上がりました！`, 'info');
    };

    const doSpecialTraining = (wrestlerId: string, menuType: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler || trainingPoints <= 0) return;

        setTrainingPoints(prev => prev - 1);

        let diffBody = 0, diffTech = 0, diffMind = 0;

        if (menuType === 'strength') { diffBody = 2; diffTech = 1; }
        else if (menuType === 'technique') { diffTech = 2; diffMind = 1; }
        else if (menuType === 'meditation') { diffMind = 2; diffBody = 1; }

        setWrestlers(prev => prev.map(w => w.id === wrestlerId ? {
            ...w,
            stats: {
                body: Math.min(w.potential, w.stats.body + diffBody),
                technique: Math.min(w.potential, w.stats.technique + diffTech),
                mind: Math.min(w.potential, w.stats.mind + diffMind)
            }
        } : w));

        // Skill Check
        const learnProb = 0.05;
        if (Math.random() < learnProb && wrestler.skills.length < MAX_SKILLS) {
            // Learn random skill
            const unlearned = ALL_SKILLS.filter(s => !wrestler.skills.includes(s));
            if (unlearned.length > 0) {
                const newSkill = unlearned[Math.floor(Math.random() * unlearned.length)];
                setWrestlers(prev => prev.map(w => w.id === wrestlerId ? { ...w, skills: [...w.skills, newSkill] } : w));
                addLog(`${wrestler.name}は特訓の末、秘技『${SKILL_INFO[newSkill].name}』を閃いた！`, 'info');
            }
        }

        addLog(`特別指導（${menuType}）を行いました。心+${diffMind} 技+${diffTech} 体+${diffBody}`, 'info');
    };

    const triggerAutoSave = (currentState: any) => {
        const data: SaveData = {
            version: 1,
            timestamp: Date.now(),
            gameState: {
                currentDate: currentDate.toISOString(),
                funds: currentState.funds,
                reputation: currentState.reputation,
                okamiLevel: currentState.okamiLevel,
                gamePhase,
                gameMode,
                bashoFinished,
                lastMonthBalance,
                isInitialized,
                oyakataName,
                trainingPoints,
                matchesProcessed,
                todaysMatchups
            },
            wrestlers: currentState.wrestlers,
            heyas,
            yushoHistory,
            logs,
            usedNames
        };
        saveGame(data);
    };

    const recordYushoHistory = (winners: Record<string, Wrestler>) => {
        const bashoId = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1} 月場所`;

        const newRecords: YushoRecord[] = Object.entries(winners).map(([div, winner]) => {
            const heya = heyas.find(h => h.id === winner.heyaId);
            return {
                bashoId,
                division: div as Division,
                wrestlerId: winner.id,
                wrestlerName: winner.name,
                heyaName: heya ? heya.name : 'Unknown',
                rank: formatRank(winner.rank),
                wins: winner.currentBashoStats.wins,
                losses: winner.currentBashoStats.losses
            };
        });

        setYushoHistory(prev => [...prev, ...newRecords]);
        return newRecords;
    };

    const handleRetirementConsultation = (wrestlerId: string, decision: 'accept' | 'persuade') => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler) return;

        if (decision === 'accept') {
            addLog(`【引退決定】${wrestler.name} の引退が正式に決まりました。`, 'warning');

            if (wrestler.isSekitori) {
                setRetiringQueue(prev => [...prev, wrestler]);
            } else {
                const severance = calculateSeverance(wrestler);
                if (severance > 0) {
                    setFunds((prev: number) => prev + severance);
                }
                addLog(`【引退】${wrestler.name} (最高位: ${formatRank(wrestler.maxRank)}) が引退しました。`, 'warning');
            }

            setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
        } else {
            addLog(`【説得成功】「馬鹿野郎！お前の相撲はまだ終わっちゃいない！」`, 'info');
            addLog(`${wrestler.name} は親方の言葉に奮い立ち、ラストチャンスに挑みます！`, 'warning');

            setWrestlers(prev => prev.map(w =>
                w.id === wrestlerId
                    ? {
                        ...w,
                        retirementStatus: 'LastHanamichi' as const,
                        retirementReason: undefined,
                        stats: { ...w.stats, mind: w.potential || 100 }
                    }
                    : w
            ));
        }

        setConsultingWrestlerId(null);
    };

    const checkForRetirementConsultation = () => {
        const thinkingWrestler = wrestlers.find(
            w => w.heyaId === 'player_heya' && w.retirementStatus === 'Thinking'
        );

        if (thinkingWrestler) {
            setConsultingWrestlerId(thinkingWrestler.id);
        }
    };

    return { advanceTime, closeBashoModal, candidates, recruitWrestler, inspectCandidate, retireWrestler, completeRetirement, upgradeOkami, doSpecialTraining, triggerAutoSave, recordYushoHistory, handleRetirementConsultation, checkForRetirementConsultation };
};
