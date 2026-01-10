import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../../context/GameContext';
import { getWeekNumber } from '../../utils/time';
import { MAX_TP } from '../../utils/constants';
import { Book, History, Building2, UserPlus, Menu } from 'lucide-react';

interface HeaderProps {
    onShowScout: () => void;
    onShowManagement: () => void;
    onShowHistory: () => void;
    onShowEncyclopedia: () => void;
    onShowHeyaList: () => void;
    onShowHelp: () => void;
    onMenuClick?: () => void;
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
    onShowHelp,
    onMenuClick
}: HeaderProps) => {
    const {
        currentDate,
        funds,
        gamePhase,
        lastMonthBalance,
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
        <header className="bg-slate-900 text-white p-2 md:p-3 shadow-md flex flex-col gap-2 z-20 relative">
            {/* Top Row: Title, Date, Funds */}
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-1.5 hover:bg-slate-800 rounded-sm text-slate-300 hover:text-white transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <h1 className="text-lg md:text-xl font-bold tracking-wider flex items-center gap-2">
                        <span className="text-xl md:text-2xl text-yellow-500">⚡</span>
                        <span className="hidden xs:inline">SUMO SIM</span>
                        <span className="text-[10px] opacity-50 font-normal self-end mb-1">v0.2</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    {/* Date Display */}
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">
                            {gamePhase === 'tournament' ? t('ui.tournament') : t('ui.training')}
                        </div>
                        <div className="text-sm md:text-lg font-bold font-mono text-white leading-none">
                            {formattedDate}
                        </div>
                    </div>

                    {/* Funds Display */}
                    <div className="flex flex-col items-end min-w-[80px] md:min-w-[100px]">
                        <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">{t('ui.funds')}</div>
                        <div className={`text-sm md:text-lg font-bold font-mono leading-none ${funds < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            ¥{funds.toLocaleString()}
                        </div>
                        {lastMonthBalance !== null && lastMonthBalance !== 0 && (
                            <div className={`text-[9px] md:text-[10px] font-mono leading-tight ${lastMonthBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {lastMonthBalance > 0 ? '+' : ''}{lastMonthBalance.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Action Buttons */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                {/* Global Status Indicators */}
                <div className="flex items-center gap-3 md:gap-4 shrink-0 px-1 border-r border-slate-700 pr-3 md:pr-4">
                    <div className="flex items-center gap-1.5 md:gap-2" title={t('ui.reputation')}>
                        <span className="text-amber-400 text-xs md:text-sm">★</span>
                        <div className="flex flex-col">
                            <span className="text-[8px] md:text-[9px] uppercase text-slate-500 font-bold leading-none">{t('ui.reputation')}</span>
                            <span className="text-xs md:text-sm font-bold leading-none">{reputation}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2" title={t('ui.okami')}>
                        <span className="text-pink-400 text-xs md:text-sm">❀</span>
                        <div className="flex flex-col">
                            <span className="text-[8px] md:text-[9px] uppercase text-slate-500 font-bold leading-none">{t('ui.okami')}</span>
                            <span className="text-xs md:text-sm font-bold leading-none">Lv.{okamiLevel}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2" title={t('header.tp_title')}>
                        <span className="text-blue-400 text-xs md:text-sm">◆</span>
                        <div className="flex flex-col">
                            <span className="text-[8px] md:text-[9px] uppercase text-slate-500 font-bold leading-none">{t('header.tp')}</span>
                            <span className="text-xs md:text-sm font-bold leading-none">{trainingPoints}/{MAX_TP}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={onShowScout} className="p-1.5 md:p-2 hover:bg-slate-700 rounded-sm text-slate-300 hover:text-white transition-colors" title={t('cmd.scout')}>
                        <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button onClick={onShowManagement} className="p-1.5 md:p-2 hover:bg-slate-700 rounded-sm text-slate-300 hover:text-white transition-colors" title={t('cmd.manage')}>
                        <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button onClick={onShowHistory} className="p-1.5 md:p-2 hover:bg-slate-700 rounded-sm text-slate-300 hover:text-white transition-colors" title={t('cmd.history')}>
                        <History className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button onClick={onShowEncyclopedia} className="p-1.5 md:p-2 hover:bg-slate-700 rounded-sm text-slate-300 hover:text-white transition-colors" title={t('cmd.encyclopedia')}>
                        <Book className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button onClick={onShowHeyaList} className="p-1.5 md:p-2 hover:bg-slate-700 rounded-sm text-slate-300 hover:text-white transition-colors" title={t('header.heya_list_title')}>
                        <span className="text-xs font-bold border border-current rounded-sm px-1">{t('header.heya_list_btn')}</span>
                    </button>
                    <button onClick={onShowHelp} className="p-1.5 md:p-2 hover:bg-slate-700 rounded-sm text-slate-300 hover:text-white transition-colors text-xs font-bold" title={t('cmd.help')}>
                        ?
                    </button>
                </div>
            </div>
        </header>
    );
};
