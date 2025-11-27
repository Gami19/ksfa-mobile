'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadPhotoToStorage } from './storage'

export interface CreateInspectionLogParams {
  user_id: string
  part_id: string
  status: 'OK' | 'NG' | 'WARNING'
  ai_confidence?: number | null
  photo_url?: string | null
  ai_comment?: string | null
}

export interface CreateInspectionLogResult {
  success: boolean
  inspection_log_id?: string
  alert_id?: string
  alert_chat_id?: string
  ai_learning_data_id?: string
  error?: string
}

/**
 * 検査ログを作成し、NGの場合はアラート、alert_chats、ai_learning_dataも作成する
 */
export async function createInspectionLog(
  params: CreateInspectionLogParams
): Promise<CreateInspectionLogResult> {
  try {
    const supabase = await createClient()

    // photo_urlがBase64データURLの場合、Storageにアップロード
    let finalPhotoUrl = params.photo_url ?? null
    if (finalPhotoUrl && finalPhotoUrl.startsWith('data:image/')) {
      console.log('[InspectionLog] Base64データURLを検出しました。Storageにアップロードします。')
      const storageUrl = await uploadPhotoToStorage(finalPhotoUrl)
      if (storageUrl) {
        console.log('[InspectionLog] Storageアップロード成功:', storageUrl)
        finalPhotoUrl = storageUrl
      } else {
        console.warn('[InspectionLog] Storageアップロードに失敗しました。Base64データURLをそのまま使用します。')
        // アップロード失敗時はBase64データURLをそのまま使用（フォールバック）
      }
    }

    // 1. inspection_logsテーブルにデータを保存
    const { data: inspectionLog, error: inspectionError } = await supabase
      .from('inspection_logs')
      .insert({
        user_id: params.user_id,
        part_id: params.part_id,
        status: params.status,
        ai_confidence: params.ai_confidence ?? null,
        photo_url: finalPhotoUrl,
        ai_comment: params.ai_comment ?? null,
      })
      .select('id')
      .single()

    if (inspectionError) {
      console.error('Error creating inspection log:', inspectionError)
      return {
        success: false,
        error: `検査ログの作成に失敗しました: ${inspectionError.message}`,
      }
    }

    const inspection_log_id = inspectionLog.id

    // 2. statusが'NG'の場合はalertsテーブルにもデータを作成
    if (params.status === 'NG') {
      // AIコメントまたは詳細情報からタイトルを生成
      const alertTitle = params.ai_comment 
        ? params.ai_comment.length > 50 
          ? params.ai_comment.substring(0, 50) + '...'
          : params.ai_comment
        : '品質チェックに失敗しました'

      const { data: alert, error: alertError } = await supabase
        .from('alerts')
        .insert({
          user_id: params.user_id,
          inspection_log_id: inspection_log_id,
          title: alertTitle,
          severity: 'Medium', // デフォルトはMedium
          status: 'Open',
          photo_url: finalPhotoUrl,
        })
        .select('id')
        .single()

      if (alertError) {
        console.error('Error creating alert:', alertError)
        // アラート作成に失敗しても検査ログは作成済みなので、警告として返す
        return {
          success: true,
          inspection_log_id,
          error: `アラートの作成に失敗しました: ${alertError.message}`,
        }
      }

      const alert_id = alert.id
      let alert_chat_id: string | undefined
      let ai_learning_data_id: string | undefined

      // 3. alert_chatsテーブルに初期エントリを作成
      const initialChatContent = params.ai_comment || alertTitle
      const { data: alertChat, error: alertChatError } = await supabase
        .from('alert_chats')
        .insert({
          alert_id: alert_id,
          role: 'user',
          content: initialChatContent,
        })
        .select('id')
        .single()

      if (alertChatError) {
        console.error('Error creating alert_chat:', alertChatError)
        // alert_chat作成に失敗しても、アラートは作成済みなので警告のみ
      } else {
        alert_chat_id = alertChat.id
        console.log('[InspectionLog] alert_chatを作成しました:', alert_chat_id)
      }

      // 4. ai_learning_dataテーブルに初期エントリを作成
      const detectedIssues = params.ai_comment || alertTitle
      const { data: aiLearningData, error: aiLearningError } = await supabase
        .from('ai_learning_data')
        .insert({
          alert_id: alert_id,
          scan_image_url: finalPhotoUrl,
          detected_issues: detectedIssues,
          resolution: '', // NOT NULL制約があるため空文字列
          resolution_method: null,
          notes: null,
        })
        .select('id')
        .single()

      if (aiLearningError) {
        console.error('Error creating ai_learning_data:', aiLearningError)
        // ai_learning_data作成に失敗しても、アラートは作成済みなので警告のみ
      } else {
        ai_learning_data_id = aiLearningData.id
        console.log('[InspectionLog] ai_learning_dataを作成しました:', ai_learning_data_id)
      }

      return {
        success: true,
        inspection_log_id,
        alert_id,
        alert_chat_id,
        ai_learning_data_id,
      }
    }

    return {
      success: true,
      inspection_log_id,
    }
  } catch (error) {
    console.error('Unexpected error in createInspectionLog:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    }
  }
}

