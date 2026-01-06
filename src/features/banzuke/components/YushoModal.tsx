import React from 'react';
import { Wrestler } from '../../../types';

interface YushoModalProps {
    winners: Record<string, Wrestler>;
    onClose: () => void;
}

const YushoModal: React.FC<YushoModalProps> = ({ winners, onClose }) => {
    if (!winners) return null;

    const divisionOrder = ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'];

    // Helper for Division Name
    const divisionName = (div: string) => {
        const names: Record<string, string> = {
            'Makuuchi': '幕内', 'Juryo': '十両', 'Makushita': '幕下',
            'Sandanme': '三段目', 'Jonidan': '序二段', 'Jonokuchi': '序ノ口'
        };
        return names[div] || div;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white/10 border border-amber-500/50 rounded-xl p-6 max-w-2xl w-full text-center relative overflow-hidden shadow-[0_0_100px_rgba(255,215,0,0.3)] flex flex-col max-h-[90vh]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

                <div className="mb-4">
                    <h2 className="text-4xl font-serif font-bold text-amber-400 drop-shadow-md">各段優勝</h2>
                    <div className="text-white/60 text-sm font-mono mt-1">CHAMPIONSHIP RESULTS</div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 px-2">
                    {divisionOrder.map(div => {
                        const winner = winners[div];
                        if (!winner) return null;
                        const isPlayer = winner.heyaId === 'player_heya';

                        return (
                            <div key={div} className={`
                                flex justify-between items-center p-4 rounded-lg
                                ${div === 'Makuuchi' ? 'bg-amber-500/20 border border-amber-500/50 mb-4 scale-105' : 'bg-white/5 border border-white/10'}
                                ${isPlayer ? 'bg-red-900/40 border-red-500/50' : ''}
                            `}>
                                <div className="text-left">
                                    <div className="text-xs text-amber-200/80 font-bold mb-1">{divisionName(div)}</div>
                                    <div className="text-2xl font-black font-serif text-white leading-none">{winner.name}</div>
                                    <div className="text-xs text-white/50 mt-1">{winner.rank} | {isPlayer ? '貴方の部屋' : '他部屋'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-mono font-bold text-amber-400">
                                        {winner.currentBashoStats.wins}勝{winner.currentBashoStats.losses}敗
                                    </div>
                                    {div === 'Makuuchi' && <div className="text-xs text-amber-200">🏆 優勝</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8">
                    <button onClick={onClose} className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-12 rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95 text-xl">
                        次へ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default YushoModal;
