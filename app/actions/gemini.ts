'use server'

import { GoogleGenAI } from '@google/genai'
import { isDemoModeServer } from '@/lib/config'

export interface AnalyzeImageResult {
  status: 'OK' | 'NG' | 'WARNING'
  confidence: number
  comment: string
  details?: string[]
}

// 使用するモデル（無料枠で1日250回まで利用可能）
const GEMINI_MODEL = 'gemini-2.5-flash'

// レート制限: 分間10回（RPM: Requests Per Minute）
// 1回のリクエスト間隔 = 60秒 / 10回 = 6秒
const MIN_REQUEST_INTERVAL_MS = 6000 // 6秒

// 最後のリクエスト時刻を記録（メモリ上）
let lastRequestTime: number = 0

/**
 * リクエスト間隔を制御する関数
 * 前回のリクエストから最低6秒経過するまで待機
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest
    console.log(`[Gemini API] レート制限: ${waitTime}ms待機します（前回リクエストから${timeSinceLastRequest}ms経過）`)
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }

  lastRequestTime = Date.now()
}

/**
 * データURLからBase64文字列とMIMEタイプを抽出
 */
function extractBase64FromDataUrl(dataUrl: string): { base64: string; mimeType: string } {
  // data:image/jpeg;base64,/9j/4AAQSkZJRg... の形式から抽出
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9+]+);base64,(.+)$/)
  
  if (!matches || matches.length < 3) {
    throw new Error('無効なデータURL形式です')
  }

  return {
    mimeType: matches[1], // image/jpeg
    base64: matches[2],   // Base64文字列部分のみ
  }
}

/**
 * Gemini APIを使用して画像を解析し、品質判定を行う
 * 
 * 無料枠制限:
 * - Gemini 2.5 Flash: 1日250回まで、分間10回まで（RPM: 10）
 * - リクエスト間隔を自動制御して過負荷を防止
 * 
 * @param imageDataUrl - Canvasから取得したBase64データURL (data:image/jpeg;base64,...)
 */
export async function analyzeQualityWithGemini(
  imageDataUrl: string
): Promise<AnalyzeImageResult> {
  // デモモードの場合はモックデータを返す（APIコールを節約）
  if (isDemoModeServer()) {
    console.log('[Gemini API] デモモード: モックデータを返します')
    return {
      status: 'NG',
      confidence: 0.85,
      comment: '表面に傷が検出されました。寸法が基準値を外れています。',
      details: [
        '表面に傷が検出されました',
        '寸法が基準値を外れています',
      ],
    }
  }

  try {
    // レート制限: 前回のリクエストから最低6秒間隔を確保
    await waitForRateLimit()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEYが設定されていません')
    }

    // データURLからBase64部分とMIMEタイプを抽出
    const { base64, mimeType } = extractBase64FromDataUrl(imageDataUrl)

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `あなたは製造業の品質管理専門家です。
以下の画像を分析して、製品の品質を判定してください。

判定基準:
- OK: 製品に問題がなく、品質基準を満たしている
  * 表面に傷や汚れがない
  * 寸法が基準値内にある
  * 形状が正しい
- WARNING: 軽微な問題があるが、使用可能
  * 小さな傷や汚れがある
  * 寸法が基準値からわずかに外れている
- NG: 重大な欠陥があり、品質基準を満たしていない
  * 大きな傷や破損がある
  * 寸法が基準値を大きく外れている
  * 形状が明らかに間違っている

以下のJSON形式で回答してください:
{
  "status": "OK" | "NG" | "WARNING",
  "confidence": 0.0-1.0の数値（判定の確信度）,
  "comment": "判定理由の詳細説明（日本語、100文字以内）",
  "details": ["検出された問題点1", "検出された問題点2", ...]
}

画像を分析してください:`

    const contents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64,
        },
      },
      { text: prompt },
    ]

    console.log(`[Gemini API] モデル: ${GEMINI_MODEL} で画像解析を開始`)

    // リトライロジック（最大2回、503エラーのみ）
    const maxRetries = 2
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // API呼び出し（無料枠: 1日250回、分間10回まで）
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: contents,
        })

        const text = response.text

        if (!text) {
          throw new Error('Gemini APIからレスポンスが返されませんでした')
        }

        // JSONを抽出（マークダウンコードブロックから抽出）
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                         text.match(/\{[\s\S]*\}/)
        
        if (!jsonMatch) {
          throw new Error('Gemini APIのレスポンスからJSONを抽出できませんでした')
        }

        const parsedResult = JSON.parse(jsonMatch[1] || jsonMatch[0]) as AnalyzeImageResult

        // バリデーション
        if (!['OK', 'NG', 'WARNING'].includes(parsedResult.status)) {
          throw new Error(`無効なステータスが返されました: ${parsedResult.status}`)
        }

        if (typeof parsedResult.confidence !== 'number' || 
            parsedResult.confidence < 0 || 
            parsedResult.confidence > 1) {
          throw new Error(`無効な確信度が返されました: ${parsedResult.confidence}`)
        }

        console.log(`[Gemini API] 解析完了: ${parsedResult.status} (confidence: ${parsedResult.confidence})`)

        return parsedResult

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // 503エラー（モデル過負荷）または429エラー（レート制限）をチェック
        const errorMessage = lastError.message.toLowerCase()
        const errorObj = error as { error?: { code?: number }; code?: number }
        
        const is503Error = errorMessage.includes('503') || 
                           errorMessage.includes('overloaded') || 
                           errorMessage.includes('unavailable') ||
                           errorObj?.error?.code === 503 ||
                           errorObj?.code === 503
        
        const is429Error = errorMessage.includes('429') || 
                           errorMessage.includes('rate limit') ||
                           errorObj?.error?.code === 429 ||
                           errorObj?.code === 429

        // 429エラー（レート制限）の場合はリトライしない
        if (is429Error) {
          console.error('[Gemini API] レート制限エラー:', error)
          throw new Error('1日の利用回数制限に達しました。明日までお待ちください。')
        }

        // 503エラー（モデル過負荷）の場合は、さらに長い間隔でリトライ
        if (is503Error && attempt < maxRetries) {
          // 503エラーの場合は、より長い待機時間（12秒、24秒）
          const delayMs = Math.pow(2, attempt) * 12000 // 12秒、24秒
          console.warn(`[Gemini API] モデル過負荷エラー (503)。${delayMs}ms後にリトライします... (試行 ${attempt + 1}/${maxRetries + 1})`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
          
          // リトライ前に再度レート制限をチェック
          await waitForRateLimit()
          continue
        }

        // その他のエラーまたはリトライ上限に達した場合
        console.error('[Gemini API] エラー:', error)
        
        if (is503Error) {
          throw new Error('Gemini APIのサーバーが現在過負荷のため、しばらく時間をおいてから再度お試しください。')
        }

        // その他のエラー
        throw lastError
      }
    }

    // この行には到達しないはずだが、TypeScriptの型チェックのため
    throw lastError || new Error('画像解析中に不明なエラーが発生しました')
    
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error)
    
    // エラーメッセージをそのまま投げる（既に適切なメッセージが設定されている）
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('画像解析中に不明なエラーが発生しました')
  }
}

