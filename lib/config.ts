/**
 * デモモード設定
 * 
 * true の場合:
 * - APIコール（Supabase/Gemini）を行わず、即座に成功レスポンス（モックデータ）を返す
 * - カメラ: 実際にカメラを起動せず、「撮影したふり」をしてダミー画像をセットする
 * - 音声: 録音せず、「話したふり」をして固定テキストを入力する
 * 
 * 切り替え方法:
 * 1. 環境変数 NEXT_PUBLIC_DEMO_MODE=true/false で明示的に制御（最優先）
 * 2. GEMINI_API_KEY が設定されていない場合、自動でデモモードになる
 * 3. デフォルトは false（本番モード）
 */

/**
 * クライアントサイド用のデモモード判定
 * 
 * 注意: クライアント側では環境変数の読み込み方法が異なる可能性があります。
 * Next.jsでは、NEXT_PUBLIC_ プレフィックスの環境変数はビルド時に静的に埋め込まれます。
 */
export function isDemoMode(): boolean {
  // 環境変数による明示的な切り替え（最優先）
  // クライアント側では typeof window !== 'undefined' でチェック
  if (typeof window !== 'undefined') {
    // クライアント側: ビルド時に埋め込まれた環境変数を参照
    const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE
    if (envDemoMode !== undefined) {
      return envDemoMode === 'true'
    }
  } else {
    // サーバー側: 通常の環境変数を参照
    const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE
    if (envDemoMode !== undefined) {
      return envDemoMode === 'true'
    }
  }
  
  // デフォルトは true（デモモード）を優先
  // 環境変数が設定されていない場合は、デモモードとして動作
  // 本番環境では明示的に NEXT_PUBLIC_DEMO_MODE=false を設定する
  return true
}

/**
 * サーバーサイド用のデモモード判定
 */
export function isDemoModeServer(): boolean {
  // 環境変数による明示的な切り替え（最優先）
  const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE
  if (envDemoMode !== undefined) {
    return envDemoMode === 'true'
  }
  
  // APIキーの有無による自動判定
  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey || geminiApiKey.trim() === '') {
    // APIキーが設定されていない場合は自動でデモモード
    return true
  }
  
  // デフォルトは false（本番モード）
  return false
}

/**
 * 後方互換性のための定数（非推奨: 代わりに isDemoMode() または isDemoModeServer() を使用）
 * @deprecated 新しいコードでは isDemoMode() または isDemoModeServer() を使用してください
 */
export const IS_DEMO_MODE = isDemoModeServer();

