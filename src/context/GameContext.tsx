import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Wrestler, LogEntry, GameMode } from '../types';

interface GameState {
    currentDate: Date;
    funds: number;
    wrestlers: Wrestler[];
    logs: LogEntry[];
    gameMode: GameMode;
    bashoFinished: boolean; // Flag to show result modal
}

interface GameContextProps extends GameState {
    setFunds: (amount: number) => void;
    setWrestlers: (wrestlers: Wrestler[]) => void;
    advanceDate: (days: number) => void;
    addLog: (message: string, type?: 'info' | 'warning' | 'error') => void;
    setGameMode: (mode: GameMode) => void;
    setBashoFinished: (finished: boolean) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initial State
    const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 0, 1)); // Jan 1, 2025
    const [funds, setFundsState] = useState<number>(3000000); // 3,000,000 JPY
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [gameMode, setGameMode] = useState<GameMode>('training');
    const [bashoFinished, setBashoFinished] = useState<boolean>(false);

    const setFunds = (amount: number) => {
        setFundsState(amount);
    };

    const advanceDate = (days: number) => {
        setCurrentDate((prev) => {
            const next = new Date(prev);
            next.setDate(next.getDate() + days);
            return next;
        });
    };

    const addLog = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
        const entry: LogEntry = {
            id: crypto.randomUUID(),
            date: currentDate.toLocaleDateString('ja-JP'),
            message,
            type,
        };
        setLogs((prev) => [entry, ...prev]);
    };

    return (
        <GameContext.Provider value={{
            currentDate,
            funds,
            wrestlers,
            logs,
            gameMode,
            bashoFinished,
            setFunds,
            setWrestlers,
            advanceDate,
            addLog,
            setGameMode,
            setBashoFinished,
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
