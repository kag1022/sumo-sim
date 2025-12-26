import { create } from 'zustand';
import { Rikishi } from '../logic/types';
import { generateMockRikishi } from '../logic/rikishi';
import { simulateDay, DailyLog } from '../logic/basho';

interface SumoState {
  rikishis: Rikishi[];
  currentDay: number;
  isBashoActive: boolean;
  dayResults: DailyLog | null; // Latest logic
  init: () => void;
  runNextDay: () => void;
  startBasho: () => void;
}

export const useSumoStore = create<SumoState>((set, get) => ({
  rikishis: [],
  currentDay: 1,
  isBashoActive: false,
  dayResults: null,
  
  init: () => {
    const data = generateMockRikishi();
    data.sort((a, b) => b.banzukePoint - a.banzukePoint);
    set({ rikishis: data, currentDay: 1, isBashoActive: false, dayResults: null });
  },

  startBasho: () => {
      // Reset Basho stats? Or assumes already reset (start of app).
      // For now, simple start.
      set({ isBashoActive: true, currentDay: 1, dayResults: null });
  },

  runNextDay: () => {
    const { rikishis, currentDay } = get();
    if (currentDay > 15) return;

    const results = simulateDay(currentDay, rikishis);
    
    // Update State
    // Create new array reference for React reactivity
    set({ 
        rikishis: [...rikishis], 
        dayResults: results,
        currentDay: currentDay + 1 
    });
  }
}));
