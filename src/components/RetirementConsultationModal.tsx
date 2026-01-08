import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wrestler } from '../types';
import { formatRank } from '../utils/formatting';
import { useGame } from '../context/GameContext';

interface RetirementConsultationModalProps {
    wrestler: Wrestler;
    onAccept: () => void;
    onPersuade: () => void;
}

const PERSUADE_COST = 50;

/**
 * Identify Dialogue Key based on Reason
 */
const getDialogueKey = (reason: string | undefined): { key: string; emoji: string } => {
    if (!reason) return { key: 'default', emoji: '😔' };
    if (reason.includes('Injury') || reason.includes('怪我')) return { key: 'injury', emoji: '🩹' };
    if (reason.includes('Age') || reason.includes('高齢')) return { key: 'age', emoji: '👴' };
    if (reason.includes('Yokozuna') || reason.includes('Ozeki') || reason.includes('Dignity')) return { key: 'dignity', emoji: '🎌' };
    return { key: 'limit', emoji: '😞' }; // Performance issues
};

/**
 * Retirement Consultation Modal
 * Theme: "Solemn Night" (Dark, intimate atmosphere)
 */
export const RetirementConsultationModal: React.FC<RetirementConsultationModalProps> = ({
    wrestler,
    onAccept,
    onPersuade
}) => {
    const { t } = useTranslation();
    const { trainingPoints, setTrainingPoints } = useGame();

    // Internal State for Persuasion Process
    const [status, setStatus] = useState<'idle' | 'praying' | 'success' | 'failed'>('idle');

    const { key, emoji } = getDialogueKey(wrestler.retirementReason);
    const isInjuryRelated = wrestler.retirementReason?.includes('Injury');

    // Base Persuasion Chance Logic
    // Base 30% + (Mind * 0.5)% 
    // Injured: -20% penalty
    const persuasionChance = Math.min(95, Math.max(5,
        30 + (wrestler.stats.mind * 0.5) - (isInjuryRelated ? 20 : 0)
    ));

    const handlePersuadeClick = () => {
        if (trainingPoints < PERSUADE_COST) return;

        setTrainingPoints(prev => prev - PERSUADE_COST);
        setStatus('praying');

        // Suspense timing
        setTimeout(() => {
            const roll = Math.random() * 100;
            const isSuccess = roll < persuasionChance;

            if (isSuccess) {
                setStatus('success');
                // Auto close after success animation
                setTimeout(() => {
                    onPersuade();
                }, 2000);
            } else {
                setStatus('failed');
            }
        }, 2000);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/95 z-[100] backdrop-blur-md transition-opacity duration-1000">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]"></div>

            {/* Ambient Particles (CSS only for now) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping"></div>
                <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/10 rounded-full animate-ping delay-1000"></div>
            </div>

            <div className="relative max-w-2xl w-full mx-4 overflow-hidden flex flex-col items-center animate-fadeInSlow transition-all duration-500">

                {/* Visual Feedback for Status */}
                {status === 'praying' && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-pulse">
                        <div className="text-6xl mb-4">🙏</div>
                        <div className="text-stone-300 font-serif tracking-widest text-lg">説得中...</div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-sm animate-fadeIn">
                        <div className="text-8xl mb-4 animate-bounce">🔥</div>
                        <div className="text-white font-black font-serif tracking-widest text-3xl drop-shadow-lg">説得成功！</div>
                        <div className="text-red-200 mt-2 font-serif">もう一度、土俵へ。</div>
                    </div>
                )}

                {/* Main Content (Blurred if success/praying, but visible if failed for user to accept result) */}
                <div className={`flex flex-col items-center w-full transition-all duration-500 ${status === 'success' ? 'opacity-0 scale-95' : 'opacity-100'}`}>

                    {/* Status: FAILED Overlay special handling */}
                    {status === 'failed' && (
                        <div className="w-full bg-stone-900/90 border-l-4 border-stone-600 p-4 mb-6 shadow-2xl animate-shake">
                            <p className="text-stone-400 font-serif text-center">
                                「親方の気持ちは嬉しいですが...私の意思は変わりません。」
                            </p>
                        </div>
                    )}

                    {/* Wrestler Image / Icon */}
                    <div className="mb-8 relative group">
                        <div className={`w-32 h-32 bg-stone-800 rounded-full border-2 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 relative overflow-hidden transition-colors duration-700
                             ${status === 'failed' ? 'border-stone-700 grayscale opacity-70' : 'border-stone-600'}
                        `}>
                            <span className="text-5xl opacity-80 mix-blend-overlay">{emoji}</span>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        </div>
                        {status !== 'failed' && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-900/20 rounded-full blur-3xl pointer-events-none"></div>
                        )}
                    </div>

                    {/* Name & Rank */}
                    <div className="text-center mb-8 z-10">
                        <div className="text-stone-500 font-serif font-bold tracking-widest text-sm mb-2">
                            {status === 'failed' ? '引退の決意は固い...' : t(`retirement.dialogue.${key}.title`)}
                        </div>
                        <h2 className="text-4xl font-black font-serif text-stone-200 mb-2 tracking-tight">
                            {wrestler.name}
                        </h2>
                        <div className="flex justify-center items-center gap-3">
                            <span className="px-2 py-0.5 border border-stone-600 text-stone-400 text-xs font-serif rounded-sm">
                                {formatRank(wrestler.rank, wrestler.rankSide, wrestler.rankNumber)}
                            </span>
                            <span className="text-stone-500 text-xs">
                                {t('retirement.highest_rank', { rank: formatRank(wrestler.maxRank) })}
                            </span>
                        </div>
                    </div>

                    {/* Dialogue */}
                    {status === 'idle' && (
                        <div className="w-full bg-gradient-to-r from-transparent via-stone-900/80 to-transparent p-6 mb-10 relative z-10 border-y border-stone-800">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-stone-600 text-4xl font-serif">❝</div>
                            <p className="text-stone-300 text-xl font-serif leading-loose text-center italic tracking-wide">
                                {t(`retirement.dialogue.${key}.message`)}
                            </p>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-stone-600 text-4xl font-serif">❞</div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg z-10">
                        {/* Persuade Button (Hide if failed) */}
                        {status === 'idle' && (
                            <button
                                onClick={handlePersuadeClick}
                                disabled={isInjuryRelated || trainingPoints < PERSUADE_COST}
                                className={`flex-1 group relative overflow-hidden p-1 rounded-sm transition-all duration-500
                                    ${(isInjuryRelated || trainingPoints < PERSUADE_COST) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
                                `}
                            >
                                <div className={`absolute inset-0 transition-opacity bg-gradient-to-b ${isInjuryRelated ? 'from-stone-800 to-stone-900' : 'from-[#b7282e] to-[#8c1c22]'}`}></div>
                                <div className="relative bg-stone-950/90 h-full p-6 flex flex-col items-center justify-center text-center group-hover:bg-opacity-0 transition-all duration-500 border border-white/5 group-hover:border-transparent">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-2xl group-hover:scale-110 transition-transform">🔥</div>
                                    </div>
                                    <div className={`font-bold font-serif text-lg mb-1 leading-none ${isInjuryRelated ? 'text-stone-500' : 'text-red-500 group-hover:text-white'}`}>
                                        {t('retirement.actions.persuade')}
                                    </div>
                                    <div className="text-xs font-mono font-bold text-amber-500 mt-2 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900/50">
                                        COST: {PERSUADE_COST} TP
                                    </div>
                                    <div className={`text-[10px] mt-2 ${isInjuryRelated ? 'text-stone-600' : 'text-stone-400 group-hover:text-white/80'}`}>
                                        成功率: {Math.floor(persuasionChance)}%
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Accept Button */}
                        <button
                            onClick={onAccept}
                            className={`flex-1 group relative overflow-hidden p-1 rounded-sm transition-all duration-500 hover:scale-[1.02] ${status === 'failed' ? 'w-full ring-2 ring-stone-500' : ''}`}
                        >
                            <div className="absolute inset-0 bg-stone-700"></div>
                            <div className="relative bg-stone-900 h-full p-6 flex flex-col items-center justify-center text-center group-hover:bg-stone-800 transition-colors border border-stone-600">
                                <div className="text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all">🍶</div>
                                <div className="font-bold font-serif text-lg text-stone-300 mb-1 group-hover:text-white">
                                    {status === 'failed' ? 'わかりました。断髪式の準備を。' : t('retirement.actions.accept')}
                                </div>
                                {status !== 'failed' && (
                                    <div className="text-[10px] text-stone-500 group-hover:text-stone-400">
                                        {t('retirement.actions.accept_sub')}
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Warning / TP Info */}
                    {status === 'idle' && !isInjuryRelated && (
                        <div className="mt-8 text-center bg-transparent z-10 flex flex-col items-center gap-2">
                            {trainingPoints < PERSUADE_COST && (
                                <p className="text-xs text-red-400 font-bold bg-red-950/30 px-3 py-1 rounded border border-red-900/50">
                                    指導ポイント(TP)が足りません (残: {trainingPoints})
                                </p>
                            )}
                            <p className="text-[10px] text-stone-600">
                                ※失敗すると即座に引退が確定します
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RetirementConsultationModal;
