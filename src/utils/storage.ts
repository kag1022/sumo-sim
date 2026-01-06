import { SaveData } from '../types';

const STORAGE_KEY = 'sumo_sim_save_v1';
const CURRENT_VERSION = 1;

export const saveGame = (data: SaveData): void => {
    try {
        const json = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, json);
        console.log('Game saved successfully at', new Date(data.timestamp).toLocaleTimeString());
    } catch (error) {
        console.error('Failed to save game:', error);
        // Could handle quota exceeded error here
    }
};

export const loadGame = (): SaveData | null => {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) return null;

        const data = JSON.parse(json) as SaveData;

        // Version check or migration could go here
        if (data.version !== CURRENT_VERSION) {
            console.warn(`Save data version mismatch. Expected ${CURRENT_VERSION}, got ${data.version}`);
            // Simple logic: Load anyway for now, or migrate
        }

        return data;
    } catch (error) {
        console.error('Failed to load game:', error);
        return null;
    }
};

export const hasSaveData = (): boolean => {
    return !!localStorage.getItem(STORAGE_KEY);
};

export const clearSave = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};
