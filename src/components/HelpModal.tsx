
import React, { useState } from 'react';

interface HelpModalProps {
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'flow' | 'tips' | 'terms'>('flow');

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[110] backdrop-blur-sm p-4" onClick={onClose}>
            {/* Book/Scroll Container */}
            <div className="bg-[#fcf9f2] max-w-3xl w-full h-[85vh] rounded-sm shadow-2xl overflow-hidden flex flex-col border-l-8 border-l-[#b7282e] relative" onClick={e => e.stopPropagation()}>

                {/* Paper Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

                {/* Header */}
                <div className="bg-[#fcf9f2] p-8 pb-4 shrink-0 flex justify-between items-start border-b border-stone-200">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-px bg-[#b7282e]"></span>
                            <span className="text-[#b7282e] text-xs font-bold uppercase tracking-widest">Guidebook</span>
                        </div>
                        <h2 className="text-4xl font-black font-serif text-slate-900 tracking-tight">相撲部屋 経営指南書</h2>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-[#b7282e] transition-colors text-2xl leading-none">×</button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 border-b border-stone-200 gap-8 shrink-0 bg-white/50">
                    {['flow', 'tips', 'terms'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-sm font-bold transition-all relative
                                ${activeTab === tab ? 'text-[#b7282e]' : 'text-stone-400 hover:text-stone-600'}
                            `}
                        >
                            <span className={activeTab === tab ? 'opacity-100' : 'opacity-100'}>
                                {tab === 'flow' ? 'ゲームの流れ' : tab === 'tips' ? '育成のコツ' : '用語・階級'}
                            </span>
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b7282e]"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-slate-800 leading-relaxed">
                    {activeTab === 'flow' && (
                        <div className="space-y-12 max-w-2xl">
                            <div className="flex gap-6">
                                <div className="font-serif font-black text-6xl text-stone-200 select-none -mt-4">01</div>
                                <div>
                                    <h3 className="text-xl font-bold font-serif text-slate-900 mb-2 border-b-2 border-[#b7282e] inline-block pb-1">新弟子スカウト</h3>
                                    <p className="text-sm text-stone-600">
                                        まずは「スカウト」メニューから有望な若者を探しましょう。
                                        「素質」や「柔軟性」が高い力士は成長が早いですが、契約金も高額です。
                                        部屋の資金と相談しながら採用を決めましょう。
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="font-serif font-black text-6xl text-stone-200 select-none -mt-4">02</div>
                                <div>
                                    <h3 className="text-xl font-bold font-serif text-slate-900 mb-2 border-b-2 border-amber-400 inline-block pb-1">稽古と育成</h3>
                                    <p className="text-sm text-stone-600 mb-2">
                                        本場所のない月は「稽古」期間です。
                                        「自動進行」で時間を進めると、力士たちは自動的に成長します。
                                    </p>
                                    <p className="text-sm text-stone-600 bg-stone-100 p-3 rounded-sm border-l-4 border-stone-300">
                                        <strong>Point:</strong> 指導力(TP)を消費して「特訓」を行うと、弱点を克服したり長所を伸ばしたりできます。
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="font-serif font-black text-6xl text-stone-200 select-none -mt-4">03</div>
                                <div>
                                    <h3 className="text-xl font-bold font-serif text-slate-900 mb-2 inline-block pb-1">本場所 (奇数月)</h3>
                                    <p className="text-sm text-stone-600">
                                        1月、3月、5月...と奇数月には「本場所」が開催されます。
                                        15日間の取組を行い、勝ち越し（8勝以上）を目指します。
                                        好成績を残せば番付が上がり、関取（十両以上）になれば部屋の収入も増えます。
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tips' && (
                        <div className="space-y-8">
                            <div className="bg-amber-50 p-6 rounded-sm border border-amber-200">
                                <h4 className="font-bold text-amber-800 mb-4 font-serif text-lg flex items-center gap-2">
                                    <span className="text-2xl">💡</span> 序盤の歩き方
                                </h4>
                                <ul className="space-y-3 text-sm text-stone-700 list-disc list-inside">
                                    <li><strong>量より質</strong>: 最初は資金が少ないため、むやみに弟子を増やさず、少数の精鋭を育てましょう。</li>
                                    <li><strong>怪我の予防</strong>: 「四股」を中心に行い、基礎体力と柔軟性を上げましょう。怪我をすると長期間休場になり、番付が大きく下がります。</li>
                                    <li><strong>関取の壁</strong>: 幕下から十両（関取）への昇進は非常に狭き門です。運も必要ですが、諦めずに鍛え続けましょう。</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-2 font-serif text-lg">経営と施設</h3>
                                <p className="text-sm text-stone-600 leading-7">
                                    資金に余裕ができたら「経営」メニューを確認しましょう。
                                    土俵や設備を改修することで、毎日の稽古効果が底上げされます。
                                    また、女将さんのレベルを上げると、タニマチからの支援金が増えたり、有力なスカウト情報が入手しやすくなります。
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'terms' && (
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 font-serif text-lg text-center">番付ピラミッド</h3>

                            <div className="flex flex-col items-center max-w-md mx-auto mb-12 space-y-1">
                                {/* Yokozuna */}
                                <div className="w-1/4 bg-[#b7282e] text-white text-center py-2 font-black font-serif shadow-lg z-10 relative">
                                    <span className="text-xs absolute -left-8 top-1/2 -translate-y-1/2 text-[#b7282e] font-sans font-bold">最高位</span>
                                    横綱
                                </div>
                                {/* Ozeki */}
                                <div className="w-1/3 bg-amber-600 text-white text-center py-1.5 font-bold font-serif shadow-md">大関</div>
                                {/* San-yaku */}
                                <div className="w-1/2 bg-amber-500 text-white text-center py-1.5 font-bold font-serif shadow-sm">関脇・小結</div>
                                {/* Maegashira */}
                                <div className="w-2/3 bg-stone-400 text-white text-center py-1.5 font-bold font-serif">前頭 (幕内)</div>

                                {/* Sekitori Line */}
                                <div className="w-full flex items-center gap-2 my-2 py-2">
                                    <div className="h-px bg-stone-300 flex-1"></div>
                                    <span className="text-xs font-bold text-stone-400">これより上は「関取」 (給金あり)</span>
                                    <div className="h-px bg-stone-300 flex-1"></div>
                                </div>

                                {/* Juryo */}
                                <div className="w-3/4 bg-stone-300 text-stone-600 text-center py-1.5 font-bold font-serif">十両</div>
                                {/* Lower */}
                                <div className="w-full bg-stone-200 text-stone-500 text-center py-4 font-bold font-serif text-sm rounded-b-sm">
                                    幕下・三段目・序二段・序ノ口
                                </div>
                            </div>

                            <dl className="grid grid-cols-1 gap-6 text-sm">
                                <div className="border-l-4 border-[#b7282e] pl-4">
                                    <dt className="font-bold text-slate-900 mb-1">タニマチ (Tanimachi)</dt>
                                    <dd className="text-stone-600">相撲部屋の後援者・スポンサー。彼らの支援なしに部屋の運営は成り立ちません。</dd>
                                </div>
                                <div className="border-l-4 border-amber-400 pl-4">
                                    <dt className="font-bold text-slate-900 mb-1">勝ち越し (Kachi-koshi)</dt>
                                    <dd className="text-stone-600">場所中の勝数が負数を上回ること（15日間なら8勝以上）。給金や番付昇進に直結します。</dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </div>

                {/* Footer seal */}
                <div className="p-4 bg-[#fcf9f2] border-t border-stone-200 text-right">
                    <div className="inline-block border border-[#b7282e] text-[#b7282e] px-3 py-1 text-[10px] font-bold font-serif">
                        相撲協会 公認
                    </div>
                </div>
            </div>
        </div>
    );
};
