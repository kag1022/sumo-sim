import React from 'react';
import { useGame } from '../../../context/GameContext';
import { EventType } from '../types';
import { useTranslation } from 'react-i18next';
import { Sun, CloudLightning, Coffee, Crown } from 'lucide-react';

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
                    // If targetWrestlerId is set, only apply to that wrestler
                    if (activeEvent.targetWrestlerId && w.id !== activeEvent.targetWrestlerId) {
                        return w;
                    }

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
            params: { eventName: t(activeEvent.title, activeEvent.params) },
            message: `【イベント】${t(activeEvent.title, activeEvent.params)}`, // fallback
            type: activeEvent.type === 'Bad' ? 'warning' : 'info'
        }, activeEvent.type === 'Bad' ? 'warning' : 'info');
        setActiveEvent(null);
    };

    // Styles based on Type
    const getStyles = (type: EventType) => {
        switch (type) {
            case 'Good': return {
                Icon: Sun,
                headerBg: 'bg-[#b45309]', // Amber 700
                headerPattern: 'bg-pattern-seigaiha',
                borderColor: 'border-[#b45309]', // Amber 700
                accentColor: 'text-[#92400e]', // Amber 800
                iconColor: 'text-[#d97706]', // Amber 600
                btnClass: 'bg-[#b45309] hover:bg-[#92400e] text-white shadow-md border-b-4 border-[#78350f]'
            };
            case 'Bad': return {
                Icon: CloudLightning,
                headerBg: 'bg-[#334155]', // Slate 700
                headerPattern: 'bg-pattern-yagasuri',
                borderColor: 'border-[#334155]', // Slate 700
                accentColor: 'text-[#1e293b]', // Slate 800
                iconColor: 'text-[#475569]', // Slate 600
                btnClass: 'bg-[#334155] hover:bg-[#1e293b] text-white shadow-md border-b-4 border-[#0f172a]'
            };
            case 'Flavor': return {
                Icon: Coffee,
                headerBg: 'bg-[#15803d]', // Green 700
                headerPattern: 'bg-pattern-seigaiha',
                borderColor: 'border-[#15803d]', // Green 700
                accentColor: 'text-[#14532d]', // Green 900
                iconColor: 'text-[#16a34a]', // Green 600
                btnClass: 'bg-[#15803d] hover:bg-[#14532d] text-white shadow-md border-b-4 border-[#14532d]'
            };
            case 'Special': return {
                Icon: Crown,
                headerBg: 'bg-[#7e22ce]', // Purple 700
                headerPattern: 'bg-pattern-yagasuri',
                borderColor: 'border-[#7e22ce]', // Purple 700
                accentColor: 'text-[#581c87]', // Purple 900
                iconColor: 'text-[#9333ea]', // Purple 600
                btnClass: 'bg-[#7e22ce] hover:bg-[#581c87] text-white shadow-md border-b-4 border-[#581c87]'
            };
        }
    };

    const style = getStyles(activeEvent.type);
    const IconComponent = style.Icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className={`relative w-full max-w-xl bg-[#fcf9f2] rounded-sm shadow-2xl overflow-hidden border-4 ${style.borderColor} transform transition-all scale-100`}>

                {/* Decorative textures */}
                <div className="absolute inset-0 bg-pattern-washi opacity-50 pointer-events-none"></div>

                {/* Header Banner */}
                <div className={`relative h-24 ${style.headerBg} ${style.headerPattern} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Kamon Icon (Floating) */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                    <div className={`w-24 h-24 rounded-full bg-[#fcf9f2] border-4 ${style.borderColor} flex items-center justify-center shadow-lg z-10`}>
                        <div className={`w-20 h-20 rounded-full border-2 border-dotted ${style.borderColor} flex items-center justify-center bg-white`}>
                            <IconComponent className={`w-12 h-12 ${style.iconColor}`} strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Event Type Label (Vertical Text) */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/90 px-2 py-3 shadow-sm border border-slate-200 rounded-sm">
                        <span className={`block text-xs font-bold font-serif writing-vertical-rl tracking-widest ${style.accentColor}`}>
                            {t(`event.types.${activeEvent.type}`)}
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="pt-16 pb-8 px-8 text-center relative z-0">
                    <h2 className={`text-3xl font-serif font-black mb-6 border-b-2 border-dotted pb-4 ${style.accentColor} border-current opacity-80 inline-block`}>
                        {t(activeEvent.title, activeEvent.params)}
                    </h2>

                    <p className="text-lg leading-loose text-slate-800 font-serif mb-8 whitespace-pre-wrap">
                        {t(activeEvent.description, activeEvent.params)}
                    </p>

                    {/* Effects Card (Woodblock style) */}
                    {activeEvent.effects && (
                        <div className="bg-[#fffbf0] p-5 rounded-sm border border-[#e2d5b5] shadow-inner mb-8 mx-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50"></div>


                            <div className="space-y-3 relative z-10">
                                {activeEvent.effects.funds !== undefined && (
                                    <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2 last:border-0">
                                        <span className="font-serif text-slate-500 text-sm">{t('ui.funds')}</span>
                                        <span className={`font-mono text-xl font-bold ${activeEvent.effects.funds > 0 ? 'text-[#b91c1c]' : 'text-slate-700'}`}>
                                            {activeEvent.effects.funds > 0 ? '+' : ''}{activeEvent.effects.funds.toLocaleString()}
                                            <span className="text-xs ml-1 text-slate-500 font-serif">円</span>
                                        </span>
                                    </div>
                                )}
                                {activeEvent.effects.reputation !== undefined && (
                                    <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2 last:border-0">
                                        <span className="font-serif text-slate-500 text-sm">{t('ui.reputation')}</span>
                                        <span className={`font-mono text-xl font-bold ${activeEvent.effects.reputation > 0 ? 'text-[#b91c1c]' : 'text-slate-700'}`}>
                                            {activeEvent.effects.reputation > 0 ? '▲' : '▼'} {Math.abs(activeEvent.effects.reputation)}
                                        </span>
                                    </div>
                                )}
                                {activeEvent.effects.motivation !== undefined && (
                                    <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2 last:border-0">
                                        <span className="font-serif text-slate-500 text-sm">{t('ui.motivation')}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-sm ${activeEvent.effects.motivation > 0 ? 'bg-[#b91c1c]' : 'bg-slate-500'}`}>
                                                {activeEvent.effects.motivation > 0 ? '気力充実' : '意気消沈'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={applyEffects}
                        className={`w-full py-4 rounded-md font-bold text-lg tracking-widest transition-all transform active:translate-y-1 ${style.btnClass}`}
                    >
                        {t('cmd.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};
