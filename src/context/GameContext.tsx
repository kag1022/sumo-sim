import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Wrestler, LogEntry, GameMode, Heya } from '../types';
import { initializeGameData, InitialSettings } from '../utils/initialization';

// ... existing imports

interface GameState {
    currentDate: Date;
    funds: number;
    wrestlers: Wrestler[];
    heyas: Heya[];
    logs: LogEntry[];
    gameMode: GameMode;
    bashoFinished: boolean;
    yushoWinners: Record<string, Wrestler> | null;
    lastMonthBalance: number | null;
    isInitialized: boolean;
    oyakataName: string | null;
    okamiLevel: number;
    reputation: number;
}

interface GameContextProps extends GameState {
    setFunds: React.Dispatch<React.SetStateAction<number>>;
    setWrestlers: React.Dispatch<React.SetStateAction<Wrestler[]>>;
    setHeyas: React.Dispatch<React.SetStateAction<Heya[]>>;
    advanceDate: (days: number) => void;
    addLog: (message: string, type?: 'info' | 'warning' | 'error') => void;
    setGameMode: (mode: GameMode) => void;
    setBashoFinished: (finished: boolean) => void;
    setYushoWinners: (winners: Record<string, Wrestler> | null) => void;
    setLastMonthBalance: (amount: number) => void;
    startGame: (settings: InitialSettings) => void;
    // Phase 19: Okami & Events
    okamiLevel: number;
    reputation: number;
    setOkamiLevel: (level: number) => void;
    setReputation: (rep: number) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initial State
    const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 0, 1));
    const [funds, setFundsState] = useState<number>(0);
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [heyas, setHeyas] = useState<Heya[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [gameMode, setGameMode] = useState<GameMode>('training');
    const [bashoFinished, setBashoFinished] = useState<boolean>(false);
    const [yushoWinners, setYushoWinners] = useState<Record<string, Wrestler> | null>(null);
    const [lastMonthBalance, setLastMonthBalance] = useState<number | null>(null);

    // Init State
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [oyakataName, setOyakataName] = useState<string | null>(null);

    // Phase 19
    const [okamiLevel, setOkamiLevel] = useState<number>(1);
    const [reputation, setReputation] = useState<number>(50);

    const setFunds: React.Dispatch<React.SetStateAction<number>> = setFundsState;

    const startGame = (settings: InitialSettings) => {
        const data = initializeGameData(settings);
        setHeyas(data.heyas);
        setWrestlers(data.wrestlers);
        setFundsState(data.initialFunds);
        setOyakataName(settings.oyakataName);
        setIsInitialized(true);

        // Initial Log
        const entry: LogEntry = {
            id: crypto.randomUUID(),
            date: currentDate.toLocaleDateString('ja-JP'),
            message: `親方就任おめでとうございます！${settings.stableName}の歴史がここから始まります。`,
            type: 'info',
        };
        setLogs([entry]);
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
            heyas,
            logs,
            gameMode,
            bashoFinished,
            yushoWinners,
            setFunds,
            setWrestlers,
            setHeyas,
            advanceDate,
            addLog,
            setGameMode,
            setBashoFinished,
            setYushoWinners,
            lastMonthBalance,
            setLastMonthBalance,
            isInitialized,
            oyakataName,
            startGame,
            okamiLevel,
            reputation,
            setOkamiLevel,
            setReputation
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
