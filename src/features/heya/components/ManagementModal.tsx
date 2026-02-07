
import React, { useMemo } from 'react';
import { getOkamiUpgradeCost, MAX_OKAMI_LEVEL } from '../logic/okami';
import { saveGame as saveToStorage, loadGame as loadFromStorage, exportSaveData, importSaveData, clearSave } from '../../../utils/storage';
import { useGame } from '../../../context/GameContext';
import { Flower, Save, FolderOpen, Download, Upload, AlertTriangle, X, Lock, Hammer, GraduationCap, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ModalShell from '../../../components/ui/ModalShell';

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

    // Sub-components
    const WoodTab = ({ id, label, icon: Icon }: { id: string, label: string, icon?: any }) => (
        <button
            onClick={() => setActiveTab(id as any)}
            className={`
                relative px-6 py-3 font-serif font-bold text-sm tracking-wider transition-all duration-300
                flex items-center gap-2 group overflow-hidden
                ${activeTab === id
                    ? 'text-[#2c1a1b] -translate-y-1 z-10'
                    : 'text-stone-400 hover:text-stone-600 hover:-translate-y-0.5'
                }
            `}
        >
            {/* Wood Texture Background for Active */}
            {activeTab === id && (
                <div className="absolute inset-0 bg-[#e6dcc5] shadow-[0_-2px_4px_rgba(0,0,0,0.1)] rounded-t-sm border-t-2 border-x border-[#d1c4a5]">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                </div>
            )}

            {/* Hover Background for Inactive */}
            {activeTab !== id && (
                <div className="absolute inset-0 bg-stone-100 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}

            <div className="relative z-10 flex items-center gap-2">
                {Icon && <Icon className={`w-4 h-4 ${activeTab === id ? 'text-[#b7282e]' : 'text-stone-400'}`} />}
                {label}
            </div>
        </button>
    );

    return (
        <ModalShell
            onClose={onClose}
            header={<></>}
            className="max-w-3xl h-[85vh] border-[6px] border-slate-800"
            bodyClassName="flex flex-col h-full"
            overlayClassName="z-[100] bg-black/60"
        >

                {/* Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

                {/* Header: Noren Style */}
                <div className="bg-slate-800 p-6 flex justify-between items-start shrink-0 relative overflow-hidden shadow-md z-20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#b7282e] z-10"></div>
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/japanese-sayagata.png')]"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-black font-serif text-white tracking-widest mb-1 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#b7282e] flex items-center justify-center text-white border-2 border-white/20">
                                <span className="font-sans text-lg">帳</span>
                            </span>
                            {t('management.title')}
                        </h2>
                        <div className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] pl-11">
                            {t('management.subtitle')}
                        </div>
                    </div>

                    <button onClick={onClose} className="relative z-10 text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center group">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Financial Ledger Strip */}
                <div className="bg-[#e6dcc5] border-b border-[#d1c4a5] p-4 relative z-10 shadow-inner flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div>
                            <div className="text-[9px] font-bold text-[#8c7b64] uppercase tracking-wider mb-0.5">{t('management.financial.current_funds')}</div>
                            <div className={`font-mono font-bold text-2xl tracking-tight leading-none ${funds < 0 ? 'text-red-700' : 'text-[#4a3b32]'}`}>
                                ¥{funds.toLocaleString()}
                            </div>
                        </div>
                        <div className="w-px h-8 bg-[#d1c4a5]"></div>
                        {lastMonthBalance !== null && (
                            <div>
                                <div className="text-[9px] font-bold text-[#8c7b64] uppercase tracking-wider mb-0.5">{t('management.financial.last_month')}</div>
                                <div className={`font-mono font-bold text-lg leading-none ${lastMonthBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                    {lastMonthBalance >= 0 ? '+' : ''}{lastMonthBalance.toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs - Wood Tag Style */}
                <div className="flex px-6 pt-6 gap-1 shrink-0 bg-[#f4f0e6] border-b border-[#d1c4a5] overflow-x-auto custom-scrollbar">
                    <WoodTab id="okami" label={t('management.tabs.okami')} icon={Flower} />
                    <WoodTab id="facility" label={t('management.tabs.facility')} icon={Hammer} />
                    <WoodTab id="settings" label={t('management.tabs.settings')} />
                    <WoodTab id="system" label={t('management.tabs.system')} />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">

                    {/* Okami Tab */}
                    {activeTab === 'okami' && (
                        <div className="animate-fadeIn max-w-2xl mx-auto">
                            <div className="flex gap-8 mb-8">
                                <div className="hidden sm:flex flex-col items-center justify-center w-32 h-32 bg-white border-[6px] border-double border-red-100 rounded-full shadow-lg shrink-0 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/flower-pattern.png')] opacity-20"></div>
                                    <span className="relative z-10 text-[10px] text-red-300 font-bold uppercase tracking-widest">{t('management.okami.current_level')}</span>
                                    <span className="relative z-10 text-5xl font-black font-serif text-[#b7282e] mt-1">{okamiLevel}</span>
                                    <div className="absolute bottom-3 text-[9px] font-bold text-red-800/40 uppercase">{t(`management.okami.levels.${okamiLevel as any}`)}</div>
                                </div>
                                <div className="flex-1 pt-2">
                                    <h3 className="text-2xl font-bold font-serif text-[#2c1a1b] mb-3 flex items-center gap-2">
                                        {t('management.okami.title')}
                                    </h3>
                                    <div className="bg-white/60 p-5 rounded-sm border border-[#d1c4a5] text-sm text-[#5c4b40] leading-relaxed shadow-sm relative">
                                        <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-b border-[#d1c4a5] rotate-45"></div>
                                        {t('management.okami.desc')}
                                    </div>
                                </div>
                            </div>

                            {/* Effect Visuals */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-[#fffbf0] p-4 rounded-sm border border-amber-200">
                                    <div className="text-[10px] font-bold text-amber-800/60 uppercase mb-1">{t('management.okami.current_effect')}</div>
                                    <div className="font-serif font-bold text-amber-900">{t(`management.okami.levels.${okamiLevel as any}`)}</div>
                                </div>
                                <div className="bg-white p-4 rounded-sm border border-slate-200 opacity-60">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('management.okami.next_effect')}</div>
                                    <div className="font-serif font-bold text-slate-600">
                                        {isMaxOkami ? '-' : t(`management.okami.levels.${okamiLevel + 1 as any}`)}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[#d1c4a5] border-dashed my-6"></div>

                            {!isMaxOkami ? (
                                <div className="bg-white p-6 rounded-sm shadow-md border border-slate-200 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <div className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-1">{t('management.okami.upgrade_cost')}</div>
                                            <div className={`font-mono font-bold text-2xl ${canAffordOkami ? 'text-[#b7282e]' : 'text-slate-400'}`}>
                                                ¥{okamiUpgradeCost?.toLocaleString()}
                                            </div>
                                        </div>
                                        <ChevronRight className="text-slate-200 w-8 h-8" />
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (canAffordOkami && okamiUpgradeCost) {
                                                if (window.confirm(t('management.okami.confirm_upgrade', { cost: okamiUpgradeCost.toLocaleString() }))) {
                                                    onUpgradeOkami();
                                                }
                                            }
                                        }}
                                        disabled={!canAffordOkami}
                                        className={`
                                            w-full py-4 rounded-sm font-bold shadow-lg transition-all flex justify-center items-center gap-3
                                            ${canAffordOkami
                                                ? 'bg-[#b7282e] text-white hover:bg-[#a02027] active:scale-[0.98] ring-2 ring-offset-2 ring-[#b7282e]/0 hover:ring-[#b7282e]/50'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}
                                        `}
                                    >
                                        {!canAffordOkami && <Lock className="w-4 h-4" />}
                                        <span>
                                            {canAffordOkami ? t('management.okami.approve_btn') : t('management.okami.locked')}
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed border-amber-300 bg-amber-50/50 rounded-sm">
                                    <Flower className="w-10 h-10 mx-auto mb-3 text-amber-500" />
                                    <div className="font-bold text-amber-800 text-lg mb-1">{t('management.okami.max_level_reached')}</div>
                                    <div className="text-sm text-amber-600">{t('management.okami.max_level_desc')}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Facility Tab */}
                    {activeTab === 'facility' && (
                        <div className="animate-fadeIn max-w-2xl mx-auto">
                            <div className="bg-[#e6f0fa] border border-blue-200 rounded-sm p-4 text-blue-900 text-sm leading-relaxed mb-8 flex gap-4 shadow-sm">
                                <Hammer className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold mr-1 block mb-1">{t('management.facility.title')}</span>
                                    <span className="opacity-80">{t('management.facility.desc')}</span>
                                </div>
                            </div>

                            {/* Level Visualizer */}
                            <div className="flex items-center justify-between mb-8 px-4 relative">
                                {/* Connector Line */}
                                <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -z-10 rounded-full"></div>
                                <div className="absolute top-1/2 left-4 h-1 bg-blue-500/20 -z-10 rounded-full transition-all duration-500" style={{ width: `${((currentHeyaLevel - 1) / 4) * 100}%` }}></div>

                                {FACILITY_LEVELS.map((fac) => {
                                    const isUnlocked = currentHeyaLevel >= fac.level;
                                    const isCurrent = currentHeyaLevel === fac.level;

                                    return (
                                        <div key={fac.level} className="flex flex-col items-center group relative">
                                            <div className={`
                                                w-10 h-10 rounded-full border-4 flex items-center justify-center font-bold text-sm transition-all duration-300 z-10
                                                ${isCurrent ? 'bg-white border-blue-500 text-blue-600 shadow-md scale-110' :
                                                    isUnlocked ? 'bg-blue-500 border-blue-500 text-white' :
                                                        'bg-white border-slate-200 text-slate-300'}
                                            `}>
                                                {fac.level}
                                            </div>
                                            {/* Tooltipish Label */}
                                            <div className={`
                                                absolute top-12 whitespace-nowrap text-[10px] font-bold px-2 py-1 rounded-full border transition-all
                                                ${isCurrent ? 'bg-blue-600 text-white border-blue-600 opacity-100 translate-y-0' :
                                                    'bg-white text-slate-500 border-slate-200 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0'}
                                            `}>
                                                {fac.name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200 mb-8 flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{t('management.facility.current')}</div>
                                    <div className="text-xl font-bold font-serif text-slate-800">{FACILITY_LEVELS[currentHeyaLevel - 1]?.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{t('management.facility.effect')}</div>
                                    <div className="font-mono font-bold text-xl text-blue-600 bg-blue-50 px-3 py-1 rounded-sm border border-blue-100">
                                        x{FACILITY_LEVELS[currentHeyaLevel - 1]?.mod}
                                    </div>
                                </div>
                            </div>

                            {/* Upgrade Box */}
                            {nextFacility && !isMaxFacility ? (
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-200 to-slate-300 rounded-sm blur opacity-40 group-hover:opacity-60 transition"></div>
                                    <div className="relative bg-white p-6 rounded-sm shadow-md border border-slate-300">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="inline-block bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm mb-1 uppercase tracking-wider">{t('management.facility.upgrade_to')}</span>
                                                <h4 className="text-lg font-bold font-serif text-slate-900 mt-1">{nextFacility.name}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-mono font-bold text-2xl ${canAffordFacility ? 'text-[#b7282e]' : 'text-slate-400'}`}>
                                                    ¥{nextFacility.cost.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6 text-sm text-slate-600 bg-slate-50 p-3 rounded-sm border border-slate-100">
                                            <span className="font-bold text-xs uppercase text-slate-400">{t('management.facility.growth_mod')}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-400 line-through decoration-2">x{FACILITY_LEVELS[currentHeyaLevel - 1]?.mod}</span>
                                                <ChevronRight className="w-4 h-4 text-slate-300" />
                                                <span className="font-black text-blue-600 text-lg">x{nextFacility.mod}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (canAffordFacility) {
                                                    if (window.confirm(t('management.facility.confirm_upgrade', { name: nextFacility.name, cost: nextFacility.cost.toLocaleString(), mod: nextFacility.mod }))) {
                                                        onUpgradeFacility(nextFacility.level, nextFacility.cost, nextFacility.mod);
                                                    }
                                                }
                                            }}
                                            disabled={!canAffordFacility}
                                            className={`
                                                w-full py-4 rounded-sm font-bold shadow-md transition-all flex justify-center items-center gap-3 group/btn
                                                ${canAffordFacility
                                                    ? 'bg-slate-800 text-white hover:bg-[#b7282e] hover:shadow-lg active:scale-[0.99]'
                                                    : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'}
                                            `}
                                        >
                                            {!canAffordFacility ? <Lock className="w-4 h-4" /> : <Hammer className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />}
                                            <span>
                                                {canAffordFacility ? t('management.facility.order_btn') : t('management.facility.locked')}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-sm">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                                    <div className="font-bold text-blue-800 text-lg">{t('management.facility.complete')}</div>
                                    <div className="text-sm text-blue-600 mt-1">{t('management.facility.max_level_label')}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="animate-fadeIn max-w-2xl mx-auto space-y-6">
                            <div className="bg-white p-6 rounded-sm shadow-sm border border-[#d1c4a5] flex justify-between items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <div className="font-bold font-serif text-lg text-[#2c1a1b] mb-1 flex items-center gap-2">
                                        {t('management.settings.auto_scout')}
                                    </div>
                                    <p className="text-xs text-[#5c4b40] leading-relaxed mt-2 opacity-80">
                                        {t('management.settings.auto_scout_desc')}
                                    </p>
                                    <div className="text-xs text-amber-700 font-bold mt-2">
                                        {t('management.settings.auto_scout_note')}
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer mt-1">
                                    <input
                                        type="checkbox"
                                        checked={autoRecruitAllowed}
                                        onChange={(e) => setAutoRecruitAllowed(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#b7282e] shadow-inner"></div>
                                </label>
                            </div>

                            <div className="text-center text-xs text-stone-400 mt-12 flex flex-col items-center gap-2">
                                <div className="w-8 h-px bg-stone-300"></div>
                                {t('management.settings.version')} 0.2.1
                            </div>
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === 'system' && (
                        <div className="animate-fadeIn max-w-2xl mx-auto space-y-8">

                            {/* Save / Load */}
                            <section>
                                <h3 className="font-bold font-serif text-lg text-[#2c1a1b] mb-4 flex items-center gap-2 border-b border-[#d1c4a5] pb-2">
                                    <Save className="w-5 h-5 text-[#b7282e]" />
                                    {t('management.system.save_load_title')}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleQuickSave}
                                        className="bg-white border-2 border-[#d1c4a5] hover:border-[#b7282e] hover:text-[#b7282e] text-[#5c4b40] font-bold py-6 px-4 rounded-sm shadow-sm transition-all flex flex-col items-center gap-3 group"
                                    >
                                        <Save className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                        <span>{t('management.system.save_btn')}</span>
                                    </button>
                                    <button
                                        onClick={handleQuickLoad}
                                        className="bg-white border-2 border-[#d1c4a5] hover:border-[#b7282e] hover:text-[#b7282e] text-[#5c4b40] font-bold py-6 px-4 rounded-sm shadow-sm transition-all flex flex-col items-center gap-3 group"
                                    >
                                        <FolderOpen className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                        <span>{t('management.system.load_btn')}</span>
                                    </button>
                                </div>
                                <p className="text-xs text-stone-400 mt-2 text-center italic">
                                    {t('management.system.local_storage_note')}
                                </p>
                            </section>

                            {/* Backup */}
                            <section>
                                <h3 className="font-bold font-serif text-lg text-[#2c1a1b] mb-4 flex items-center gap-2 border-b border-[#d1c4a5] pb-2">
                                    <Download className="w-5 h-5 text-blue-600" />
                                    {t('management.system.backup_title')}
                                </h3>
                                <div className="bg-[#f0f4f8] p-6 rounded-sm border border-blue-100 shadow-inner space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handleExport}
                                            className="w-full bg-white text-blue-800 hover:bg-blue-50 font-bold py-3 px-4 rounded-sm border border-blue-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>{t('management.system.export_btn')}</span>
                                        </button>

                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={handleImport}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            />
                                            <button className="w-full bg-white text-slate-700 hover:bg-slate-50 font-bold py-3 px-4 rounded-sm border border-slate-300 transition-colors flex items-center justify-center gap-2 shadow-sm relative z-10">
                                                <Upload className="w-4 h-4" />
                                                <span>{t('management.system.import_btn')}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed text-center">
                                        {t('management.system.backup_desc')}
                                    </p>
                                </div>
                            </section>

                            <div className="border-t border-[#d1c4a5] my-6"></div>

                            {/* Reset */}
                            <section>
                                <button
                                    onClick={handleReset}
                                    className="w-full bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 font-bold py-4 px-4 rounded-sm border border-red-200 transition-colors flex items-center justify-center gap-2 shadow-sm opacity-70 hover:opacity-100"
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                    <span>{t('management.system.reset_btn')}</span>
                                </button>
                            </section>
                        </div>
                    )}

                </div>
        </ModalShell>
    );
};

export default ManagementModal;
