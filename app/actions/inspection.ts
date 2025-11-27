'use server'

import { createClient } from '@/lib/supabase/server'

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
  error?: string
}

/**
 * 検査ログを作成し、NGの場合はアラートも作成する
 */
export async function createInspectionLog(
  params: CreateInspectionLogParams
): Promise<CreateInspectionLogResult> {
  try {
    const supabase = await createClient()

    // 1. inspection_logsテーブルにデータを保存
    const { data: inspectionLog, error: inspectionError } = await supabase
      .from('inspection_logs')
      .insert({
        user_id: params.user_id,
        part_id: params.part_id,
        status: params.status,
        ai_confidence: params.ai_confidence ?? null,
        photo_url: params.photo_url ?? null,
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
          photo_url: params.photo_url ?? null,
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

      return {
        success: true,
        inspection_log_id,
        alert_id: alert.id,
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

