
import React from 'react';
import { getOkamiUpgradeCost, MAX_OKAMI_LEVEL } from '../logic/okami';
import { saveGame as saveToStorage, loadGame as loadFromStorage, exportSaveData, importSaveData, clearSave } from '../../../utils/storage';
import { useGame } from '../../../context/GameContext';

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
    const [activeTab, setActiveTab] = React.useState<'okami' | 'facility' | 'settings' | 'system'>('okami');
    const { getSaveData, loadGameData, autoRecruitAllowed, setAutoRecruitAllowed } = useGame();
    // Typescript might complain about require if not configured, but let's assume standard import at top of file is better.
    // I will add imports at the top of the file in a separate edit or assume they exist. 
    // Actually, I can't add imports with replace_file_content in the middle.
    // I will use fully qualified logic or expect the user to add imports? 
    // No, I should replace the whole component or add imports first. 
    // Let's modify the imports first in a separate Step? 
    // Or I can add the imports to the top of this block if I am replacing the whole file? 
    // I am replacing a chunk. I will blindly add the logic and then fix imports if needed?
    // "replace_file_content" can track line numbers. 
    // Let's assume I can't easily add imports here. 
    // I will add the UI logic here and then add imports in the next step.

    // ... wait, I can just include the logic inline if I had the imports.
    // Let's stick to the plan: Modify UI.

    // Handlers
    const handleQuickSave = () => {
        const data = getSaveData();
        saveToStorage(data);
        alert('セーブ完了しました (Saved)');
    };

    const handleQuickLoad = () => {
        if (!window.confirm('現在の進行状況を破棄して、前回のセーブデータをロードしますか？')) return;
        const data = loadFromStorage();
        if (data) {
            loadGameData(data);
            alert('ロードしました (Loaded)');
            onClose();
        } else {
            alert('セーブデータが見つかりません');
        }
    };

    const handleExport = () => {
        const data = getSaveData();
        exportSaveData(data);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm('現在の進行状況を破棄して、ファイルをロードしますか？')) {
            e.target.value = ''; // Reset input
            return;
        }

        const data = await importSaveData(file);
        if (data) {
            loadGameData(data);
            alert('ファイルからロードしました');
            onClose();
        }
        e.target.value = '';
    };

    const handleReset = () => {
        if (window.confirm('【警告】全てのデータを消去して最初から始めますか？\nこの操作は取り消せません。')) {
            if (window.confirm('本当によろしいですか？')) {
                clearSave();
                window.location.reload(); // Hard reload is safest for full reset
            }
        }
    };

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
            <div className="bg-[#fcf9f2] w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col border-[6px] border-slate-800 relative">
                {/* ... Header & Layout ... */}

                {/* Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

                {/* Header: Noren / Signboard Style */}
                <div className="bg-slate-800 p-6 flex justify-between items-start shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#b7282e] z-10"></div>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/japanese-sayagata.png')]"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-black font-serif text-white tracking-widest mb-1">部屋経営</h2>
                        <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
                            <span className="w-4 h-px bg-white/30"></span>
                            Stable Management
                            <span className="w-4 h-px bg-white/30"></span>
                        </div>
                    </div>

                    <button onClick={onClose} className="relative z-10 text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                        ✕
                    </button>
                </div>

                {/* Ledger / Financial Summary */}
                <div className="bg-white border-b-2 border-slate-200 border-dashed p-6 relative z-10 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CURRENT FUNDS</div>
                        <div className={`font-mono font-bold text-3xl tracking-tight leading-none ${funds < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            ¥{funds.toLocaleString()}
                        </div>
                    </div>
                    {lastMonthBalance !== null && (
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">LAST MONTH</div>
                            <div className={`font-mono font-bold text-xl leading-none ${lastMonthBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {lastMonthBalance >= 0 ? '+' : ''}{lastMonthBalance.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-6 gap-2 shrink-0 bg-[#fcf9f2]">
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 relative overflow-hidden group
                            ${activeTab === 'okami' ? 'text-[#b7282e] border-[#b7282e] bg-red-50' : 'text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'}
                        `}
                        onClick={() => setActiveTab('okami')}
                    >
                        女将さん (Okami)
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 relative overflow-hidden group
                            ${activeTab === 'facility' ? 'text-blue-700 border-blue-600 bg-blue-50' : 'text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'}
                        `}
                        onClick={() => setActiveTab('facility')}
                    >
                        施設 (Facilities)
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 relative overflow-hidden group
                            ${activeTab === 'settings' ? 'text-slate-800 border-slate-800 bg-slate-100' : 'text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'}
                        `}
                        onClick={() => setActiveTab('settings')}
                    >
                        設定 (Settings)
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 relative overflow-hidden group
                            ${activeTab === 'system' ? 'text-purple-800 border-purple-800 bg-purple-50' : 'text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'}
                        `}
                        onClick={() => setActiveTab('system')}
                    >
                        システム (System)
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 pb-10 flex-1 overflow-y-auto custom-scrollbar relative">

                    {activeTab === 'okami' && (
                        <div className="animate-fadeIn space-y-6">
                            {/* ... Okami Content ... */}
                            <div className="flex items-start gap-6">
                                {/* Level Badge */}
                                <div className="hidden sm:flex flex-col items-center justify-center w-24 h-24 bg-white border-4 border-double border-red-100 rounded-full shadow-md shrink-0">
                                    <span className="text-[10px] text-red-300 font-bold uppercase">LEVEL</span>
                                    <span className="text-4xl font-black font-serif text-[#b7282e]">{okamiLevel}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold font-serif text-slate-800 mb-2">女将さんの手腕</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed bg-white/50 p-4 rounded-sm border border-slate-100">
                                        女将さんのレベルが高いほど、力士のケアや部屋の運営効率が向上します。
                                        ストレス解消効果や、タニマチとの関係構築に影響を与えます。
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 my-4"></div>

                            {!isMaxOkami ? (
                                <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="font-bold text-slate-700">次のレベルへ強化</div>
                                        <div className="font-bold text-[#b7282e] font-mono text-xl">
                                            ¥{okamiUpgradeCost?.toLocaleString()}
                                        </div>
                                    </div>
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
                                            w-full py-4 rounded-sm font-bold shadow-md transition-all flex justify-center items-center gap-2
                                            ${canAffordOkami
                                                ? 'bg-[#b7282e] text-white hover:bg-[#a02027] active:scale-[0.98]'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                                        `}
                                    >
                                        <span>承認する (Approve)</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 text-center border-2 border-dashed border-amber-300 bg-amber-50 rounded-sm">
                                    <div className="text-2xl mb-2">🌸</div>
                                    <div className="font-bold text-amber-800">最高レベル到達</div>
                                    <div className="text-xs text-amber-600 mt-1">これ以上の強化は必要ありません</div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'facility' && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 text-blue-900 text-sm leading-relaxed mb-6">
                                <span className="font-bold mr-1">💡 設備投資:</span>
                                稽古場の環境を改善することで、所属力士全員の自然成長率（基礎トレーニング効果）が永続的に向上します。
                            </div>

                            {/* Current Status */}
                            <div className="flex items-center justify-between mb-8 px-2">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">CURRENT</div>
                                    <div className="text-xl font-bold font-serif text-slate-800">{FACILITY_LEVELS[currentHeyaLevel - 1]?.name || '不明'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">EFFECT</div>
                                    <div className="font-mono font-bold text-xl text-blue-700">x{FACILITY_LEVELS[currentHeyaLevel - 1]?.mod}</div>
                                </div>
                            </div>

                            {/* Upgrade Option */}
                            {nextFacility && !isMaxFacility ? (
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-blue-500 rounded-sm blur opacity-20 group-hover:opacity-40 transition"></div>
                                    <div className="relative bg-white p-6 rounded-sm shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-sm mb-1 uppercase">UPGRADE TO</span>
                                                <h4 className="text-lg font-bold font-serif text-slate-900">{nextFacility.name}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-xl text-slate-800">¥{nextFacility.cost.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
                                            <span>成長補正:</span>
                                            <span className="font-bold text-slate-400 line-through">x{FACILITY_LEVELS[currentHeyaLevel - 1]?.mod}</span>
                                            <span>→</span>
                                            <span className="font-bold text-blue-600 text-lg">x{nextFacility.mod}</span>
                                        </div>

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
                                                w-full py-4 rounded-sm font-bold shadow-md transition-all flex justify-center items-center gap-2
                                                ${canAffordFacility
                                                    ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.98]'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                                            `}
                                        >
                                            工務店に発注する
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center border border-slate-200 bg-slate-50 text-slate-400 font-serif">
                                    全ての施設改修が完了しました
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="font-bold font-serif text-lg text-slate-800 mb-1">新弟子自動スカウト</div>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            場所終了時、引退等で人数不足になった際に、自動的に新弟子（前相撲）を入門させます。
                                            <br className="mb-1" />
                                            <span className="text-amber-600">※自分で厳選したい場合はOFFにしてください。</span>
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={autoRecruitAllowed}
                                            onChange={(e) => setAutoRecruitAllowed(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#b7282e]"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="text-center text-xs text-slate-400 mt-8">
                                Game Version 0.2.1
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="animate-fadeIn space-y-8">

                            {/* Quick Save/Load */}
                            <section>
                                <h3 className="font-bold font-serif text-lg text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-600 rounded-sm"></span>
                                    データの保存・読込 (Quick Save)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleQuickSave}
                                        className="bg-white border border-slate-200 hover:border-purple-400 hover:text-purple-700 text-slate-600 font-bold py-4 px-4 rounded-sm shadow-sm transition-all flex flex-col items-center gap-2"
                                    >
                                        <span className="text-2xl">💾</span>
                                        <span>セーブ (Save)</span>
                                    </button>
                                    <button
                                        onClick={handleQuickLoad}
                                        className="bg-white border border-slate-200 hover:border-purple-400 hover:text-purple-700 text-slate-600 font-bold py-4 px-4 rounded-sm shadow-sm transition-all flex flex-col items-center gap-2"
                                    >
                                        <span className="text-2xl">📂</span>
                                        <span>ロード (Load)</span>
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-center">
                                    ブラウザのローカルストレージに保存されます
                                </p>
                            </section>

                            {/* Backup (File) */}
                            <section>
                                <h3 className="font-bold font-serif text-lg text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-sm"></span>
                                    バックアップ (File Backup)
                                </h3>
                                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm space-y-4">
                                    <button
                                        onClick={handleExport}
                                        className="w-full bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold py-3 px-4 rounded-sm border border-blue-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>📥</span>
                                        <span>ファイルに書き出し (Export JSON)</span>
                                    </button>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImport}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <button className="w-full bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold py-3 px-4 rounded-sm border border-slate-300 transition-colors flex items-center justify-center gap-2">
                                            <span>📤</span>
                                            <span>ファイルを読み込み (Import JSON)</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        セーブデータをJSONファイルとしてダウンロードしたり、別の端末で遊んでいたデータを読み込むことができます。
                                    </p>
                                </div>
                            </section>

                            <div className="border-t border-slate-200"></div>

                            {/* Reset */}
                            <section>
                                <button
                                    onClick={handleReset}
                                    className="w-full bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 font-bold py-4 px-4 rounded-sm border border-red-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>⚠️</span>
                                    <span>データを完全に削除してリセット</span>
                                </button>
                            </section>

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ManagementModal;
