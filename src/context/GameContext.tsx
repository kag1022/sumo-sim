import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Wrestler, LogEntry, GamePhase, GameMode, Heya, Matchup, YushoRecord, SaveData } from '../types';
import { initializeGameData, InitialSettings } from '../utils/initialization';

// ... existing imports

interface GameState {
    currentDate: Date;
    funds: number;
    wrestlers: Wrestler[];
    heyas: Heya[];
    logs: LogEntry[];
    gamePhase: GamePhase; // Renamed from gameMode
    gameMode: GameMode; // New field for Establish/Inherit
    bashoFinished: boolean;
    yushoWinners: Record<string, Wrestler> | null;
    lastMonthBalance: number | null;
    isInitialized: boolean;
    oyakataName: string | null;
    okamiLevel: number;
    reputation: number;
    todaysMatchups: Matchup[];
    trainingPoints: number;
    yushoHistory: YushoRecord[];
    retiringQueue: Wrestler[];
    usedNames: string[];
}

interface GameContextProps extends GameState {
    setFunds: React.Dispatch<React.SetStateAction<number>>;
    setWrestlers: React.Dispatch<React.SetStateAction<Wrestler[]>>;
    setHeyas: React.Dispatch<React.SetStateAction<Heya[]>>;
    advanceDate: (days: number) => void;
    addLog: (message: string, type?: 'info' | 'warning' | 'error') => void;
    setGamePhase: (phase: GamePhase) => void;
    setGameMode: (mode: GameMode) => void; // New setter
    setBashoFinished: (finished: boolean) => void;
    setYushoWinners: (winners: Record<string, Wrestler> | null) => void;
    setLastMonthBalance: (amount: number) => void;
    startGame: (settings: InitialSettings) => void;
    loadGameData: (data: SaveData) => void;
    // Phase 19: Okami & Events
    okamiLevel: number;
    reputation: number;
    setOkamiLevel: (level: number) => void;
    setReputation: (rep: number) => void;
    todaysMatchups: Matchup[];
    setTodaysMatchups: React.Dispatch<React.SetStateAction<Matchup[]>>;
    setTrainingPoints: React.Dispatch<React.SetStateAction<number>>;
    setYushoHistory: React.Dispatch<React.SetStateAction<YushoRecord[]>>;
    setRetiringQueue: React.Dispatch<React.SetStateAction<Wrestler[]>>;
    usedNames: string[];
    registerName: (name: string) => void;
    isNameUsed: (name: string) => boolean;
    setUsedNames: React.Dispatch<React.SetStateAction<string[]>>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initial State
    const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 0, 1));
    const [funds, setFundsState] = useState<number>(0);
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [heyas, setHeyas] = useState<Heya[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [gamePhase, setGamePhase] = useState<GamePhase>('training');
    const [gameMode, setGameMode] = useState<GameMode>('Establish'); // Default
    const [bashoFinished, setBashoFinished] = useState<boolean>(false);
    const [yushoWinners, setYushoWinners] = useState<Record<string, Wrestler> | null>(null);
    const [lastMonthBalance, setLastMonthBalance] = useState<number | null>(null);

    // Init State
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [oyakataName, setOyakataName] = useState<string | null>(null);

    // Phase 19
    const [okamiLevel, setOkamiLevel] = useState<number>(1);
    const [reputation, setReputation] = useState<number>(50);
    const [todaysMatchups, setTodaysMatchups] = useState<Matchup[]>([]);
    const [trainingPoints, setTrainingPoints] = useState<number>(3);
    const [retiringQueue, setRetiringQueue] = useState<Wrestler[]>([]);
    const [usedNames, setUsedNames] = useState<string[]>([]);

    const registerName = (name: string) => {
        setUsedNames(prev => [...prev, name]);
    };

    const isNameUsed = (name: string): boolean => {
        return usedNames.includes(name);
    };

    const setFunds: React.Dispatch<React.SetStateAction<number>> = setFundsState;

    const startGame = (settings: InitialSettings) => {
        const data = initializeGameData(settings);
        setHeyas(data.heyas);
        setWrestlers(data.wrestlers);
        setFundsState(data.initialFunds);
        setOyakataName(settings.oyakataName);
        if (settings.mode) {
            setGameMode(settings.mode);
        }
        setIsInitialized(true);

        // Initialize usedNames registry
        if (data.usedNames) {
            setUsedNames(data.usedNames);
        }

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

    // History
    const [yushoHistory, setYushoHistory] = useState<YushoRecord[]>([]);

    const loadGameData = (data: SaveData) => {
        setCurrentDate(new Date(data.gameState.currentDate));
        setFundsState(data.gameState.funds);
        setIsInitialized(data.gameState.isInitialized);
        setOyakataName(data.gameState.oyakataName);
        setOkamiLevel(data.gameState.okamiLevel);
        setReputation(data.gameState.reputation);
        setTrainingPoints(data.gameState.trainingPoints);
        setGamePhase(data.gameState.gamePhase || (data.gameState as any).gameMode); // Compat
        // Check if gameMode exists (new save), else default to Establish or try to infer?
        setGameMode(data.gameState.gameMode || 'Establish');

        setBashoFinished(data.gameState.bashoFinished);
        setLastMonthBalance(data.gameState.lastMonthBalance);

        // Restore Arrays
        setWrestlers(data.wrestlers);
        setHeyas(data.heyas);
        setYushoHistory(data.yushoHistory);
        setLogs(data.logs);

        // usedNames: Reconstruct if missing (backwards compat)
        if (data.usedNames && data.usedNames.length > 0) {
            setUsedNames(data.usedNames);
        } else {
            // Rebuild from existing data
            const names = new Set<string>();
            data.wrestlers.forEach(w => names.add(w.name));
            data.yushoHistory.forEach(y => names.add(y.wrestlerName));
            setUsedNames(Array.from(names));
        }

        // Reset volatile state
        setTodaysMatchups([]);
        setYushoWinners(null);
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
            gamePhase,
            gameMode,
            bashoFinished,
            yushoWinners,
            setFunds,
            setWrestlers,
            setHeyas,
            advanceDate,
            addLog,
            setGamePhase,
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
            setReputation,
            todaysMatchups,
            setTodaysMatchups,
            trainingPoints,
            setTrainingPoints,
            loadGameData,
            yushoHistory,
            setYushoHistory,
            retiringQueue,
            setRetiringQueue,
            usedNames,
            registerName,
            isNameUsed,
            setUsedNames
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
