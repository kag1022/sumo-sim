import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../../context/GameContext';
import { getWeekNumber } from '../../utils/time';
import { MAX_TP } from '../../utils/constants';
import { Book, History, Building2, UserPlus, PanelLeft, PanelRight } from 'lucide-react';

interface HeaderProps {
    onShowScout: () => void;
    onShowManagement: () => void;
    onShowHistory: () => void;
    onShowEncyclopedia: () => void;
    onShowHeyaList: () => void;
    onToggleLeftPanel?: () => void;
    onToggleRightPanel?: () => void;
    isLeftPanelOpen?: boolean;
    isRightPanelOpen?: boolean;
}

/**
 * ゲームヘッダーコンポーネント
 * 日付、資金、おかみレベル、各種アクションボタンを表示
 */
export const Header = ({
    onShowScout,
    onShowManagement,
    onShowHistory,
    onShowEncyclopedia,
    onShowHeyaList,
    onToggleLeftPanel,
    onToggleRightPanel,
    isLeftPanelOpen,
    isRightPanelOpen
}: HeaderProps) => {
    const {
        currentDate,
        funds,
        gamePhase,
        okamiLevel,
        reputation,
        trainingPoints,
    } = useGame();
    const { t, i18n } = useTranslation();

    const formattedDate = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        if (gamePhase === 'tournament') {
            return currentDate.toLocaleDateString(i18n.language === 'ja' ? 'ja-JP' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
            });
        } else {
            const week = getWeekNumber(currentDate);
            if (i18n.language === 'en') {
                const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });
                return t('date.format_training', { year, month: monthName, week });
            } else {
                return t('date.format_training', { year, month, week });
            }
        }
    }, [currentDate, gamePhase, t, i18n.language]);

    return (
        <header className="bg-[#b7282e] text-white shadow-md flex flex-row items-center justify-between px-3 h-14 md:h-16 lg:h-16 landscape:h-12 w-full z-30 relative shrink-0 transition-all duration-300">
            {/* Left Section: Menu & Title */}
            <div className="flex items-center gap-3">
                <h1 className="text-lg md:text-2xl font-serif font-bold tracking-tight flex items-center gap-2 select-none">
                    <span className="text-amber-400">⚡</span>
                    <span className="hidden sm:inline">SUMO SIM</span>
                    <span className="text-[10px] opacity-70 font-sans font-normal self-end mb-1.5 hidden md:inline">v0.2</span>
                </h1>
            </div>

            {/* Center Section: Status (Date, Funds) */}
            <div className="flex items-center gap-4 md:gap-8 flex-1 justify-center px-2">
                {/* Date Display */}
                <div className="flex flex-col items-end">
                    <div className="hidden md:block text-[9px] text-red-100/80 font-bold uppercase tracking-wider leading-none mb-0.5">
                        {gamePhase === 'tournament' ? t('ui.tournament') : t('ui.training')}
                    </div>
                    <div className="text-sm md:text-xl font-bold font-serif text-white leading-none whitespace-nowrap drop-shadow-sm">
                        {formattedDate}
                    </div>
                </div>

                {/* Funds Display */}
                <div className="flex flex-col items-end min-w-[80px] md:min-w-[120px]">
                    <div className="hidden md:block text-[9px] text-red-100/80 font-bold uppercase tracking-wider leading-none mb-0.5">{t('ui.funds')}</div>
                    <div className={`text-sm md:text-xl font-bold font-mono leading-none ${funds < 0 ? 'text-red-200' : 'text-amber-300'} drop-shadow-sm`}>
                        ¥{funds.toLocaleString()}
                    </div>
                </div>

                {/* Status Icons (TP, Rep, Okami) - Combined for space */}
                <div className="hidden lg:flex items-center gap-4 border-l border-white/20 pl-4 ml-2">
                     <div className="flex flex-col items-center">
                        <span className="text-[9px] text-red-100/70 font-bold uppercase tracking-wider leading-none mb-0.5">{t('ui.reputation')}</span>
                        <span className="text-sm font-bold font-mono">{reputation}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] text-red-100/70 font-bold uppercase tracking-wider leading-none mb-0.5">{t('ui.okami')}</span>
                        <span className="text-sm font-bold font-mono">Lv.{okamiLevel}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] text-red-100/70 font-bold uppercase tracking-wider leading-none mb-0.5">TP</span>
                        <span className="text-sm font-bold font-mono">{trainingPoints}/{MAX_TP}</span>
                    </div>
                </div>
            </div>

            {/* Right Section: Actions & Sidebar Toggle */}
            <div className="flex items-center gap-2">
                 {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-1">
                    <button onClick={onShowScout} className="p-2 hover:bg-white/10 rounded-sm text-white/90 hover:text-white transition-colors" title={t('cmd.scout')}><UserPlus className="w-5 h-5" /></button>
                    <button onClick={onShowManagement} className="p-2 hover:bg-white/10 rounded-sm text-white/90 hover:text-white transition-colors" title={t('cmd.manage')}><Building2 className="w-5 h-5" /></button>
                    <button onClick={onShowHistory} className="p-2 hover:bg-white/10 rounded-sm text-white/90 hover:text-white transition-colors" title={t('cmd.history')}><History className="w-5 h-5" /></button>
                    <button onClick={onShowEncyclopedia} className="p-2 hover:bg-white/10 rounded-sm text-white/90 hover:text-white transition-colors" title={t('cmd.encyclopedia')}><Book className="w-5 h-5" /></button>
                    <button onClick={onShowHeyaList} className="ml-1 text-[10px] font-bold border border-white/40 rounded-sm px-2 py-1 text-white/90 hover:text-white hover:bg-white/10 transition-all">{t('header.heya_list_btn')}</button>
                </div>

                 {/* Mobile Actions Menu (Simplified) */}
                 <div className="md:hidden flex items-center gap-1 mr-1">
                    <button onClick={onShowManagement} className="p-1 hover:bg-white/10 rounded-sm text-white hover:text-white"><Building2 className="w-5 h-5" /></button>
                 </div>

                {/* Panel Toggles Group */}
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/20">
                     {/* Left Panel Toggle */}
                    <button
                        onClick={onToggleLeftPanel}
                        className={`p-1.5 rounded-sm transition-colors border border-white/20 ${isLeftPanelOpen ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        title="Toggle List"
                    >
                        <PanelLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Right Panel Toggle */}
                    <button
                        onClick={onToggleRightPanel}
                        className={`p-1.5 rounded-sm transition-colors border border-white/20 ${isRightPanelOpen ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        title="Toggle Sidebar"
                    >
                        <PanelRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};
