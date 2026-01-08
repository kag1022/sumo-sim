import React from 'react';
import { useGame } from '../../../context/GameContext';
import { EventType } from '../types';
import { useTranslation } from 'react-i18next';

export const EventModal: React.FC = () => {
    const { activeEvent, setActiveEvent, setFunds, setReputation, setWrestlers, addLog } = useGame();
    const { t } = useTranslation();

    if (!activeEvent) return null;

    // We need current reputation to update it safely if we can't use functional update
    const { reputation } = useGame();

    // Use applyEffects as the main handler
    const applyEffects = () => {
        if (activeEvent.effects) {
            const { funds, reputation: repChange, motivation } = activeEvent.effects;

            if (funds) setFunds(prev => prev + funds);
            if (repChange) setReputation(Math.max(0, Math.min(100, reputation + repChange)));
            if (motivation) {
                setWrestlers(prev => prev.map(w => {
                    let newMind = w.stats.mind;
                    let newStress = w.stress || 0;

                    if (motivation > 0) {
                        newMind = Math.min(w.potential, newMind + motivation);
                        newStress = Math.max(0, newStress - motivation);
                    } else {
                        newMind = Math.max(1, newMind + motivation);
                    }
                    return { ...w, stats: { ...w.stats, mind: newMind }, stress: newStress };
                }));
            }
        }
        addLog({
            key: 'log.event_log',
            params: { eventName: activeEvent.title },
            message: `【イベント】${t(activeEvent.title)}`, // fallback
            type: activeEvent.type === 'Bad' ? 'warning' : 'info'
        }, activeEvent.type === 'Bad' ? 'warning' : 'info');
        setActiveEvent(null);
    };

    // Styles based on Type
    const getStyles = (type: EventType) => {
        switch (type) {
            case 'Good': return {
                icon: '🎉',
                colorClass: 'text-amber-600',
                borderClass: 'border-amber-500',
                bgClass: 'bg-amber-50',
                btnClass: 'bg-amber-500 hover:bg-amber-400 text-white'
            };
            case 'Bad': return {
                icon: '⚠️',
                colorClass: 'text-slate-700',
                borderClass: 'border-slate-500',
                bgClass: 'bg-slate-100',
                btnClass: 'bg-slate-600 hover:bg-slate-500 text-white'
            };
            case 'Flavor': return {
                icon: '🍵',
                colorClass: 'text-green-700',
                borderClass: 'border-green-500',
                bgClass: 'bg-green-50',
                btnClass: 'bg-green-600 hover:bg-green-500 text-white'
            };
            case 'Special': return {
                icon: '👑',
                colorClass: 'text-purple-700',
                borderClass: 'border-purple-500',
                bgClass: 'bg-purple-50',
                btnClass: 'bg-purple-600 hover:bg-purple-500 text-white'
            };
        }
    };

    const style = getStyles(activeEvent.type);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-lg bg-[#fcf9f2] rounded-sm shadow-xl overflow-hidden border-t-4 ${style.borderClass} transform transition-all scale-100`}>

                {/* Header */}
                <div className={`p-6 text-center border-b border-slate-200 ${style.bgClass}`}>
                    <div className="text-4xl mb-4">{style.icon}</div>
                    <h2 className={`text-2xl font-serif font-bold ${style.colorClass}`}>
                        {t(activeEvent.title)}
                    </h2>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/50 rounded-full text-slate-600 border border-slate-200">
                        {activeEvent.type} EVENT
                    </span>
                </div>

                {/* Content */}
                <div className="p-8">
                    <p className="text-lg leading-relaxed text-slate-700 font-serif mb-8 text-center">
                        {t(activeEvent.description)}
                    </p>

                    {/* Effects Preview */}
                    {activeEvent.effects && (
                        <div className="bg-white p-4 rounded-sm border border-slate-100 mb-6 text-sm text-slate-600 space-y-1">
                            {activeEvent.effects.funds !== undefined && (
                                <div className="flex justify-between">
                                    <span>{t('ui.funds')}:</span>
                                    <span className={activeEvent.effects.funds > 0 ? 'text-red-700 font-bold' : 'text-slate-500'}>
                                        {activeEvent.effects.funds > 0 ? '+' : ''}{activeEvent.effects.funds.toLocaleString()}円
                                    </span>
                                </div>
                            )}
                            {activeEvent.effects.reputation !== undefined && (
                                <div className="flex justify-between">
                                    <span>{t('ui.reputation')}:</span>
                                    <span className={activeEvent.effects.reputation > 0 ? 'text-red-700 font-bold' : 'text-slate-500'}>
                                        {activeEvent.effects.reputation > 0 ? '+' : ''}{activeEvent.effects.reputation}
                                    </span>
                                </div>
                            )}
                            {activeEvent.effects.motivation !== undefined && (
                                <div className="flex justify-between">
                                    <span>{t('ui.motivation')}:</span>
                                    <span className={activeEvent.effects.motivation > 0 ? 'text-red-700 font-bold' : 'text-slate-500'}>
                                        {activeEvent.effects.motivation > 0 ? '上昇' : '低下'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={applyEffects}
                        className={`w-full py-3 rounded-sm font-bold shadow-md active:scale-95 transition-transform ${style.btnClass}`}
                    >
                        {t('cmd.confirm')}
                    </button>
                </div>
            </div>
        </div >
    );
};
