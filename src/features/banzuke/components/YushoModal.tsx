
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
            {/* Main Card */}
            <div className="relative max-w-xl w-full bg-[#fcf9f2] rounded-sm shadow-2xl p-8 flex flex-col items-center border-[12px] border-[#b7282e] outline outline-4 outline-white outline-offset-[-14px]">

                {/* Corner Ornaments */}
                <div className="absolute top-2 left-2 w-16 h-16 border-t-[1px] border-l-[1px] border-[#b7282e] opacity-20 pointer-events-none"></div>
                <div className="absolute top-2 right-2 w-16 h-16 border-t-[1px] border-r-[1px] border-[#b7282e] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 w-16 h-16 border-b-[1px] border-l-[1px] border-[#b7282e] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-16 h-16 border-b-[1px] border-r-[1px] border-[#b7282e] opacity-20 pointer-events-none"></div>

                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-5xl font-black font-serif text-[#b7282e] mb-2 tracking-widest drop-shadow-sm">各段優勝</h2>
                    <div className="h-px w-32 bg-slate-300 mx-auto"></div>
                    <div className="text-slate-400 text-xs font-serif mt-2 tracking-[0.3em] uppercase">Championship Results</div>
                </div>

                {/* Winners List */}
                <div className="w-full space-y-4 mb-4">
                    {divisionOrder.map(div => {
                        const winner = winners[div];
                        if (!winner) return null;
                        const isPlayer = winner.heyaId === 'player_heya';
                        const isMakuuchi = div === 'Makuuchi';

                        return (
                            <div key={div} className={`
                                flex justify-between items-center py-3 border-b border-slate-200 border-dashed last:border-0
                                ${isMakuuchi ? 'py-6 border-slate-300 border-solid' : 'opacity-80'}
                            `}>
                                <div className="text-left flex items-center gap-4">
                                    <div className={`
                                        text-xs font-bold px-2 py-1 rounded-sm w-16 text-center
                                        ${isMakuuchi ? 'bg-[#b7282e] text-white' : 'bg-slate-100 text-slate-500'}
                                     `}>
                                        {divisionName(div)}
                                    </div>
                                    <div>
                                        <div className={`font-serif leading-none ${isMakuuchi ? 'text-3xl font-bold text-slate-900' : 'text-lg font-bold text-slate-700'}`}>
                                            {winner.name}
                                        </div>
                                        {isPlayer && <div className="text-[10px] text-amber-600 font-bold mt-1">あなたの部屋</div>}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={`font-mono font-bold leading-none ${isMakuuchi ? 'text-2xl text-[#b7282e]' : 'text-slate-600'}`}>
                                        {winner.currentBashoStats.wins}
                                        <span className="text-sm ml-0.5 text-slate-400">勝</span>
                                        {winner.currentBashoStats.losses}
                                        <span className="text-sm ml-0.5 text-slate-400">敗</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Stamp/Button */}
                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="group relative overflow-hidden bg-slate-900 text-white font-serif font-bold text-lg py-3 px-12 rounded-sm shadow-lg hover:shadow-xl hover:bg-[#b7282e] transition-all duration-300"
                    >
                        <span className="relative z-10">次へ</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default YushoModal;
