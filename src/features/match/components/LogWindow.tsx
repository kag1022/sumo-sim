import React, { useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { useTranslation } from 'react-i18next';

const LogWindow: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { logs } = useGame();
    const { t } = useTranslation();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom only when open and logs change
    useEffect(() => {
        if (isOpen && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isOpen]);

    return (
        <>
            {/* Backdrop for mobile or just click-away to close? Maybe not needed if "freely toggle". 
                If it pushes content, it's different. If it overlays, it blocks content.
                User said "out/in", implied overlay or side-panel.
                Let's make it an overlay drawer for now.
             */}
            <div className={`fixed top-[57px] left-0 h-[calc(100vh-57px)] w-80 bg-stone-900 border-r border-stone-700 shadow-2xl transform transition-transform duration-300 z-40 flex flex-col font-serif ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header */}
                <div className="bg-stone-800 text-stone-400 px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center shrink-0 shadow-sm">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-stone-500 animate-pulse"></span>
                        {t('cmd.history')}
                    </span>
                    <button onClick={onClose} className="hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Log Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-stone-900/95">
                    {logs.length === 0 && (
                        <p className="text-stone-600 text-sm italic text-center mt-8">{t('log.empty', '記録はまだありません...')}</p>
                    )}

                    {[...logs].reverse().map((log) => (
                        <div key={log.id} className="text-sm border-l-2 border-stone-700 pl-3 py-1 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className={`
                                leading-relaxed
                                ${log.type === 'error' ? 'text-red-400 font-bold' :
                                    log.type === 'warning' ? 'text-amber-400' : 'text-stone-300'}
                             `}>
                                {log.key ? t(log.key, log.params) : log.message}
                            </span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            </div>
        </>
    );
};

export default React.memo(LogWindow);
