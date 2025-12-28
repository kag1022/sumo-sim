# 相撲部屋経営シミュレーション (Sumo Stable Sim)

React + TypeScript + Vite で構築された相撲部屋経営シミュレーションゲームです。
プレイヤーは親方となり、弟子を育成し、本場所で勝利を重ね、横綱を輩出することを目指します。

## 🎮 実装機能 (Current Features)

### 1. ゲームサイクル (Game Cycle)
- **育成モード (Training Mode)**:
  - 1週間単位で進行。
  - 稽古（四股、鉄砲、申し合い）を選択し、弟子のパラメータ（心・技・体）を強化。
  - 資金管理（維持費の支払い）。
- **本場所モード (Tournament Mode)**:
  - 1日単位で進行（15日間）。
  - 関取（十両以上）は毎日、幕下以下は7番の取組を実施。
  - 勝敗に応じた番付の昇進・陥落。

### 2. 番付システム (Banzuke System)
- **総勢900名以上の力士データ**:
  - プレイヤー部屋以外の力士（CPU）も全てシミュレート。
- **リアルな番付編成**:
  - 厳格な定員制（幕内42名、十両28名）。
  - 勝ち越し・負け越しに基づく昇降格ロジック。
  - **昇進キャップ**: 幕下以下からの飛び級制限（最大で十両まで）。

### 3. スカウト機能 (Scouting)
- **新弟子獲得**:
  - 育成期間中にランダムで候補生が登場。
  - **親方の眼力**: 資金（スカウト費用）が高い候補ほど、隠しステータス（素質、柔軟性）が判明しやすい。
  - 部屋定員（20名）の制限あり。

### 4. UI/UX
- 和風テイストのUIデザイン。
- 漢数字による番付表示（例: 東前頭筆頭、西二段目百二十枚目）。

## 🛠 技術スタック (Tech Stack)
- **Frontend**: React, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## 🚀 開始方法 (Getting Started)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📂 プロジェクト構成
- `src/components`: UIコンポーネント (ScoutPanel, WrestlerList etc.)
- `src/hooks`: ゲームロジック (useGameLoop)
- `src/utils`: 計算ロジック (banzuke, scouting, formatting)
- `src/types.ts`: 型定義
