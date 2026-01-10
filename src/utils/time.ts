import { GamePhase } from '../types';

export const BASE_GAME_YEAR = 2024; // Year 1 = 2025

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
    const year = date.getFullYear();

    if (mode === 'tournament') {
        const dateStr = date.toLocaleDateString('ja-JP', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
        return `${year}年 ${dateStr}`;
    } else {
        // Week Format: 2025年 1月 第2週
        const month = date.getMonth() + 1;
        const week = getWeekNumber(date);
        return `${year}年 ${month}月 第${week}週`;
    }
};

export const getWeekId = (date: Date): string => {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
};

export const getWesternYearFromBashoId = (bashoId: string): number | null => {
    // 1. Try parsing "2025年..." format
    const matchJP = bashoId.match(/^(\d{4})年/);
    if (matchJP && matchJP[1]) {
        return parseInt(matchJP[1], 10);
    }

    // 2. Fallback to "Year X" format (Legacy)
    const match = bashoId.match(/Year\s+(\d+)/i);
    if (match && match[1]) {
        const gameYear = parseInt(match[1], 10);
        return BASE_GAME_YEAR + gameYear;
    }
    return null;
};
