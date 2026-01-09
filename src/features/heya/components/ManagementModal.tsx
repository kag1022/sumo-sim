
import React, { useMemo } from 'react';
import { getOkamiUpgradeCost, MAX_OKAMI_LEVEL } from '../logic/okami';
import { saveGame as saveToStorage, loadGame as loadFromStorage, exportSaveData, importSaveData, clearSave } from '../../../utils/storage';
import { useGame } from '../../../context/GameContext';
import { Flower, Save, FolderOpen, Download, Upload, AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ManagementModalProps {
    okamiLevel: number;
    funds: number;
    lastMonthBalance: number | null;
    onUpgradeOkami: () => void;
    currentHeyaLevel: number;
    onUpgradeFacility: (targetLevel: number, cost: number, newMod: number) => void;
    onClose: () => void;
}

const ManagementModal: React.FC<ManagementModalProps> = ({
    okamiLevel, funds, lastMonthBalance, onUpgradeOkami, currentHeyaLevel, onUpgradeFacility, onClose
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = React.useState<'okami' | 'facility' | 'settings' | 'system'>('okami');
    const { getSaveData, loadGameData, autoRecruitAllowed, setAutoRecruitAllowed } = useGame();

    const FACILITY_LEVELS = useMemo(() => [
        { level: 1, name: t('management.facility.levels.1'), mod: 1.0, cost: 0 },
        { level: 2, name: t('management.facility.levels.2'), mod: 1.1, cost: 5000000 },
        { level: 3, name: t('management.facility.levels.3'), mod: 1.2, cost: 20000000 },
        { level: 4, name: t('management.facility.levels.4'), mod: 1.3, cost: 80000000 },
        { level: 5, name: t('management.facility.levels.5'), mod: 1.5, cost: 300000000 }
    ], [t]);

    // Handlers
    const handleQuickSave = () => {
        const data = getSaveData();
        saveToStorage(data);
        alert(t('management.system.alerts.save_complete'));
    };

    const handleQuickLoad = () => {
        if (!window.confirm(t('management.system.alerts.load_confirm'))) return;
        const data = loadFromStorage();
        if (data) {
            loadGameData(data);
            alert(t('management.system.alerts.load_complete'));
            onClose();
        } else {
            alert(t('management.system.alerts.no_save_data'));
        }
    };

    const handleExport = () => {
        const data = getSaveData();
        exportSaveData(data);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm(t('management.system.alerts.import_confirm'))) {
            e.target.value = ''; // Reset input
            return;
        }

        const data = await importSaveData(file);
        if (data) {
            loadGameData(data);
            alert(t('management.system.alerts.import_complete'));
            onClose();
        }
        e.target.value = '';
    };

    const handleReset = () => {
        if (window.confirm(t('management.system.alerts.reset_confirm_1'))) {
            if (window.confirm(t('management.system.alerts.reset_confirm_2'))) {
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

                {/* Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

                {/* Header: Noren / Signboard Style */}
                <div className="bg-slate-800 p-6 flex justify-between items-start shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#b7282e] z-10"></div>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/japanese-sayagata.png')]"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-black font-serif text-white tracking-widest mb-1">{t('management.title')}</h2>
                        <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
                            <span className="w-4 h-px bg-white/30"></span>
                            {t('management.subtitle')}
                            <span className="w-4 h-px bg-white/30"></span>
                        </div>
                    </div>

                    <button onClick={onClose} className="relative z-10 text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Ledger / Financial Summary */}
                <div className="bg-white border-b-2 border-slate-200 border-dashed p-6 relative z-10 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('management.financial.current_funds')}</div>
                        <div className={`font-mono font-bold text-3xl tracking-tight leading-none ${funds < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            ¥{funds.toLocaleString()}
                        </div>
                    </div>
                    {lastMonthBalance !== null && (
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('management.financial.last_month')}</div>
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
                        {t('management.tabs.okami')}
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 relative overflow-hidden group
                            ${activeTab === 'facility' ? 'text-blue-700 border-blue-600 bg-blue-50' : 'text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'}
                        `}
                        onClick={() => setActiveTab('facility')}
                    >
                        {t('management.tabs.facility')}
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 relative overflow-hidden group
                            ${activeTab === 'settings' ? 'text-slate-800 border-slate-800 bg-slate-100' : 'text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'}
                        `}
                        onClick={() => setActiveTab('settings')}
                    >
                        {t('management.tabs.settings')}
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 relative overflow-hidden group
                            ${activeTab === 'system' ? 'text-purple-800 border-purple-800 bg-purple-50' : 'text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'}
                        `}
                        onClick={() => setActiveTab('system')}
                    >
                        {t('management.tabs.system')}
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
                                    <span className="text-[10px] text-red-300 font-bold uppercase">{t('management.okami.current_level')}</span>
                                    <span className="text-4xl font-black font-serif text-[#b7282e]">{okamiLevel}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold font-serif text-slate-800 mb-2">{t('management.okami.title')}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed bg-white/50 p-4 rounded-sm border border-slate-100">
                                        {t('management.okami.desc')}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 my-4"></div>

                            {!isMaxOkami ? (
                                <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="font-bold text-slate-700">{t('management.okami.upgrade_cost')}</div>
                                        <div className="font-bold text-[#b7282e] font-mono text-xl">
                                            ¥{okamiUpgradeCost?.toLocaleString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (canAffordOkami && okamiUpgradeCost) {
                                                if (window.confirm(t('management.okami.confirm_upgrade', { cost: okamiUpgradeCost.toLocaleString() }))) {
                                                    onUpgradeOkami();
                                                }
                                            } else {
                                                alert(t('management.financial.insufficient_funds'));
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
                                        <span>{t('management.okami.approve_btn')}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 text-center border-2 border-dashed border-amber-300 bg-amber-50 rounded-sm">
                                    <Flower className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                                    <div className="font-bold text-amber-800">{t('management.okami.max_level_reached')}</div>
                                    <div className="text-xs text-amber-600 mt-1">{t('management.okami.max_level_desc')}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'facility' && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 text-blue-900 text-sm leading-relaxed mb-6">
                                <span className="font-bold mr-1">{t('management.facility.title')}:</span>
                                {t('management.facility.desc')}
                            </div>

                            {/* Current Status */}
                            <div className="flex items-center justify-between mb-8 px-2">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{t('management.facility.current')}</div>
                                    <div className="text-xl font-bold font-serif text-slate-800">{FACILITY_LEVELS[currentHeyaLevel - 1]?.name || 'Unknown'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{t('management.facility.effect')}</div>
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
                                                <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-sm mb-1 uppercase">{t('management.facility.upgrade_to')}</span>
                                                <h4 className="text-lg font-bold font-serif text-slate-900">{nextFacility.name}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-xl text-slate-800">¥{nextFacility.cost.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
                                            <span>{t('management.facility.growth_mod')}:</span>
                                            <span className="font-bold text-slate-400 line-through">x{FACILITY_LEVELS[currentHeyaLevel - 1]?.mod}</span>
                                            <span>→</span>
                                            <span className="font-bold text-blue-600 text-lg">x{nextFacility.mod}</span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (canAffordFacility) {
                                                    if (window.confirm(t('management.facility.confirm_upgrade', { name: nextFacility.name, cost: nextFacility.cost.toLocaleString(), mod: nextFacility.mod }))) {
                                                        onUpgradeFacility(nextFacility.level, nextFacility.cost, nextFacility.mod);
                                                    }
                                                } else {
                                                    alert(t('management.financial.insufficient_funds'));
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
                                            {t('management.facility.order_btn')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center border border-slate-200 bg-slate-50 text-slate-400 font-serif">
                                    {t('management.facility.complete')}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="font-bold font-serif text-lg text-slate-800 mb-1">{t('management.settings.auto_scout')}</div>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {t('management.settings.auto_scout_desc')}
                                            <br className="mb-1" />
                                            <span className="text-amber-600">{t('management.settings.auto_scout_note')}</span>
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
                                {t('management.settings.version')} 0.2.1
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="animate-fadeIn space-y-8">

                            {/* Quick Save/Load */}
                            <section>
                                <h3 className="font-bold font-serif text-lg text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-600 rounded-sm"></span>
                                    {t('management.system.save_load_title')}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleQuickSave}
                                        className="bg-white border border-slate-200 hover:border-purple-400 hover:text-purple-700 text-slate-600 font-bold py-4 px-4 rounded-sm shadow-sm transition-all flex flex-col items-center gap-2"
                                    >
                                        <Save className="w-6 h-6 mb-1 text-purple-600" />
                                        <span>{t('management.system.save_btn')}</span>
                                    </button>
                                    <button
                                        onClick={handleQuickLoad}
                                        className="bg-white border border-slate-200 hover:border-purple-400 hover:text-purple-700 text-slate-600 font-bold py-4 px-4 rounded-sm shadow-sm transition-all flex flex-col items-center gap-2"
                                    >
                                        <FolderOpen className="w-6 h-6 mb-1 text-purple-600" />
                                        <span>{t('management.system.load_btn')}</span>
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-center">
                                    {t('management.system.local_storage_note')}
                                </p>
                            </section>

                            {/* Backup (File) */}
                            <section>
                                <h3 className="font-bold font-serif text-lg text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-sm"></span>
                                    {t('management.system.backup_title')}
                                </h3>
                                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm space-y-4">
                                    <button
                                        onClick={handleExport}
                                        className="w-full bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold py-3 px-4 rounded-sm border border-blue-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>{t('management.system.export_btn')}</span>
                                    </button>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImport}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <button className="w-full bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold py-3 px-4 rounded-sm border border-slate-300 transition-colors flex items-center justify-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            <span>{t('management.system.import_btn')}</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {t('management.system.backup_desc')}
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
                                    <AlertTriangle className="w-5 h-5" />
                                    <span>{t('management.system.reset_btn')}</span>
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
