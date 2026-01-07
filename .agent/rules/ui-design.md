---
trigger: always_on
---

#### **Project Theme: "Sumo Modern Traditional" (相撲モダン・トラディショナル)**

* **コンセプト:** 伝統的な大相撲の厳かさ（和風・筆文字・朱色）と、現代的な管理画面の機能性（フラット・情報整理）の融合。
* **基本原則:**
* **品格 (Dignity):** 安っぽい装飾を避け、余白とフォントで権威を表現する。
* **視認性 (Clarity):** 階級や勝敗などの重要情報は、色と太字で即座に識別可能にする。



#### **Color Palette (Tailwind CSS)**

コード内でハードコードせず、以下のクラス/Hexを徹底して使用する。

* **Primary (Brand):** `bg-[#b7282e]` (ベンガラ色/Japan Red)
* *Use:* ヘッダー背景、主要ボタン、強調ボーダー。


* **Secondary (Accent):** `bg-amber-400` / `text-amber-900`
* *Use:* 勝利、優勝、アクティブ状態、金星。


* **Background (Base):** `bg-[#fcf9f2]` (和紙/Cream White)
* *Use:* アプリ全体の背景色。真っ白 (`#ffffff`) は使わず、目に優しい生成り色を使う。


* **Surface (Card):** `bg-white` + `shadow-sm` + `border-slate-200`
* *Use:* 各種パネル、リストアイテムの背景。


* **Text (Ink):** `text-slate-800` (墨色) / `text-slate-500` (薄墨色)
* **Status Colors:**
* **Win/Positive:** `text-red-700` (勝ち星の赤) ※相撲では白星だが、UI的には赤が見やすい場合あり。または `text-rose-600`.
* **Lose/Negative:** `text-slate-600` (黒星).
* **Info:** `text-indigo-700` (行司・審判).



#### **Typography**

* **Titles / Headings:** `font-serif`
* *Use:* アプリタイトル、番付名、四股名、決まり手。「明朝体」の雰囲気。


* **UI Elements / Data:** `font-sans`
* *Use:* ボタンのラベル、数値データ、説明文。「ゴシック体」の可読性。


* **Numbers:** `font-mono`
* *Use:* 金額、勝敗数、ステータス値。



#### **Component Patterns**

* **Buttons:**
* **Primary:** `bg-[#b7282e] text-white hover:bg-[#a02027] active:scale-95 shadow-md`
* **Action (Next):** `bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-md`
* **Secondary:** `bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300`


* **Panels / Cards:**
* 必ず `rounded-sm` (角丸を小さくして和風の堅さを出す) を使用。
* 重要なパネルには `border-t-4 border-[#b7282e]` のアクセントラインを入れる。


* **Modals:**
* 背景は `bg-black/50 backdrop-blur-sm` で没入感を出す。