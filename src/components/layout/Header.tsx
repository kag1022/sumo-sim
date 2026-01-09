import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../../context/GameContext';
import { getWeekNumber } from '../../utils/time';
import { MAX_TP } from '../../utils/constants';
import Button from '../ui/Button';
import { Book, ChevronRight, History, Briefcase } from 'lucide-react';

interface HeaderProps {
    onShowScout: () => void;
    onShowManagement: () => void;
    onShowHistory: () => void;
    onShowEncyclopedia: () => void;
    onShowHelp: () => void;
    onAdvance: () => void;
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
    onShowHelp,
    onAdvance,
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

        if (gamePhase === 'tournament') {
            // Use Intl API for correct date formatting based on current language
            return currentDate.toLocaleDateString(i18n.language === 'ja' ? 'ja-JP' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
            });
        } else {
            // Training Phase: Use localized template
            const week = getWeekNumber(currentDate);
            // JP: 11 (number), EN: Nov (short string)
            // To support both cleanly, we can pass both and let the template choose, 
            // OR use logic here. 
            // en.ts template: '{{month}} {{year}}, Week {{week}}' -> expects Month Name?
            // If we pass localized month string:


            // For JP, 'numeric' gives '11月' or '11'? Chrome 'ja-JP' month:numeric gives '11月' usually? 
            // Let's verify: new Date().toLocaleDateString('ja-JP', {month:'numeric'}) -> '1月' or '1'. 
            // Actually it's better to pass raw number for JP template which has '月' hardcoded?
            // existing ja.ts: '{{year}}年 {{month}}月 第{{week}}週' -> expects number.

            const monthVal = i18n.language === 'ja'
                ? (currentDate.getMonth() + 1) // Pass number 11
                : currentDate.toLocaleDateString('en-US', { month: 'short' }); // Pass "Nov"

            return t('date.format_training', { year, month: monthVal, week });
        }
    }, [currentDate, gamePhase, t, i18n.language]);

    return (
        <header className="bg-[#b7282e] text-white py-3 shadow-md sticky top-0 z-50 border-b border-[#a02027]">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-serif tracking-widest leading-none drop-shadow-sm">{t('app.title')}</h1>
                    <p className="text-xs opacity-90 tracking-wide font-light">{t('app.subtitle')}</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status & Date Group */}
                    <div className="flex items-center gap-4 bg-[#8c1c22] px-4 py-1.5 rounded-sm border border-[#a02027]/50 shadow-inner">
                        {/* Status Badge */}
                        <div className={`px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider uppercase border ${gamePhase === 'tournament' ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-blue-800 text-blue-100 border-blue-700'}`}>
                            {gamePhase === 'tournament' ? t('ui.tournament') : t('ui.training')}
                        </div>

                        {/* Date */}
                        <div className="text-center leading-tight">
                            <span className="font-serif font-bold text-lg">{formattedDate}</span>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Funds */}
                    <div className="flex flex-col items-end min-w-[120px]">
                        <div className={`text-[10px] font-bold ${lastMonthBalance && lastMonthBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {lastMonthBalance !== null && (
                                <span>(先月: {lastMonthBalance >= 0 ? '+' : ''}{lastMonthBalance.toLocaleString()})</span>
                            )}
                        </div>
                        <div className={`text-3xl font-mono font-bold tracking-tighter leading-none ${funds < 0 ? 'text-red-300' : 'text-[#f2d07e]'} drop-shadow-sm`}>
                            ¥ {funds.toLocaleString()}
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Okami & Management */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono mb-0.5 opacity-90">
                            <span>{t('ui.okami')} LV:</span>
                            <span className="font-bold text-amber-300 text-xs">{okamiLevel}</span>
                            <span className="opacity-50">|</span>
                            <span>{t('ui.reputation')}:</span>
                            <span className="font-bold text-white text-xs">{reputation}</span>
                            <span className="opacity-50">|</span>
                            <span>TP:</span>
                            <span className={`font-bold text-xs ${trainingPoints < 10 ? 'text-red-300' : 'text-amber-300'}`}>
                                {trainingPoints}/{MAX_TP}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={onShowHistory}
                                className="text-[10px] font-bold px-2 py-1 rounded-sm border border-white/30 hover:bg-white/10 transition-colors uppercase tracking-wider flex items-center"
                            >
                                <History className="w-3 h-3 mr-1" />
                                <span>{t('cmd.history')}</span>
                            </button>
                            <button
                                onClick={onShowEncyclopedia}
                                className="text-[10px] font-bold px-2 py-1 rounded-sm border border-white/30 hover:bg-white/10 transition-colors uppercase tracking-wider bg-amber-900/40 flex items-center"
                            >
                                <Book className="w-3 h-3 mr-1" />
                                <span>図鑑</span>
                            </button>
                            <button
                                onClick={onShowManagement}
                                className="bg-[#8c1c22] hover:bg-[#7a181d] text-white text-[10px] font-bold px-3 py-1 rounded-sm shadow-sm border border-white/10 transition-colors uppercase tracking-wider flex items-center"
                            >
                                <Briefcase className="w-3 h-3 mr-1" />
                                <span>{t('cmd.manage')}</span>
                            </button>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Action Group */}
                    <div className="flex items-center gap-3">
                        {gamePhase === 'training' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={onShowScout}
                            >
                                スカウト
                            </Button>
                        )}

                        <Button
                            variant={gamePhase === 'tournament' ? 'primary' : 'action'}
                            size="md"
                            onClick={onAdvance}
                            className="shadow-md"
                        >
                            <div className="flex items-center gap-2">
                                <span>{gamePhase === 'tournament' ? '翌日へ' : '翌週へ'}</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </Button>

                        <div className="flex gap-1 ml-2">
                            <button
                                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ja' : 'en')}
                                className="w-6 h-6 flex items-center justify-center rounded-sm bg-black/20 hover:bg-black/40 text-[10px] font-bold text-amber-300/80 border border-white/10 transition-colors"
                            >
                                {i18n.language === 'en' ? 'EN' : 'JP'}
                            </button>
                            <button
                                onClick={onShowHelp}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all"
                            >
                                ?
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
