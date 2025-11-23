KSFA Mobile (Next.js PWA) 開発仕様書

1. プロジェクト概要

Kumamoto Smart Factory Aid (KSFA) の現場作業員用モバイルWebアプリ。
Next.js で構築し、PWA (Progressive Web App) として動作させる。
**「ネイティブアプリのような操作感」と「プラチナホワイトの美しいUI」**を両立させる。

2. 技術スタック

Framework: Next.js 15 (App Router)

Styling: Tailwind CSS

Icons: lucide-react

State: React Context + SWR

Deployment: Vercel (推奨) / Localhost (USBデモ用)

3. UI/UX デザインガイドライン ("Platinum White")

テーマ: 清潔感のある白 (bg-slate-50) を基調に、赤 (red-600) をアクセントとする。

グラスモーフィズム: カードやパネルには bg-white/70 backdrop-blur-md border-white/50 を使用。

フォント: font-sans (Inter / Noto Sans JP)。数字は等幅フォント推奨。

4. モバイルWeb最適化ルール (Native-like Behavior)

Webサイトっぽさを消し、アプリらしく振る舞わせるための鉄則。

CSSルール (Global CSS)

選択禁止: user-select: none; (長押しでテキスト選択させない)

バウンス禁止: overscroll-behavior-y: none; (引っ張って更新などを無効化)

タップハイライト削除: -webkit-tap-highlight-color: transparent;

コンテキストメニュー禁止: 画像長押しで保存メニューを出さない。

レイアウト構造 (AppShell)

全てのページは AppShell コンポーネントでラップする。

100dvh (Dynamic Viewport Height) を使用し、アドレスバーによるレイアウト崩れを防ぐ。

5. デモ対策機能 (Demo Resilience)

対策1: デモモード (Mock Mode)

フラグ: lib/config.ts に export const IS_DEMO_MODE = true; を定義。

挙動:

true の場合、APIコール（Supabase/Gemini）を行わず、即座に成功レスポンス（モックデータ）を返す。

カメラ: 実際にカメラを起動せず、「撮影したふり」をしてダミー画像をセットする。

音声: 録音せず、「話したふり」をして固定テキストを入力する。

対策2: USB有線デモ対応

インターネット接続がない環境（Localhost）でも、アセット（画像・アイコン）が表示されるように、外部URL依存を避ける。

アイコンはSVG (lucide-react) を使用する。

6. ディレクトリ構造

src/
├── app/
│   ├── page.tsx          # ホーム画面 (コックピット)
│   ├── scan/page.tsx     # スキャン画面 (カメラUI)
│   ├── report/page.tsx   # 日報画面
│   └── layout.tsx        # ルートレイアウト
├── components/
│   ├── layout/
│   │   └── AppShell.tsx  # スマホ枠・背景・共通設定
│   ├── ui/
│   │   ├── GlassCard.tsx # ガラス風カード
│   │   └── BottomNav.tsx # 下部メニュー
│   └── features/         # 機能別コンポーネント
├── lib/
│   ├── config.ts         # デモモード設定
│   └── utils.ts          # Tailwind merge等
└── styles/
    └── globals.css       # モバイル最適化CSS
