KSFA Mobile (Next.js) 開発ロードマップ

Phase 1: 環境構築とモバイル最適化

スマホで見た時に「これはWebサイトではなくアプリだ」と思わせる土台を作る。

[ ] 1. Next.js プロジェクト作成

npx create-next-app@latest ksfa-mobile-web

TypeScript, Tailwind CSS, App Router: YES

[ ] 2. メタデータ設定 (layout.tsx)

viewport 設定: width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0 (拡大縮小禁止)

[ ] 3. グローバルCSS設定 (globals.css)

select-none, overscroll-none などを適用し、Web特有の挙動を消す。

[ ] 4. AppShell作成 (components/layout/AppShell.tsx)

背景のオーブ（赤・青）のアニメーション。

100dvh のコンテナ確保。

Phase 2: UIコンポーネント実装

「Platinum White」デザインの部品を作る。

[ ] 1. GlassCard

半透明・白ボーダー・影を持つカードコンポーネント。

[ ] 2. BottomNav

画面下部に固定されるフローティングメニュー。

[ ] 3. デモモード設定 (lib/config.ts)

IS_DEMO_MODE = true 定義。

Phase 3: 画面実装 (モック優先)

中身はハリボテでも、デモシナリオ通りに動くようにする。

[ ] 1. ホーム画面 (app/page.tsx)

作業者IDカード。

巨大な「スキャン開始」ボタン。

[ ] 2. スキャン画面 (app/scan/page.tsx)

[重要] Webカメラ (react-webcam) を配置するが、デモモード時は「黒背景にHUD（枠線）」だけ表示し、クリックで撮影完了とする。

3秒間の「解析中」アニメーション。

[ ] 3. 結果画面 (app/scan/result/page.tsx)

NG判定（赤文字）の表示。

[ ] 4. 日報画面 (app/report/page.tsx)

タイムライン表示。

「＋」ボタンで録音画面（UIのみ）表示。

Phase 4: 接続・デモ準備

PCとスマホを繋いで実機テストを行う。

[ ] 1. ローカルサーバー起動

npm run dev -- -H 0.0.0.0 (外部アクセス許可)

[ ] 2. USBテザリング接続

スマホから http://[PCのIP]:3000 にアクセス。

[ ] 3. ホーム画面に追加

スマホのブラウザメニューから「ホーム画面に追加」し、アプリとして起動確認。