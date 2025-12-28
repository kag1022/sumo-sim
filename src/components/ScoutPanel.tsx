import React from 'react';
import { Candidate, Wrestler } from '../types';
import { getGrade } from '../utils/scouting';
import { formatRank } from '../utils/formatting';

interface ScoutPanelProps {
    candidates: Candidate[];
    funds: number;
    currentCount: number;
    limit: number;
    onRecruit: (candidate: Candidate) => void;
    onClose: () => void;
}

const ScoutPanel: React.FC<ScoutPanelProps> = ({ candidates, funds, currentCount, limit, onRecruit, onClose }) => {

    const getFlexibilityText = (val: number, revealed: boolean) => {
        if (!revealed) return "不明";
        if (val >= 80) return "非常に柔らかい (怪我しにくい)";
        if (val >= 60) return "柔軟性あり";
        if (val >= 40) return "普通";
        return "体が硬そうだ... (怪我注意)";
    };

    const renderPotential = (val: number, revealed: boolean) => {
        if (!revealed) return <span className="text-slate-400 font-bold">???</span>;
        const grade = getGrade(val);
        let color = "text-slate-500";
        if (grade === 'S') color = "text-amber-500";
        if (grade === 'A') color = "text-red-500";
        if (grade === 'B') color = "text-blue-500";
        return <span className={`font-bold ${color} text-xl`}>{grade}</span>;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#fcf9f2] w-full max-w-5xl h-[90vh] rounded shadow-2xl overflow-hidden flex flex-col border border-stone-600">
                {/* Header */}
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold font-serif">新弟子スカウト</h2>
                        <p className="text-xs opacity-70">New Recruit Scouting</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm">所持金</div>
                        <div className={`font-mono font-bold text-xl ${funds < 0 ? 'text-red-300' : 'text-amber-300'}`}>
                            {funds.toLocaleString()} <span className="text-sm text-white">円</span>
                        </div>
                        <div className="text-xs mt-1">
                            所属人数: {currentCount} / {limit}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-100">
                    {candidates.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 font-bold text-lg">
                            今週のスカウト候補はいません。来週をお待ちください。
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {candidates.map(c => {
                                const canAfford = funds >= c.scoutCost;
                                const isFull = currentCount >= limit;
                                const isRevealedPot = c.revealedStats.includes('potential');
                                const isRevealedFlex = c.revealedStats.includes('flexibility');

                                return (
                                    <div key={c.id} className="bg-white rounded-lg shadow-md border-t-8 border-slate-700 overflow-hidden flex flex-col group hover:shadow-xl transition-shadow">
                                        <div className="p-4 flex-1">
                                            {/* Header Info */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="inline-block bg-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded mb-1 font-bold">
                                                            {c.background}
                                                        </span>
                                                        <h3 className="text-2xl font-bold font-serif text-slate-900 leading-tight">
                                                            {c.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm text-slate-600 flex gap-4 font-mono font-bold">
                                                    <span>{c.height}cm</span>
                                                    <span>{c.weight}kg</span>
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="space-y-3 bg-slate-50 p-3 rounded">
                                                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                                    <span className="text-sm font-bold text-slate-500">素質 (Potential)</span>
                                                    {renderPotential(c.potential, isRevealedPot)}
                                                </div>
                                                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                                    <span className="text-sm font-bold text-slate-500">柔軟性</span>
                                                    <span className={`text-sm font-bold ${!isRevealedFlex ? 'text-slate-400' : 'text-slate-800'}`}>
                                                        {getFlexibilityText(c.flexibility, isRevealedFlex)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-1">
                                                    <span className="text-sm font-bold text-slate-500">初期能力</span>
                                                    <div className="text-xs font-mono space-x-2 text-slate-700">
                                                        <span>心{c.stats.mind}</span>
                                                        <span>技{c.stats.technique}</span>
                                                        <span>体{c.stats.body}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Action */}
                                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                            <div className="font-mono font-bold text-lg text-slate-700">
                                                {c.scoutCost.toLocaleString()}<span className="text-xs ml-1">円</span>
                                            </div>
                                            <button
                                                onClick={() => onRecruit(c)}
                                                disabled={!canAfford || isFull}
                                                className={`
                                                    px-6 py-2 rounded font-bold shadow-sm transition-all
                                                    ${!canAfford || isFull
                                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                        : 'bg-[#b7282e] text-white hover:bg-[#a01f25] active:scale-95'
                                                    }
                                                `}
                                            >
                                                {isFull ? '満員' : !canAfford ? '資金不足' : '採用する'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-stone-200 border-t border-stone-300 text-center shrink-0">
                    <button onClick={onClose} className="font-bold text-slate-600 hover:text-slate-900 hover:underline">
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoutPanel;
