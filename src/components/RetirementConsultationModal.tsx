
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
            title: '進退伺い',
            emoji: '😔',
            message: '親方…私は、ここが潮時だと思うのです。'
        };
    }

    if (reason.includes('Injury') || reason.includes('怪我')) {
        return {
            title: '気力と体の限界',
            emoji: '🩹',
            message: '親方…体がもう悲鳴を上げています。これ以上は土俵に上がれません…'
        };
    }

    if (reason.includes('Age') || reason.includes('高齢')) {
        return {
            title: '世代交代の時',
            emoji: '👴',
            message: '親方…気力が続きません。若い者に道を譲る時が来ました。潮時です。'
        };
    }

    if (reason.includes('Yokozuna') || reason.includes('Ozeki') || reason.includes('Dignity')) {
        return {
            title: '品格を守るために',
            emoji: '🎌',
            message: '親方、これ以上は名折れです。横綱として、潔く散らせてください。'
        };
    }

    // Default - performance issues
    return {
        title: '自身の限界',
        emoji: '😞',
        message: '親方…これ以上ご迷惑をおかけできません。引退させてください。'
    };
};

/**
 * 引退相談モーダル
 * Theme: "Solemn Night" (Dark, intimate atmosphere)
 */
export const RetirementConsultationModal: React.FC<RetirementConsultationModalProps> = ({
    wrestler,
    onAccept,
    onPersuade
}) => {
    const dialogue = getDialogue(wrestler.retirementReason);
    const isInjuryRelated = wrestler.retirementReason?.includes('Injury');

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/95 z-[100] backdrop-blur-md transition-opacity duration-1000">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]"></div>

            <div className="relative max-w-2xl w-full mx-4 overflow-hidden flex flex-col items-center animate-fadeInSlow">

                {/* Wrestler Image / Icon */}
                <div className="mb-8 relative group">
                    <div className="w-32 h-32 bg-stone-800 rounded-full border-2 border-stone-600 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 relative overflow-hidden">
                        <span className="text-5xl opacity-80 grayscale mix-blend-overlay">🙇</span>
                        {/* Shadow overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-900/20 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                {/* Name & Rank */}
                <div className="text-center mb-10 z-10">
                    <div className="text-stone-500 font-serif font-bold tracking-widest text-sm mb-2">{dialogue.title}</div>
                    <h2 className="text-4xl font-black font-serif text-stone-200 mb-2 tracking-tight">
                        {wrestler.name}
                    </h2>
                    <div className="flex justify-center items-center gap-3">
                        <span className="px-2 py-0.5 border border-stone-600 text-stone-400 text-xs font-serif rounded-sm">
                            {formatRank(wrestler.rank, wrestler.rankSide, wrestler.rankNumber)}
                        </span>
                        <span className="text-stone-500 text-xs">
                            (最高位: {formatRank(wrestler.maxRank)})
                        </span>
                    </div>
                </div>

                {/* Dialogue "Cinema Style" */}
                <div className="w-full bg-gradient-to-r from-transparent via-stone-900/80 to-transparent p-8 mb-12 relative z-10 border-y border-stone-800">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-stone-600 text-4xl font-serif">❝</div>
                    <p className="text-stone-300 text-xl font-serif leading-loose text-center italic tracking-wide">
                        {dialogue.message}
                    </p>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-stone-600 text-4xl font-serif">❞</div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg z-10">
                    {/* Persuade (Left for Drama) */}
                    <button
                        onClick={onPersuade}
                        disabled={isInjuryRelated}
                        className={`flex-1 group relative overflow-hidden p-1 rounded-sm transition-all duration-500
                             ${isInjuryRelated ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.02]'}
                        `}
                    >
                        {/* Button Background */}
                        <div className={`absolute inset-0 transition-opacity bg-gradient-to-b ${isInjuryRelated ? 'from-stone-800 to-stone-900' : 'from-[#b7282e] to-[#8c1c22]'}`}></div>

                        <div className="relative bg-stone-950/90 h-full p-6 flex flex-col items-center justify-center text-center group-hover:bg-opacity-0 transition-all duration-500 border border-white/5 group-hover:border-transparent">
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔥</div>
                            <div className={`font-bold font-serif text-lg mb-1 ${isInjuryRelated ? 'text-stone-500' : 'text-red-500 group-hover:text-white'}`}>
                                慰留する
                            </div>
                            <div className={`text-[10px] ${isInjuryRelated ? 'text-stone-600' : 'text-stone-400 group-hover:text-white/80'}`}>
                                {isInjuryRelated ? '怪我が理由の為不可' : '「まだやれるはずだ」'}
                            </div>
                        </div>
                    </button>

                    {/* Accept (Right for Closure) */}
                    <button
                        onClick={onAccept}
                        className="flex-1 group relative overflow-hidden p-1 rounded-sm transition-all duration-500 hover:scale-[1.02]"
                    >
                        <div className="absolute inset-0 bg-stone-700"></div>
                        <div className="relative bg-stone-900 h-full p-6 flex flex-col items-center justify-center text-center group-hover:bg-stone-800 transition-colors border border-stone-600">
                            <div className="text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all">🍶</div>
                            <div className="font-bold font-serif text-lg text-stone-300 mb-1 group-hover:text-white">
                                引退を認める
                            </div>
                            <div className="text-[10px] text-stone-500 group-hover:text-stone-400">
                                「ご苦労だった」
                            </div>
                        </div>
                    </button>
                </div>

                {/* Warning Text */}
                {!isInjuryRelated && (
                    <div className="mt-8 text-center animate-pulse z-10">
                        <p className="text-[10px] text-amber-900/60 font-bold bg-amber-500/10 px-4 py-1 rounded-full border border-amber-900/20">
                            ※慰留に成功しても、次場所で負け越すと強制引退となります
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RetirementConsultationModal;
