import React from 'react';
import { Wrestler } from '../types';
import { formatRank } from '../utils/formatting';

interface RetirementConsultationModalProps {
    wrestler: Wrestler;
    onAccept: () => void;
    onPersuade: () => void;
}

/**
 * 引退理由に応じたメッセージを取得
 */
const getDialogue = (reason: string | undefined): { title: string; message: string; emoji: string } => {
    if (!reason) {
        return {
            title: '引退を考えています',
            emoji: '😔',
            message: '親方…私は、ここが潮時だと思うのです。'
        };
    }

    if (reason.includes('Injury') || reason.includes('怪我')) {
        return {
            title: '体の限界',
            emoji: '🩹',
            message: '親方…体がもう悲鳴を上げています。これ以上は土俵に上がれません…'
        };
    }

    if (reason.includes('Age') || reason.includes('高齢')) {
        return {
            title: '年齢による衰え',
            emoji: '👴',
            message: '親方…気力が続きません。若い者に道を譲る時が来ました。潮時です。'
        };
    }

    if (reason.includes('Yokozuna') || reason.includes('Ozeki') || reason.includes('Dignity')) {
        return {
            title: '品格を守るために',
            emoji: '🎌',
            message: '親方、これ以上は名折れです。横綱（大関）として、引退させてください。'
        };
    }

    // Default - performance issues
    return {
        title: '成績不振',
        emoji: '😞',
        message: '親方…これ以上ご迷惑をおかけできません。引退させてください。'
    };
};

/**
 * 引退相談モーダル
 * プレイヤー部屋の力士が引退基準を満たした時に表示される
 */
export const RetirementConsultationModal: React.FC<RetirementConsultationModalProps> = ({
    wrestler,
    onAccept,
    onPersuade
}) => {
    const dialogue = getDialogue(wrestler.retirementReason);
    const isInjuryRelated = wrestler.retirementReason?.includes('Injury');

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-[100] backdrop-blur-md">
            <div className="bg-gradient-to-b from-stone-800 to-stone-900 max-w-lg w-full rounded-lg shadow-2xl overflow-hidden border-2 border-stone-600 animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-700 to-stone-800 p-6 text-white text-center border-b border-stone-600">
                    <div className="text-5xl mb-3">{dialogue.emoji}</div>
                    <h2 className="text-2xl font-bold font-serif tracking-widest text-amber-200">
                        引退相談
                    </h2>
                    <p className="text-sm text-stone-400 mt-1">{dialogue.title}</p>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center">
                    {/* Wrestler Info */}
                    <div className="w-24 h-24 bg-stone-700 rounded-full mb-4 border-4 border-amber-600/50 flex items-center justify-center shadow-lg">
                        <span className="text-3xl">🙇</span>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-1">{wrestler.name}</h3>
                    <p className="text-amber-400 font-bold mb-2">
                        {formatRank(wrestler.rank, wrestler.rankSide, wrestler.rankNumber)}
                    </p>
                    <p className="text-stone-400 text-sm mb-6">
                        {wrestler.age}歳 / 最高位: {formatRank(wrestler.maxRank)}
                    </p>

                    {/* Dialogue Box */}
                    <div className="bg-stone-950/50 p-6 rounded-lg w-full mb-8 border border-stone-700">
                        <p className="text-stone-200 text-lg leading-relaxed text-center italic">
                            「{dialogue.message}」
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full space-y-4">
                        {/* Accept Retirement */}
                        <button
                            onClick={onAccept}
                            className="w-full bg-gradient-to-r from-stone-600 to-stone-700 hover:from-stone-500 hover:to-stone-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all active:scale-98 border border-stone-500"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl">🤝</span>
                                <div className="text-left">
                                    <div className="text-lg">引退を認める</div>
                                    <div className="text-xs text-stone-300 font-normal">
                                        「よくやった。胸を張れ。」
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Persuade Button (disabled for injury) */}
                        <button
                            onClick={onPersuade}
                            disabled={isInjuryRelated}
                            className={`w-full font-bold py-4 px-6 rounded-lg shadow-lg transition-all active:scale-98 border
                                ${isInjuryRelated
                                    ? 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white border-red-600'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl">{isInjuryRelated ? '🚫' : '🔥'}</span>
                                <div className="text-left">
                                    <div className="text-lg">説得する（ラストチャンス）</div>
                                    <div className={`text-xs font-normal ${isInjuryRelated ? 'text-stone-500' : 'text-red-200'}`}>
                                        {isInjuryRelated
                                            ? '怪我が原因の場合は説得できません'
                                            : '「馬鹿野郎！お前の相撲はまだ終わっちゃいない！」'
                                        }
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Warning for Persuade */}
                        {!isInjuryRelated && (
                            <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3 text-center">
                                <p className="text-amber-200 text-xs">
                                    ⚠️ 説得に成功すると心がMAXになりますが、
                                    <strong className="text-amber-100">次場所で勝ち越せなければ強制引退</strong>
                                    となります。
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetirementConsultationModal;
