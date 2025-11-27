'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Base64データURLをBlobに変換
 */
function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    // data:image/jpeg;base64,/9j/4AAQSkZJRg... の形式からBase64部分を抽出
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9+]+);base64,(.+)$/)
    if (!matches || matches.length < 3) {
      console.error('[Storage] 無効なデータURL形式です')
      return null
    }

    const mimeType = matches[1] // image/jpeg
    const base64Data = matches[2] // Base64文字列部分

    // Base64をデコード
    const byteCharacters = atob(base64Data)
    const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0))
    const byteArray = new Uint8Array(byteNumbers)

    // Blobを作成
    return new Blob([byteArray], { type: mimeType })
  } catch (error) {
    console.error('[Storage] Base64データURLの変換エラー:', error)
    return null
  }
}

/**
 * ファイル名を生成
 */
function generateFileName(originalFileName?: string): string {
  if (originalFileName) {
    // 拡張子を取得
    const ext = originalFileName.split('.').pop() || 'jpg'
    return `inspection-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`
  }
  return `inspection-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`
}

/**
 * Base64データURLをSupabase Storageにアップロード
 * @param dataUrl Base64データURL (data:image/jpeg;base64,...)
 * @param fileName オプションのファイル名（指定しない場合は自動生成）
 * @returns アップロード成功時は公開URL、失敗時はnull
 */
export async function uploadPhotoToStorage(
  dataUrl: string,
  fileName?: string
): Promise<string | null> {
  try {
    // Base64データURLかチェック
    if (!dataUrl.startsWith('data:image/')) {
      console.log('[Storage] Base64データURLではないため、アップロードをスキップします:', dataUrl.substring(0, 50))
      return null
    }

    // Blobに変換
    const blob = dataUrlToBlob(dataUrl)
    if (!blob) {
      console.error('[Storage] Blobへの変換に失敗しました')
      return null
    }

    // ファイル名を生成
    const finalFileName = fileName || generateFileName()
    
    // MIMEタイプを取得
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9+]+);base64,/)
    const contentType = matches ? matches[1] : 'image/jpeg'

    // バケット名の確認
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME
    if (!bucketName) {
      console.error('[Storage] SUPABASE_STORAGE_BUCKET_NAME環境変数が設定されていません')
      return null
    }

    console.log('[Storage] アップロードを開始します - バケット:', bucketName, 'ファイル名:', finalFileName)

    const supabase = await createClient()

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(finalFileName, blob, {
        contentType: contentType,
        upsert: false, // 既存ファイルは上書きしない
      })

    if (uploadError) {
      console.error('[Storage] アップロードエラー:', uploadError)
      return null
    }

    if (!uploadData) {
      console.error('[Storage] アップロードデータが返されませんでした')
      return null
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(finalFileName)

    console.log('[Storage] アップロード成功 - URL:', publicUrl)

    return publicUrl
  } catch (error) {
    console.error('[Storage] 予期しないエラー:', error)
    return null
  }
}

