import React from 'react';
import { useSumoStore } from '../store/useSumoStore';
import { Play, RotateCcw } from 'lucide-react';

export const ControlPanel: React.FC = () => {
    const { currentDay, isBashoActive, startBasho, runNextDay, init } = useSumoStore();

    if (!isBashoActive) {
        return (
            <div className="flex justify-center p-4">
                <button 
                    onClick={startBasho}
                    className="bg-sumo-red text-white px-8 py-3 rounded text-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
                >
                    <Play size={24} />
                    本場所開始 (Start Basho)
                </button>
            </div>
        );
    }

    if (currentDay > 15) {
        return (
             <div className="flex flex-col items-center justify-center p-4 gap-4 bg-sumo-black text-white rounded-lg shadow-xl">
                <div className="text-2xl font-black">千秋楽 終了</div>
                <button 
                    onClick={init} // Reset for now
                    className="bg-white text-sumo-black px-6 py-2 rounded font-bold hover:bg-gray-200 flex items-center gap-2"
                >
                    <RotateCcw size={20} />
                    リセット (Reset)
                </button>
            </div>
        );
    }

    return (
        <div className="sticky bottom-4 z-50 flex justify-center w-full pointer-events-none">
            <div className="bg-sumo-paper/90 backdrop-blur border-2 border-sumo-black p-4 rounded-xl shadow-2xl pointer-events-auto flex gap-4 items-center">
                <div className="font-black text-3xl font-sumo min-w-[120px] text-center">
                    {currentDay}日目
                </div>
                <button 
                    onClick={runNextDay}
                    className="bg-sumo-black text-white px-8 py-4 rounded text-xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-transparent hover:border-sumo-gold"
                >
                    <Play size={24} fill="white" />
                    競技開始
                </button>
            </div>
        </div>
    );
};
