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
 * - Gemini 2.5 Flash: 1日250回まで、分間10回まで
 * - 429エラー（Too Many Requests）が発生した場合は適切に処理
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
    console.error('Error analyzing image with Gemini:', error)
    
    // 429エラー（レート制限）の処理
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('rate limit'))) {
      throw new Error('1日の利用回数制限に達しました。明日までお待ちください。')
    }
    
    // その他のエラー
    if (error instanceof Error) {
      throw new Error(`画像解析エラー: ${error.message}`)
    }
    throw new Error('画像解析中に不明なエラーが発生しました')
  }
}

