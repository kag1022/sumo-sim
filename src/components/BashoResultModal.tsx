import React from 'react';
import { Wrestler } from '../types';
import { formatRank } from '../utils/formatting';

interface BashoResultModalProps {
    wrestlers: Wrestler[];
    onClose: () => void;
}

const BashoResultModal: React.FC<BashoResultModalProps> = ({ wrestlers, onClose }) => {
    // Show Top 50 or those with changes?
    // 940 wrestlers is too many to show all. 
    // Show user's wrestler? (Currently User controls ALL?)
    // Sim seems to imply "Stable Management" but we see ALL wrestlers.
    // For Modal, let's show "Promotion/Demotion" highlights + Sekitori results.
    // Filter to top 50 (Makuuchi + part of Juryo)?

    // Let's show Makuuchi + Juryo (Sekitori) mainly.
    const displayWrestlers = wrestlers.filter(w => w.isSekitori || w.currentBashoStats.wins === 7); // Sekitori + Perfect Makushita

    const getChangeStatus = (w: Wrestler) => {
        if (w.history.length === 0) return 'neutral';
        const lastBasho = w.history[0];
        const [oldRankStr, scoreStr] = lastBasho.split(' ');

        // Old rank string is generic "Makushita". We don't know if they were Sekitori easily without parsing.
        // Approx: "Was Sekitori" check.
        const wasSekitori = ['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira', 'Juryo'].includes(oldRankStr);
        const isSekitori = w.isSekitori;

        if (isSekitori && !wasSekitori) return 'promotion';
        if (!isSekitori && wasSekitori) return 'demotion';

        if (scoreStr) {
            const [wins, losses] = scoreStr.split('-').map(Number);
            if (wins > losses) return 'kachikoshi';
            if (losses > wins) return 'makekoshi';
        }
        return 'neutral';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#fcf9f2] w-full max-w-4xl max-h-[90vh] rounded shadow-2xl overflow-hidden flex flex-col border border-stone-600">
                {/* Header */}
                <div className="bg-[#b7282e] text-white p-6 text-center shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/japanese-sayagata.png')] opacity-20"></div>
                    <h2 className="text-3xl font-bold font-serif tracking-widest relative z-10 text-shadow-md">
                        本場所結果発表
                    </h2>
                    <p className="text-sm opacity-80 mt-2 font-serif tracking-wider relative z-10">
                        Tournament Results & Banzuke Update
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayWrestlers.map(w => {
                            const status = getChangeStatus(w);
                            const lastHistory = w.history[0] || "";

                            let borderClass = "border-slate-200";
                            let bgClass = "bg-white";
                            let statusBadge = null;

                            if (status === 'promotion') {
                                borderClass = "border-amber-400 border-2";
                                bgClass = "bg-amber-50";
                                statusBadge = <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-xs font-bold px-2 py-1 rounded shadow animate-pulse">昇進！</span>;
                            } else if (status === 'demotion') {
                                borderClass = "border-blue-200 border-2";
                                bgClass = "bg-slate-50";
                                statusBadge = <span className="absolute top-2 right-2 bg-slate-600 text-white text-xs font-bold px-2 py-1 rounded shadow">陥落...</span>;
                            } else if (status === 'kachikoshi') {
                                borderClass = "border-red-200";
                                statusBadge = <span className="absolute top-2 right-2 text-red-600 text-[10px] font-bold border border-red-200 px-1 rounded">勝ち越し</span>;
                            } else if (status === 'makekoshi') {
                                statusBadge = <span className="absolute top-2 right-2 text-blue-600 text-[10px] font-bold border border-blue-200 px-1 rounded">負け越し</span>;
                            }

                            return (
                                <div key={w.id} className={`relative p-4 rounded shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02] ${bgClass} ${borderClass}`}>
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-inner flex-shrink-0 ${w.isSekitori ? 'bg-gradient-to-br from-amber-200 to-amber-500 text-amber-900' : 'bg-slate-200 text-slate-500'}`}>
                                        {w.name[0]}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] text-slate-500 mb-0.5 font-bold truncate">
                                            {formatRank(w.rank, w.rankSide, w.rankNumber)}
                                        </div>
                                        <div className="font-bold font-serif text-base leading-tight truncate">{w.name}</div>
                                        <div className="text-sm font-mono mt-1 text-slate-700 font-bold">
                                            {lastHistory.split(' ')[1] || "-"}
                                        </div>
                                    </div>
                                    {statusBadge}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-stone-100 border-t border-stone-200 text-center shrink-0">
                    <p className="text-sm text-stone-500 mb-4 font-serif">
                        新たな番付が発表されました。来場所に向けて精進しましょう。
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-[#b7282e] hover:bg-[#a01f25] text-white font-bold py-3 px-12 rounded shadow-lg transition-transform active:scale-95 text-lg"
                    >
                        次の場所に向けて稽古を開始する
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BashoResultModal;
