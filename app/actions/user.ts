'use server'

import { createClient } from '@/lib/supabase/server'

export interface CreateOrGetUserResult {
  success: boolean
  user_id?: string
  name?: string
  error?: string
}

/**
 * 名前でユーザーを検索し、存在しない場合は新規作成
 * 名前の重複は許可しない（既存ユーザーが存在する場合はエラーを返す）
 */
export async function createOrGetUser(name: string): Promise<CreateOrGetUserResult> {
  try {
    // 入力検証
    if (!name || name.trim() === '') {
      return {
        success: false,
        error: '名前を入力してください。',
      }
    }

    const trimmedName = name.trim()

    // 名前の長さ制限
    if (trimmedName.length > 50) {
      return {
        success: false,
        error: '名前が長すぎます。50文字以内で入力してください。',
      }
    }

    const supabase = await createClient()

    // 既存ユーザーを検索（完全一致）
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', trimmedName)
      .maybeSingle()

    if (searchError) {
      console.error('Error searching user:', searchError)
      return {
        success: false,
        error: `ユーザー検索エラー: ${searchError.message}`,
      }
    }

    // 既存ユーザーが存在する場合はエラー
    if (existingUser) {
      return {
        success: false,
        error: 'この名前は既に使用されています。別の名前を入力してください。',
      }
    }

    // 新規ユーザーを作成
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        name: trimmedName,
        role: 'worker',
        primary_language: 'ja',
      })
      .select('id, name')
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return {
        success: false,
        error: `ユーザー作成エラー: ${createError.message}`,
      }
    }

    return {
      success: true,
      user_id: newUser.id,
      name: newUser.name,
    }
  } catch (error) {
    console.error('Unexpected error in createOrGetUser:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    }
  }
}

/**
 * ユーザーIDがusersテーブルに存在するか確認
 */
export async function verifyUser(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error verifying user:', error)
      return false
    }

    return data !== null && data.id === userId
  } catch (error) {
    console.error('Unexpected error in verifyUser:', error)
    return false
  }
}

