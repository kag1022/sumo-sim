
import React from 'react';
import { Wrestler } from '../../../types';
import { useTranslation } from 'react-i18next';
import ModalShell from '../../../components/ui/ModalShell';
import SectionHeader from '../../../components/ui/SectionHeader';

interface YushoModalProps {
    winners: Record<string, Wrestler>;
    onClose: () => void;
}

const YushoModal: React.FC<YushoModalProps> = ({ winners, onClose }) => {
    const { t, i18n } = useTranslation();

    if (!winners) return null;

    const divisionOrder = ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'];

    return (
        <ModalShell
            onClose={onClose}
            header={<></>}
            className="max-w-xl border-[12px] border-[#b7282e] outline outline-4 outline-white outline-offset-[-14px]"
            bodyClassName="flex flex-col items-center p-8 relative"
            overlayClassName="z-[200] bg-black/60 backdrop-blur-md"
        >
            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 w-16 h-16 border-t-[1px] border-l-[1px] border-[#b7282e] opacity-20 pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-16 h-16 border-t-[1px] border-r-[1px] border-[#b7282e] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-16 h-16 border-b-[1px] border-l-[1px] border-[#b7282e] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-16 h-16 border-b-[1px] border-r-[1px] border-[#b7282e] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <SectionHeader
                align="center"
                eyebrow={t('yusho.subtitle')}
                title={t('yusho.title')}
                illustrationKey="yusho"
                className="border-0 shadow-none bg-transparent mb-6"
            />

                {/* Winners List */}
                <div className="w-full space-y-4 mb-4">
                    {divisionOrder.map(div => {
                        const winner = winners[div];
                        if (!winner) return null;
                        const isPlayer = winner.heyaId === 'player_heya';
                        const isMakuuchi = div === 'Makuuchi';

                        return (
                            <div key={div} className={`
                                flex justify-between items-center py-3 border-b border-slate-200 border-dashed last:border-0
                                ${isMakuuchi ? 'py-6 border-slate-300 border-solid' : 'opacity-80'}
                            `}>
                                <div className="text-left flex items-center gap-4">
                                    <div className={`
                                        text-xs font-bold px-2 py-1 rounded-sm w-16 text-center whitespace-nowrap
                                        ${isMakuuchi ? 'bg-[#b7282e] text-white' : 'bg-slate-100 text-slate-500'}
                                     `}>
                                        {t(`rank.${div}`)}
                                    </div>
                                    <div>
                                        <div className={`font-serif leading-none ${isMakuuchi ? 'text-3xl font-bold text-slate-900' : 'text-lg font-bold text-slate-700'}`}>
                                            {i18n.language === 'en' ? winner.reading : winner.name}
                                        </div>
                                        {isPlayer && <div className="text-[10px] text-amber-600 font-bold mt-1">{t('yusho.your_heya')}</div>}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={`font-mono font-bold leading-none ${isMakuuchi ? 'text-2xl text-[#b7282e]' : 'text-slate-600'}`}>
                                        {winner.currentBashoStats.wins}
                                        <span className="text-sm ml-0.5 text-slate-400">{t('common.win_short', '勝')}</span>
                                        {winner.currentBashoStats.losses}
                                        <span className="text-sm ml-0.5 text-slate-400">{t('common.loss_short', '敗')}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            {/* Footer Stamp/Button */}
            <div className="mt-8">
                <button
                    onClick={onClose}
                    className="group relative overflow-hidden bg-slate-900 text-white font-serif font-bold text-lg py-3 px-12 rounded-sm shadow-lg hover:shadow-xl hover:bg-[#b7282e] transition-all duration-300"
                >
                    <span className="relative z-10">{t('yusho.next')}</span>
                </button>
            </div>
        </ModalShell>
    );
};

export default YushoModal;
