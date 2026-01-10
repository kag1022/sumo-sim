import { getWeekId } from '../../../utils/time';
import { useGame } from '../../../context/GameContext';
import { Candidate } from '../../../types';
import { MAX_PLAYERS_PER_HEYA } from '../../../utils/constants';
import { calculateSeverance } from '../logic/retirement';
import { calculateSpecialTrainingResult } from '../logic/training';
import { generateWrestler } from '../logic/generator';
import { formatRank } from '../../../utils/formatting';

import { useTranslation } from 'react-i18next';

export const useWrestlerActions = () => {
    const { t } = useTranslation();
    const {
        funds,
        setFunds,
        wrestlers,
        setWrestlers,
        heyas,
        addLog,
        trainingPoints,
        setTrainingPoints,
        todaysMatchups,
        setTodaysMatchups,
        retiringQueue,
        setRetiringQueue,
        setConsultingWrestlerId,
        setCandidates,
        setRetiredWrestlers,
        currentDate // Added
    } = useGame();

    /**
     * スカウト候補を力士として採用する
     * @param candidate 採用する候補
     * @param customName カスタム四股名（省略時は自動生成）
     */
    const recruitWrestler = (candidate: Candidate, customName?: string) => {
        if (wrestlers.filter(w => w.heyaId === 'player_heya').length >= MAX_PLAYERS_PER_HEYA) {
            addLog({
                key: 'log.error.heya_full',
                params: { capacity: MAX_PLAYERS_PER_HEYA },
                message: "部屋の定員（10人）がいっぱいです！",
                type: 'error'
            }, 'error');
            return;
        }
        if (funds < 3000000) {
            addLog({
                key: 'log.error.insufficient_funds_recruit',
                params: { amount: '3,000,000' },
                message: "支度金（300万円）が足りません！",
                type: 'error'
            }, 'error');
            return;
        }

        const playerHeyaObj = heyas.find(h => h.id === 'player_heya');
        if (!playerHeyaObj) return;

        setFunds(prev => prev - 3000000);
        let newWrestler = generateWrestler(playerHeyaObj, 'MaeZumo');

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
        addLog({
            key: 'log.action.recruit_success',
            params: { name: newWrestler.name },
            message: `新弟子 ${newWrestler.name} が入門しました！来場所から前相撲として修行を開始します。`,
            type: 'info'
        }, 'info');
    };

    /**
     * 力士を引退させる
     * @param wrestlerId 引退させる力士のID
     */
    const retireWrestler = (wrestlerId: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (wrestler) {
            const severance = calculateSeverance(wrestler);
            addLog({
                key: 'log.wrestler.retired',
                params: { name: wrestler.name, rank: formatRank(wrestler.maxRank) },
                message: `${wrestler.name} (最高位: ${formatRank(wrestler.maxRank)}) が引退しました。`,
                type: 'warning'
            }, 'warning');

            if (wrestler.isSekitori) {
                setRetiringQueue(prev => [...prev, wrestler]);
            } else {
                if (severance > 0) setFunds(prev => prev + severance);
                addLog({
                    key: 'log.wrestler.severance_paid',
                    params: { amount: severance.toLocaleString() },
                    message: "協会より功労金" + severance.toLocaleString() + "円が支払われました。",
                    type: 'info'
                }, 'info');
                setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
                setRetiredWrestlers(prev => [...prev, wrestler]);
            }
        }
    };

    /**
     * 断髪式を完了させる（関取のみ）
     * @param wrestlerId 力士ID
     */
    const completeRetirement = (wrestlerId: string) => {
        const wrestler = retiringQueue.find(w => w.id === wrestlerId);
        if (wrestler) {
            const severance = calculateSeverance(wrestler);
            setFunds(prev => prev + severance);
            addLog({
                key: 'log.wrestler.danpatsu',
                params: { name: wrestler.name },
                message: `${wrestler.name}の断髪式が執り行われ、マゲに別れを告げました。`,
                type: 'info'
            }, 'info');
            addLog({
                key: 'log.wrestler.severance_paid',
                params: { amount: severance.toLocaleString() },
                message: "協会より功労金" + severance.toLocaleString() + "円が支払われました。",
                type: 'info'
            }, 'info');
            setRetiringQueue(prev => prev.filter(w => w.id !== wrestlerId));
            setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
            setRetiredWrestlers(prev => [...prev, wrestler]);
        }
    };

    /**
     * 特別指導を行う（TP消費）
     * @param wrestlerId 対象力士ID
     * @param menuType 指導メニュータイプ
     */
    const doSpecialTraining = (wrestlerId: string, menuType: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler || trainingPoints <= 0) return;

        // Check Weekly Limit
        const currentWeekId = getWeekId(currentDate);
        const history = wrestler.trainingHistory || { weekId: currentWeekId, count: 0 };

        // Reset count if new week
        if (history.weekId !== currentWeekId) {
            history.weekId = currentWeekId;
            history.count = 0;
        }

        if (history.count >= 5) {
            addLog({
                key: 'log.error.training_limit', // New key (generic error or make specific) or just return
                message: "今週の特訓上限（5回）に達しています！",
                type: 'warning'
            }, 'warning');
            return;
        }

        setTrainingPoints(prev => prev - 1);

        const result = calculateSpecialTrainingResult(wrestler, menuType);

        // Update Wrestler with result AND new history
        setWrestlers(prev => prev.map(w =>
            w.id === wrestlerId
                ? {
                    ...result.updatedWrestler,
                    trainingHistory: { weekId: currentWeekId, count: history.count + 1 }
                }
                : w
        ));

        if (result.learnedSkill) {
            addLog({
                key: 'log.action.skill_learned',
                params: { name: wrestler.name, skill: t(`skills.${result.learnedSkill}.name`) },
                message: `${wrestler.name}は特訓の末、秘技『${t(`skills.${result.learnedSkill}.name`)}』を閃いた！`,
                type: 'info'
            }, 'info');
        }

        addLog({
            key: 'log.action.training_done',
            params: { type: menuType, mind: result.diffMind, tech: result.diffTech, body: result.diffBody },
            message: `特別指導（${menuType}）を行いました。心+${result.diffMind} 技+${result.diffTech} 体+${result.diffBody}`,
            type: 'info'
        }, 'info');
    };

    /**
     * 本場所中の助言を与える（TP消費）
     * @param matchIndex 取組インデックス
     * @param side 助言対象側（east/west）
     */
    const giveAdvice = (matchIndex: number, side: 'east' | 'west') => {
        if (trainingPoints < 5) return;

        const match = todaysMatchups[matchIndex];
        if (!match) return;

        // Check if already advised
        if (match.tacticalBonus?.[side]) return;

        setTrainingPoints(prev => prev - 5);

        const newMatchups = [...todaysMatchups];
        const newBonus = { ...(newMatchups[matchIndex].tacticalBonus || {}) };
        newBonus[side] = true;

        newMatchups[matchIndex] = {
            ...newMatchups[matchIndex],
            tacticalBonus: newBonus
        };

        setTodaysMatchups(newMatchups);
        addLog({
            key: 'log.action.advice',
            message: "力士に助言を与えました。(TP -5)",
            type: 'info'
        }, 'info');
    };

    /**
     * 引退相談を処理する
     * @param wrestlerId 力士ID
     * @param decision 決定（accept: 引退承認, persuade: 説得）
     */
    const handleRetirementConsultation = (wrestlerId: string, decision: 'accept' | 'persuade') => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler) return;

        if (decision === 'accept') {
            addLog({
                key: 'log.consult.retire_decided',
                params: { name: wrestler.name },
                message: `【引退決定】${wrestler.name} の引退が正式に決まりました。`,
                type: 'warning'
            }, 'warning');

            if (wrestler.isSekitori) {
                setRetiringQueue(prev => [...prev, wrestler]);
            } else {
                const severance = calculateSeverance(wrestler);
                if (severance > 0) {
                    setFunds((prev: number) => prev + severance);
                }
                addLog({
                    key: 'log.wrestler.retired',
                    params: { name: wrestler.name, rank: formatRank(wrestler.maxRank) },
                    message: `【引退】${wrestler.name} (最高位: ${formatRank(wrestler.maxRank)}) が引退しました。`,
                    type: 'warning'
                }, 'warning');
            }

            setWrestlers(prev => prev.filter(w => w.id !== wrestlerId));
            setRetiredWrestlers(prev => [...prev, wrestler]);
        } else {
            addLog({
                key: 'log.consult.persuade_success',
                message: `【説得成功】「馬鹿野郎！お前の相撲はまだ終わっちゃいない！」`,
                type: 'info'
            }, 'info');
            addLog({
                key: 'log.consult.last_chance',
                params: { name: wrestler.name },
                message: `${wrestler.name} は親方の言葉に奮い立ち、ラストチャンスに挑みます！`,
                type: 'warning'
            }, 'warning');

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

    /**
     * 引退相談が必要な力士をチェックする
     */
    const checkForRetirementConsultation = () => {
        const thinkingWrestler = wrestlers.find(
            w => w.heyaId === 'player_heya' && w.retirementStatus === 'Thinking'
        );

        if (thinkingWrestler) {
            setConsultingWrestlerId(thinkingWrestler.id);
        }
    };

    /**
     * 力士の四股名を変更する（TP消費）
     * @param wrestlerId 対象力士ID
     * @param newName 新しい四股名
     * @param newReading 新しい読み（ローマ字）
     */
    const renameWrestler = (wrestlerId: string, newName: string, newReading: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler) return;

        const COST = 50;
        if (trainingPoints < COST) {
            addLog({
                key: 'log.error.insufficient_tp',
                params: { amount: COST },
                message: "TPが足りません！",
                type: 'error'
            }, 'error');
            return;
        }

        setTrainingPoints(prev => prev - COST);

        const oldName = wrestler.name;
        setWrestlers(prev => prev.map(w =>
            w.id === wrestlerId
                ? { ...w, name: newName, reading: newReading }
                : w
        ));

        addLog({
            key: 'log.wrestler.action.rename_success',
            params: { oldName, newName },
            message: `${oldName} は ${newName} に改名しました！`,
            type: 'info'
        }, 'info');
    };

    /**
     * スキルを忘れる（TP消費）
     * @param wrestlerId 対象力士ID
     * @param skillId 忘れるスキルID
     */
    const forgetSkill = (wrestlerId: string, skillId: string) => {
        const wrestler = wrestlers.find(w => w.id === wrestlerId);
        if (!wrestler) return;

        const COST = 10;
        if (trainingPoints < COST) {
            addLog({
                key: 'log.error.insufficient_tp',
                params: { amount: COST },
                message: "TPが足りません！",
                type: 'error'
            }, 'error');
            return;
        }

        if (!wrestler.skills.includes(skillId as any)) return;

        setTrainingPoints(prev => prev - COST);

        setWrestlers(prev => prev.map(w =>
            w.id === wrestlerId
                ? { ...w, skills: w.skills.filter(s => s !== skillId) }
                : w
        ));

        addLog({
            key: 'log.action.forget_skill',
            params: { name: wrestler.name, skill: t(`skills.${skillId}.name`) },
            message: `${wrestler.name} は '${t(`skills.${skillId}.name`)}' を忘れました。`,
            type: 'info'
        }, 'info');
    };

    return {
        recruitWrestler,
        retireWrestler,
        completeRetirement,
        doSpecialTraining,
        giveAdvice,
        handleRetirementConsultation,
        checkForRetirementConsultation,
        renameWrestler,
        forgetSkill,
    };
};
