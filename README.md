# Sumo Sim (相撲部屋経営シミュレーション / Sumo Stable Management Simulation)

**[日本語](#日本語-japanese) | [English](#english-英語)**

---

<a id="日本語-japanese"></a>

## 🇯🇵 日本語 (Japanese)

### 📋 プロジェクト概要 (Project Overview)
本プロジェクトは、React 19 + TypeScript + Vite で構築された、現代的なUIを持つ相撲部屋経営シミュレーションゲームです。
プレイヤーは親方となり、弟子のスカウト、育成、本場所での采配を行い、最強の部屋を目指します。

*   **タイトル:** Sumo Sim (仮称)
*   **ジャンル:** 経営シミュレーション / スポーツ
*   **プラットフォーム:** Web (PC/Mobile) - レスポンシブ対応
*   **デザイン:** "Sumo Modern Traditional" - 伝統的な和の色（ベンガラ色、和紙色）と現代的なフラットデザインの融合。

### 🚀 主な機能 (Core Features)

#### 1. 部屋経営 (Management)
*   **資金管理 (Funds):** スカウト料、育成費用、施設維持費などを管理。
*   **TP (Training Points):** 指導力ポイント。週ごとに回復し、特別指導やイベントで使用 (最大100pt)。
*   **評判 (Reputation):** 部屋の格を表す指標。ランク（S〜E）として可視化され、スカウトの質に影響。

#### 2. 力士育成 (Wrestler Development)
*   **ステータス:**
    *   **素質 (Potential):** 成長限界 (S〜Eランク)。
    *   **体格:** 身長・体重。当たりや寄りの強さに影響。
    *   **柔軟性 (Flexibility):** 怪我耐性や技の発動率。
*   **四股名 (Shikona):** 出身地や部屋ごとの冠文字（例: 「琴」「北」）に基づき、漢字と読み（Romaji）を自動生成。
*   **スキル (Skills):** 「突き押し」「四つ相撲」などのスタイルや特殊能力をスキルブックで着脱可能。

#### 3. 本場所・番付 (Basho & Banzuke)
*   **番付システム:** 横綱から序ノ口まで、史実に基づく定員・昇降格ルールを実装。
*   **カド番・引退:** 大関のカド番制度や、成績不振・年齢による引退勧告ロジック。
*   **取組:** スイス式トーナメントに近い形式で、成績の近い力士とマッチング。

#### 4. 新弟子スカウト (Scout)
*   **スカウト報告:** 毎週、スカウトマンから候補者リストが届く。
*   **新弟子検査:** 資金を支払い、詳細なステータス（素質・柔軟性）を「検査」で明らかにする。
*   **入門:** 四股名を授与し、部屋に迎え入れる。

#### 5. ローカライズ (Localization / i18n)
*   **完全対応:** UIの全テキストは `ja` (日本語) と `en` (英語) に切り替え可能。
*   **厳格な分離:** 言語設定に基づき、表示テキストを完全に切り替える（英語モードに日本語を残さない）。

### 🛠 技術スタック (Tech Stack)

| カテゴリ | 技術 | 解説 |
| --- | --- | --- |
| **Frontend** | React 19 | 最新のReact。Hooks中心の設計。 |
| **Language** | TypeScript | 厳格な型定義 (Strict mode)。 |
| **Build** | Vite | 高速なビルド・HMR。 |
| **Styling** | Tailwind CSS v4 | 最新のCSSエンジン。変数活用。 |
| **State** | Zustand | 軽量なグローバル状態管理。 |
| **i18n** | i18next | 国際化対応。 |
| **Test** | Vitest | ユニットテスト。 |

### 📂 ディレクトリ構造 (Directory Structure)

```
src/
├── features/           # 機能単位のモジュール (Domain Driven)
│   ├── banzuke/        # 番付ロジック
│   ├── game/           # ゲームループ・進行
│   ├── heya/           # 部屋経営
│   ├── match/          # 取組・勝敗判定
│   └── wrestler/       # 力士データ・スカウト
├── components/         # 汎用UI (Button, Modal)
├── locales/            # 言語ファイル (ja.ts, en.ts)
└── store/              # Zustand ストア
```

---

<a id="english-英語"></a>

## 🇺🇸 English

### 📋 Project Overview
**Sumo Sim** is a modern Sumo Stable Management Simulation game built with React 19, TypeScript, and Vite.
Players take on the role of an "Oyakata" (Stable Master), scouting young talents, training them, and commanding them in tournaments to build the strongest stable.

*   **Title:** Sumo Sim
*   **Genre:** Management Simulation / Sports
*   **Platform:** Web (PC/Mobile) - Responsive
*   **Design:** "Sumo Modern Traditional" - A fusion of traditional aesthetics (Bengala red, Washi paper cream) and modern flat UI.

### 🚀 Core Features

#### 1. Stable Management
*   **Funds:** Manage finances for scouting, training, and facility maintenance.
*   **TP (Training Points):** Action points for coaching. Recovers weekly, used for special training (Max 100pt).
*   **Reputation:** Indicates the prestige of the stable (Rank S-E). Higher reputation attracts better recruits.

#### 2. Wrestler Development
*   **Stats:**
    *   **Potential:** Growth limit and speed (Grade S-E).
    *   **Physique:** Height and Weight, affecting collision power.
    *   **Flexibility:** Injury resistance and skill activation rates.
*   **Shikona (Ring Name):** Automatically generated Kanji and Romaji names based on origin and stable prefixes (e.g., "Koto", "Kita").
*   **Skills:** Equipable skills and techniques (e.g., "Pusher/Thruster", "Grappler") managed via Skill Books.

#### 3. Basho (Tournament) & Banzuke (Rankings)
*   **Ranking System:** Full pyramid from Yokozuna to Jonokuchi with historically accurate quotas and promotion/demotion rules.
*   **Kadoban & Retirement:** Logic for Ozeki demotion (Kadoban) and retirement decisions based on performance/age.
*   **Matchmaking:** Dynamic matching logic pairing wrestlers with similar records (Swiss-system style).

#### 4. Scouting
*   **Recruitment:** Weekly reports of potential candidates.
*   **Inspection:** Spend funds to "Inspect" candidates and reveal hidden stats (Potential, Flexibility).
*   **Entry:** Grant a Shikona and officially accept them into the stable.

#### 5. Localization (i18n)
*   **Full Support:** Complete toggle between Japanese (JA) and English (EN).
*   **Strict Separation:** UI ensures no mixed languages; English mode displays pure English (including Romaji names), and Japanese mode displays pure Japanese.

### 🛠 Tech Stack

| Category | Technology | Note |
| --- | --- | --- |
| **Frontend** | React 19 | Latest React features. |
| **Language** | TypeScript | Strict type safety. |
| **Build** | Vite | Fast HMR and build. |
| **Styling** | Tailwind CSS v4 | Utility-first CSS. |
| **State** | Zustand | Lightweight state management. |
| **i18n** | i18next | Internationalization. |
| **Test** | Vitest | Unit testing framework. |

### 📂 Directory Structure

```
src/
├── features/           # Feature-based modules
│   ├── banzuke/        # Ranking logic
│   ├── game/           # Game loop & time
│   ├── heya/           # Stable management
│   ├── match/          # Match simulation
│   └── wrestler/       # Wrestler data & scout
├── components/         # Shared UI components
├── locales/            # Translation files (ja.ts, en.ts)
└── store/              # Zustand stores
```

---

## 🔧 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# -> http://localhost:5173

# Build for production
npm run build

# Run tests
npm test
```
