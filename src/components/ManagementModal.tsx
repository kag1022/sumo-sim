import React from 'react';
import { getOkamiUpgradeCost, MAX_OKAMI_LEVEL } from '../utils/okami';

interface ManagementModalProps {
    okamiLevel: number;
    funds: number;
    lastMonthBalance: number | null;
    onUpgradeOkami: () => void;
    onClose: () => void;
}

const ManagementModal: React.FC<ManagementModalProps> = ({ okamiLevel, funds, lastMonthBalance, onUpgradeOkami, onClose }) => {
    const upgradeCost = getOkamiUpgradeCost(okamiLevel);
    const canAfford = upgradeCost !== null && funds >= upgradeCost;
    const isMaxLevel = okamiLevel >= MAX_OKAMI_LEVEL;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden flex flex-col border-t-4 border-[#8c1c22] animate-fadeIn">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-2xl font-bold font-serif text-slate-800">部屋経営</h2>
                        <p className="text-xs text-slate-500">Stable Management</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* Financial Status */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">財務状況 (Financials)</h3>
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-slate-600 font-bold">現在の資金</span>
                                <span className="text-2xl font-mono font-bold text-slate-800">¥ {funds.toLocaleString()}</span>
                            </div>
                            {lastMonthBalance !== null && (
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                                    <span className="text-slate-500">先月の収支</span>
                                    <span className={`font-mono font-bold ${lastMonthBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {lastMonthBalance >= 0 ? '+' : ''}{lastMonthBalance.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Okami Management */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">女将さん (Okami-san)</h3>
                            <span className="bg-[#8c1c22] text-white text-xs font-bold px-2 py-1 rounded">Lv.{okamiLevel}</span>
                        </div>

                        <div className="bg-amber-50 p-4 rounded border border-amber-100 mb-4">
                            <p className="text-sm text-amber-900 leading-relaxed">
                                女将さんの手腕レベルです。レベルを上げると、日々のストレス解消効果（ちゃんこ・ケア）が高まり、毎月の経費削減や不祥事対策にも効果を発揮します。
                            </p>
                        </div>

                        {!isMaxLevel ? (
                            <button
                                onClick={() => {
                                    if (canAfford) {
                                        if (window.confirm(`女将レベルを強化しますか？\n費用: ¥${upgradeCost?.toLocaleString()}`)) {
                                            onUpgradeOkami();
                                        }
                                    } else {
                                        alert('資金が不足しています');
                                    }
                                }}
                                disabled={!canAfford}
                                className={`
                                    w-full py-3 rounded font-bold text-sm shadow-sm transition-all flex justify-between items-center px-6
                                    ${canAfford
                                        ? 'bg-gradient-to-r from-[#8c1c22] to-[#a02027] hover:from-[#a02027] hover:to-[#b7282e] text-white active:scale-[0.98]'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                `}
                            >
                                <span>女将レベル強化</span>
                                <span className="font-mono">
                                    費用: ¥{upgradeCost?.toLocaleString()}
                                </span>
                            </button>
                        ) : (
                            <div className="w-full py-3 rounded font-bold text-sm text-center border-2 border-amber-400 text-amber-600 bg-white">
                                女将レベル MAX (これ以上の強化はできません)
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ManagementModal;
