import React, { useState } from 'react';
import { Candidate } from '../types';
import { getGrade } from '../utils/scouting';
import { useGame } from '../context/GameContext'; // To get prefix if needed, or pass prop

interface ScoutPanelProps {
    candidates: Candidate[];
    funds: number;
    currentCount: number;
    limit: number;
    onRecruit: (candidate: Candidate, customName?: string) => void;
    onInspect: (cost: number) => void; // New callback for paying inspection fee
    onClose: () => void;
}

const ScoutPanel: React.FC<ScoutPanelProps> = ({ candidates, funds, currentCount, limit, onRecruit, onInspect, onClose }) => {
    // Modal State
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isExamining, setIsExamining] = useState(false);
    const [examPassed, setExamPassed] = useState(false);
    const [customName, setCustomName] = useState('');
    const INSPECTION_FEE = 300000;

    const { heyas } = useGame();
    const playerHeya = heyas.find(h => h.id === 'player_heya');
    const stablePrefix = playerHeya ? playerHeya.shikonaPrefix : '';

    const handleInspectClick = (candidate: Candidate) => {
        if (funds < INSPECTION_FEE) return;

        // Pay Fee
        onInspect(INSPECTION_FEE);

        // Start Exam UI
        setIsExamining(true);
        setSelectedCandidate(candidate);
        setCustomName(candidate.name); // Default

        // Simulate Exam Delay
        setTimeout(() => {
            setExamPassed(true);
        }, 1500);
    };

    const handleConfirmJoin = () => {
        if (selectedCandidate) {
            onRecruit(selectedCandidate, customName);
            // Reset
            setSelectedCandidate(null);
            setIsExamining(false);
            setExamPassed(false);
        }
    };

    const handleCancel = () => {
        // Just close modal, but fee is already paid (invested).
        // Player chose not to recruit after seeing stats.
        setSelectedCandidate(null);
        setIsExamining(false);
        setExamPassed(false);
    };

    const getFlexibilityText = (val: number, revealed: boolean) => {
        if (!revealed) return "未測定";
        if (val >= 80) return "非常に柔らかい (怪我しにくい)";
        if (val >= 60) return "柔軟性あり";
        if (val >= 40) return "普通";
        return "体が硬そうだ... (怪我注意)";
    };

    const renderPotential = (val: number, revealed: boolean, large: boolean = false) => {
        if (!revealed) return <span className="text-slate-400 font-bold">???</span>;
        const grade = getGrade(val);
        let color = "text-slate-500";
        if (grade === 'S') color = "text-amber-500";
        if (grade === 'A') color = "text-red-500";
        if (grade === 'B') color = "text-blue-500";
        return <span className={`font-bold ${color} ${large ? 'text-4xl' : 'text-xl'}`}>{grade}</span>;
    };

    // --- Modal Content (Revealed Info) ---
    const renderModal = () => {
        if (!selectedCandidate) return null;

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-500/30">
                    {!examPassed ? (
                        <div className="p-12 text-center">
                            <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4">新弟子検査中...</h3>
                            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-500 animate-pulse">体格・健康状態を確認しています</p>
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                            {/* Header */}
                            <div className="bg-amber-500 p-4 text-center">
                                <h3 className="text-2xl font-black text-white tracking-widest">合格</h3>
                                <div className="text-white/80 text-xs font-bold mt-1">NEW DISCIPLE</div>
                            </div>

                            <div className="p-8">
                                <div className="text-center mb-6">
                                    <h4 className="text-slate-500 text-sm font-bold mb-1">
                                        {selectedCandidate.background} / {selectedCandidate.age}歳
                                    </h4>
                                    <div className="flex justify-center gap-6 text-slate-700 font-mono font-bold mb-4">
                                        <span>{selectedCandidate.height}cm</span>
                                        <span>{selectedCandidate.weight}kg</span>
                                    </div>

                                    {/* NOW REVEALED STATS */}
                                    <div className="flex justify-center items-center gap-2 mb-2">
                                        <span className="text-sm font-bold text-slate-400">素質</span>
                                        {renderPotential(selectedCandidate.potential, true, true)}
                                    </div>
                                    <div className="flex justify-center items-center gap-2 mb-4 text-sm text-slate-600">
                                        <span>柔軟性: {getFlexibilityText(selectedCandidate.flexibility, true)}</span>
                                    </div>

                                    <p className="text-xs text-slate-400">
                                        来場所まで「前相撲」として修行します。
                                    </p>
                                </div>

                                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                        四股名 (Shikona)
                                        <span className="ml-2 text-amber-600 font-normal normal-case">
                                            ※当部屋の冠文字は「{stablePrefix}」です
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 font-serif font-bold text-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-center"
                                        placeholder="例: 朝青龍"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 py-3 px-4 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        今は入門させない
                                    </button>
                                    <button
                                        onClick={handleConfirmJoin}
                                        disabled={!customName}
                                        className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        入門を許可する
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            {isExamining && renderModal()}

            <div className="bg-[#fcf9f2] w-full max-w-5xl h-[90vh] rounded shadow-2xl overflow-hidden flex flex-col border border-stone-600">
                {/* Header */}
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold font-serif">新弟子検査・スカウト</h2>
                        <p className="text-xs opacity-70">Recruit Inspection & Scouting</p>
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
                                const canAffordFee = funds >= INSPECTION_FEE;
                                const isFull = currentCount >= limit;
                                // In Global List, stats are HIDDEN.
                                const isRevealed = false;

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
                                                            {c.name} (候補)
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm text-slate-600 flex gap-4 font-mono font-bold">
                                                    <span>{c.height}cm</span>
                                                    <span>{c.weight}kg</span>
                                                    <span>{c.age}歳</span>
                                                </div>
                                            </div>

                                            {/* Stats Grid (HIDDEN) */}
                                            <div className="space-y-3 bg-slate-50 p-3 rounded">
                                                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                                    <span className="text-sm font-bold text-slate-500">素質</span>
                                                    {renderPotential(c.potential, isRevealed)}
                                                </div>
                                                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                                    <span className="text-sm font-bold text-slate-500">柔軟性</span>
                                                    <span className={`text-sm font-bold text-slate-400`}>
                                                        {getFlexibilityText(c.flexibility, isRevealed)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-1">
                                                    <span className="text-sm font-bold text-slate-500">初期能力</span>
                                                    <div className="text-xs font-mono space-x-2 text-slate-400">
                                                        <span>未測定</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Action */}
                                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                            <div className="font-mono font-bold text-lg text-slate-700">
                                                {c.scoutCost > 0 ? c.scoutCost.toLocaleString() : '???'}<span className="text-xs ml-1">円</span>
                                                <div className="text-[10px] text-slate-400 font-normal">移籍/契約金</div>
                                            </div>
                                            <button
                                                onClick={() => handleInspectClick(c)}
                                                disabled={!canAffordFee || isFull}
                                                className={`
                                                    px-4 py-2 rounded font-bold shadow-sm transition-all text-sm
                                                    ${!canAffordFee || isFull
                                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                                                    }
                                                `}
                                            >
                                                {isFull ? '満員' : !canAffordFee ? '資金不足' : `検査を行う (¥${INSPECTION_FEE.toLocaleString()})`}
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
