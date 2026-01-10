import React, { useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { useTranslation } from 'react-i18next';

const LogWindow: React.FC = () => {
    const { logs } = useGame();
    const { t } = useTranslation();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <div className="bg-stone-900 border-t-4 border-stone-700 h-48 md:h-64 flex flex-col font-serif shadow-inner">
            <div className="bg-stone-800 text-stone-400 px-4 py-1 text-xs font-bold uppercase tracking-wider flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <span>{t('cmd.history')}</span>
                <span>History Log</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {logs.length === 0 && (
                    <p className="text-stone-600 text-sm italic text-center mt-8">{t('log.empty', '記録はまだありません...')}</p>
                )}

                {/* Reverse order to show history? context adds to [0], so map is Newest First. 
            Usually log windows show Oldest -> Newest (bottom). 
            My context adds `[entry, ...prev]`, so index 0 is newest.
            To show "Log flow" usually we want Newest at the bottom?
            Or Newest at top?
            Plan said "Terminal-like". Terminal appends to bottom.
            So I should probably reverse render or change context to push.
            Let's render in reverse order of the array, or just change context.
            Actually, let's just reverse here for display so newest is at bottom.
        */}
                {[...logs].reverse().map((log) => (
                    <div key={log.id} className="text-sm border-l-2 border-stone-700 pl-3 py-0.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-baseline space-x-2">
                            {/* <span className="text-stone-500 text-xs w-24 shrink-0">{log.date}</span> */}
                            {/* Date is inside message usually in my logic "1月2日: ..." but let's separate if needed. 
                   Wait, logic adds date to message body? "1月2日: ちゃんこ代..." 
                   Yes. So I don't need to double display date unless log entry struct changes.
               */}
                            <span className={`
                 ${log.type === 'error' ? 'text-red-400 font-bold' :
                                    log.type === 'warning' ? 'text-amber-400' : 'text-stone-200'}
               `}>
                                {log.key ? t(log.key, log.params) : log.message}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default React.memo(LogWindow);
