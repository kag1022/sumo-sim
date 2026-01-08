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


export const exportSaveData = (data: SaveData): void => {
    try {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Filename: sumo_save_YYYYMMDD_HHMM.json
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const filename = `sumo_save_${yyyy}${mm}${dd}_${hh}${min}.json`;

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Save data exported:', filename);
    } catch (error) {
        console.error('Failed to export save data:', error);
        alert('セーブデータのエクスポートに失敗しました。');
    }
};

export const importSaveData = async (file: File): Promise<SaveData | null> => {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result !== 'string') {
                    throw new Error('Invalid file content');
                }

                const data = JSON.parse(result) as SaveData;

                // Simple validation
                if (!data.version || !data.gameState || !data.wrestlers) {
                    throw new Error('Invalid save data format');
                }

                resolve(data);
            } catch (error) {
                console.error('Failed to parse save file:', error);
                alert('セーブデータの読み込みに失敗しました。ファイルが破損しているか、形式が異なります。');
                resolve(null);
            }
        };

        reader.onerror = () => {
            console.error('Failed to read file');
            resolve(null);
        };

        reader.readAsText(file);
    });
};

export const clearSave = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};
