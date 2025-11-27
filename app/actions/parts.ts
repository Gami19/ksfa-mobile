'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * parts_masterテーブルから最初の1件を取得
 * 存在しない場合はデフォルトのpart_idを作成して返す
 */
export async function getDefaultPartId(): Promise<string | null> {
  try {
    const supabase = await createClient()

    // 既存のpart_idを取得
    const { data, error } = await supabase
      .from('parts_master')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching default part_id:', error)
      // エラーが発生した場合は、デフォルトのpart_idを作成
      return await createDefaultPart()
    }

    // データが存在する場合はそのIDを返す
    if (data?.id) {
      return data.id
    }

    // データが存在しない場合はデフォルトのpart_idを作成
    console.log('[Parts] parts_masterテーブルが空のため、デフォルトのpart_idを作成します。')
    return await createDefaultPart()
  } catch (error) {
    console.error('Unexpected error in getDefaultPartId:', error)
    // エラーが発生した場合は、デフォルトのpart_idを作成を試みる
    return await createDefaultPart()
  }
}

/**
 * デフォルトのpart_idを作成
 */
async function createDefaultPart(): Promise<string | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('parts_master')
      .insert({
        part_name: 'デフォルト部品',
        qr_code: `DEFAULT-${Date.now()}`,
        location_code: 'A-00',
        stock_quantity: 0,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating default part:', error)
      return null
    }

    console.log('[Parts] デフォルトのpart_idを作成しました:', data.id)
    return data.id
  } catch (error) {
    console.error('Unexpected error in createDefaultPart:', error)
    return null
  }
}

