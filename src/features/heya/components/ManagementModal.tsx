import React from 'react';
import { getOkamiUpgradeCost, MAX_OKAMI_LEVEL } from '../logic/okami';

interface ManagementModalProps {
    okamiLevel: number;
    funds: number;
    lastMonthBalance: number | null;
    onUpgradeOkami: () => void;
    currentHeyaLevel: number;
    onUpgradeFacility: (targetLevel: number, cost: number, newMod: number) => void;
    onClose: () => void;
}

const FACILITY_LEVELS = [
    { level: 1, name: '青空土俵', mod: 1.0, cost: 0 },
    { level: 2, name: '屋内土俵', mod: 1.1, cost: 5000000 },
    { level: 3, name: '基礎器具充実', mod: 1.2, cost: 20000000 },
    { level: 4, name: '近代的ジム', mod: 1.3, cost: 80000000 },
    { level: 5, name: 'スポーツ科学研究所', mod: 1.5, cost: 300000000 }
];

const ManagementModal: React.FC<ManagementModalProps> = ({
    okamiLevel, funds, lastMonthBalance, onUpgradeOkami, currentHeyaLevel, onUpgradeFacility, onClose
}) => {
    const [activeTab, setActiveTab] = React.useState<'okami' | 'facility'>('okami');

    // Okami Logic
    const okamiUpgradeCost = getOkamiUpgradeCost(okamiLevel);
    const canAffordOkami = okamiUpgradeCost !== null && funds >= okamiUpgradeCost;
    const isMaxOkami = okamiLevel >= MAX_OKAMI_LEVEL;

    // Facility Logic
    const nextFacility = FACILITY_LEVELS.find(f => f.level === currentHeyaLevel + 1);
    const canAffordFacility = nextFacility ? funds >= nextFacility.cost : false;
    const isMaxFacility = currentHeyaLevel >= 5;

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

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        className={`flex-1 py-3 text-sm font-bold ${activeTab === 'okami' ? 'text-[#8c1c22] border-b-2 border-[#8c1c22]' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('okami')}
                    >
                        女将さん (Okami)
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-bold ${activeTab === 'facility' ? 'text-[#8c1c22] border-b-2 border-[#8c1c22]' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('facility')}
                    >
                        施設 (Facilities)
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Financial Status */}
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

                    {activeTab === 'okami' && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">女将レベル</h3>
                                <span className="bg-[#8c1c22] text-white text-xs font-bold px-2 py-1 rounded">Lv.{okamiLevel}</span>
                            </div>

                            <div className="bg-amber-50 p-4 rounded border border-amber-100 mb-4">
                                <p className="text-sm text-amber-900 leading-relaxed">
                                    女将さんの手腕レベルです。レベルを上げると、日々のストレス解消効果（ちゃんこ・ケア）が高まり、毎月の経費削減や不祥事対策にも効果を発揮します。
                                </p>
                            </div>

                            {!isMaxOkami ? (
                                <button
                                    onClick={() => {
                                        if (canAffordOkami && okamiUpgradeCost) {
                                            if (window.confirm(`女将レベルを強化しますか？\n費用: ¥${okamiUpgradeCost.toLocaleString()}`)) {
                                                onUpgradeOkami();
                                            }
                                        } else {
                                            alert('資金が不足しています');
                                        }
                                    }}
                                    disabled={!canAffordOkami}
                                    className={`
                                        w-full py-3 rounded font-bold text-sm shadow-sm transition-all flex justify-between items-center px-6
                                        ${canAffordOkami
                                            ? 'bg-gradient-to-r from-[#8c1c22] to-[#a02027] hover:from-[#a02027] hover:to-[#b7282e] text-white active:scale-[0.98]'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                    `}
                                >
                                    <span>女将レベル強化</span>
                                    <span className="font-mono">費用: ¥{okamiUpgradeCost?.toLocaleString()}</span>
                                </button>
                            ) : (
                                <div className="w-full py-3 rounded font-bold text-sm text-center border-2 border-amber-400 text-amber-600 bg-white">
                                    女将レベル MAX
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'facility' && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">現在の施設</h3>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-800">{FACILITY_LEVELS[currentHeyaLevel - 1]?.name || '不明'}</span>
                                    <span className="text-xs text-slate-500">Lv.{currentHeyaLevel} (成長補正 x{FACILITY_LEVELS[currentHeyaLevel - 1]?.mod})</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded border border-blue-100 mb-4">
                                <p className="text-sm text-blue-900 leading-relaxed">
                                    稽古場の設備レベルです。施設を強化すると、所属する全力士の自動成長（Passive Growth）の効果が高まります。
                                </p>
                            </div>

                            {nextFacility && !isMaxFacility ? (
                                <button
                                    onClick={() => {
                                        if (canAffordFacility) {
                                            if (window.confirm(`${nextFacility.name} に改装しますか？\n費用: ¥${nextFacility.cost.toLocaleString()}\n補正: x${nextFacility.mod}`)) {
                                                onUpgradeFacility(nextFacility.level, nextFacility.cost, nextFacility.mod);
                                            }
                                        } else {
                                            alert('資金が不足しています');
                                        }
                                    }}
                                    disabled={!canAffordFacility}
                                    className={`
                                        w-full py-3 rounded font-bold text-sm shadow-sm transition-all flex justify-between items-center px-6
                                        ${canAffordFacility
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white active:scale-[0.98]'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                    `}
                                >
                                    <div>
                                        <div className="text-left font-bold">改装: {nextFacility.name}</div>
                                        <div className="text-left text-xs opacity-90">成長補正 x{nextFacility.mod} へ</div>
                                    </div>
                                    <span className="font-mono">¥{nextFacility.cost.toLocaleString()}</span>
                                </button>
                            ) : (
                                <div className="w-full py-3 rounded font-bold text-sm text-center border-2 border-blue-400 text-blue-600 bg-white">
                                    施設レベル MAX (世界最高峰の環境です)
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ManagementModal;
