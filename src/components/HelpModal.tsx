import React, { useState } from 'react';

interface HelpModalProps {
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'flow' | 'tips' | 'terms'>('flow');

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[110] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white max-w-2xl w-full h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-stone-800 text-white p-4 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-white text-stone-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-black">?</span>
                        ヘルプ & ガイド
                    </h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex bg-stone-100 border-b border-stone-200 shrink-0">
                    <button
                        onClick={() => setActiveTab('flow')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'flow' ? 'bg-white text-amber-600 border-t-2 border-amber-600' : 'text-stone-500 hover:bg-white/50'}`}
                    >
                        ゲームの流れ
                    </button>
                    <button
                        onClick={() => setActiveTab('tips')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'tips' ? 'bg-white text-amber-600 border-t-2 border-amber-600' : 'text-stone-500 hover:bg-white/50'}`}
                    >
                        育成のコツ
                    </button>
                    <button
                        onClick={() => setActiveTab('terms')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'terms' ? 'bg-white text-amber-600 border-t-2 border-amber-600' : 'text-stone-500 hover:bg-white/50'}`}
                    >
                        用語集・階級
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 text-stone-800">
                    {activeTab === 'flow' && (
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-lg font-bold text-amber-600 mb-2 border-b-2 border-amber-100 pb-1">1. 新弟子スカウト</h3>
                                <p className="text-sm leading-relaxed mb-2">
                                    まずは「スカウト」メニューから有望な若者をスカウトしましょう。
                                    「体格」「運動神経」など、将来性を見極めることが重要です。
                                    スカウトには資金が必要です。
                                </p>
                            </section>
                            <section>
                                <h3 className="text-lg font-bold text-amber-600 mb-2 border-b-2 border-amber-100 pb-1">2. 稽古と育成</h3>
                                <p className="text-sm leading-relaxed mb-2">
                                    本場所がない月は「稽古」期間です。
                                    「自動進行」で時間を進めると、力士たちは自動的に成長します。
                                    <br />
                                    <strong>指導力(TP)</strong>を使って「特訓」を行うと、特定の能力を重点的に伸ばせます。
                                </p>
                            </section>
                            <section>
                                <h3 className="text-lg font-bold text-amber-600 mb-2 border-b-2 border-amber-100 pb-1">3. 本場所 (奇数月)</h3>
                                <p className="text-sm leading-relaxed mb-2">
                                    1月、3月、5月...と奇数月には「本場所」が開催されます（15日間）。
                                    あなたの力士たちが昇進をかけて戦います。怪我に注意しつつ見守りましょう。
                                </p>
                            </section>
                            <section>
                                <h3 className="text-lg font-bold text-amber-600 mb-2 border-b-2 border-amber-100 pb-1">4. 番付発表</h3>
                                <p className="text-sm leading-relaxed mb-2">
                                    場所後の成績に応じて「番付（ランキング）」が更新されます。
                                    勝ち越せば昇進、負け越せば陥落。
                                    目指すは最高位「横綱」です！
                                </p>
                            </section>
                        </div>
                    )}

                    {activeTab === 'tips' && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                <h4 className="font-bold text-amber-700 mb-2">💡 序盤の攻略</h4>
                                <ul className="list-disc list-inside text-sm space-y-1 text-stone-700">
                                    <li>最初は資金が少ないため、少数の精鋭を育てましょう。</li>
                                    <li>「四股（シコ）」で怪我しにくい体を作ることが最優先です。</li>
                                    <li>幕下までは比較的早く昇進できますが、関取（十両）の壁は厚いです。</li>
                                </ul>
                            </div>

                            <section>
                                <h3 className="font-bold text-stone-700 mb-2">施設と経営</h3>
                                <p className="text-sm leading-relaxed text-stone-600">
                                    資金が溜まったら「経営」メニューから施設を強化しましょう。
                                    土俵や設備を良くすると、日々の成長効率が上がります。
                                    また、「女将さん」のレベルを上げると、スカウト効率やタニマチからの支援が増えます。
                                </p>
                            </section>
                        </div>
                    )}

                    {activeTab === 'terms' && (
                        <div className="space-y-6">
                            <section>
                                <h3 className="font-bold text-stone-700 mb-3 border-l-4 border-stone-800 pl-2">階級ピラミッド</h3>
                                <div className="bg-stone-100 p-4 rounded text-center text-sm font-mono space-y-2">
                                    <div className="font-black text-xl text-[#b7282e]">横綱 (Yokozuna)</div>
                                    <div className="font-bold text-lg text-amber-700">大関 (Ozeki)</div>
                                    <div className="font-bold text-stone-700">関脇 (Sekiwake)</div>
                                    <div className="font-bold text-stone-700">小結 (Komusubi)</div>
                                    <div className="text-stone-600 border-t border-stone-300 pt-1">前頭 (Maegashira) - 幕内</div>
                                    <div className="text-stone-500 py-1 bg-amber-50 rounded">=== 関取 (Sekitori) の壁 ===</div>
                                    <div className="text-stone-500">十両 (Juryo)</div>
                                    <div className="text-stone-400 text-xs">幕下 / 三段目 / 序二段 / 序ノ口</div>
                                </div>
                            </section>

                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="font-bold text-amber-600">関取 (Sekitori)</dt>
                                    <dd className="text-stone-600">十両以上の力士。一人前として扱われ、給金が発生し、付き人が付きます。</dd>
                                </div>
                                <div>
                                    <dt className="font-bold text-amber-600">勝ち越し / 負け越し</dt>
                                    <dd className="text-stone-600">場所中の勝数が負数を上回ること（8勝7敗など）。番付が上がります。</dd>
                                </div>
                                <div>
                                    <dt className="font-bold text-amber-600">タニマチ</dt>
                                    <dd className="text-stone-600">相撲部屋の後援者・スポンサー。資金援助をしてくれます。</dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
