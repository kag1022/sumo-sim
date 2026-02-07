Original prompt: PLEASE IMPLEMENT THIS PLAN: UI統一とAI画像導入の実装計画

- Added UI tokens and base styles in src/index.css, updated fonts to Noto Serif/Sans JP, and aligned tailwind.config.js.
- Introduced UI primitives (Card, Panel, SectionHeader, ModalShell, Input, Illustration, etc.) and layout shells (ScreenShell, AppShell).
- Updated TitleScreen and IntroScreen to the new shell + primitives and added illustration support.
- Refactored MainGameScreen panels and headers to SectionHeader/ActionBar with consistent KPIs.
- Wrapped standard modals (Help, History, BashoResult, Encyclopedia, HeyaList, Management, ShikonaChange, Inspection, SkillBook, Scout) with ModalShell.
- Added AI illustration placeholders in src/assets/ai and centralized mapping in src/data/illustrations.ts.
- Added safe-area and 100svh adjustments for mobile.
- Playwright run completed; latest screenshots in output/web-game show updated title layout.
- Unified Scout, Management, History, Encyclopedia, Yusho, BashoResult, and ShikonaChange headers/tabs with SectionHeader/TabList and shared primitives.
- Unified modal close button to top-right icon via ModalShell and set modal frames to red borders.
- Added dev-only test shortcuts and Playwright action file to reach target screens; removed duplicate close button in ScoutScreen footer.

TODO:
- Run Playwright test loop and review screenshots/state output.
- Update any remaining screens or modals that feel visually inconsistent after refactor.
