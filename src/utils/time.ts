import { GamePhase } from '../types';

export const formatDateJP = (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    });
};

export const getWeekNumber = (date: Date): number => {
    const day = date.getDate();
    return Math.floor((day - 1) / 7) + 1;
};

export const formatHybridDate = (date: Date, mode: GamePhase): string => {
    if (mode === 'tournament') {
        return date.toLocaleDateString('ja-JP', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
    } else {
        // Week Format: 1月 第2週
        const month = date.getMonth() + 1;
        const week = getWeekNumber(date);
        return `${month}月 第${week}週`;
    }
};
