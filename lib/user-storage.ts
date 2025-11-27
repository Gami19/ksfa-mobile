/**
 * ユーザー情報のlocalStorage管理ユーティリティ
 */

const USER_STORAGE_KEY = 'ksfa-user-info'

export interface UserInfo {
  user_id: string
  name: string
}

/**
 * localStorageからユーザー情報を取得
 */
export function getUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    if (!stored) {
      return null
    }

    const userInfo = JSON.parse(stored) as UserInfo
    return userInfo
  } catch (error) {
    console.error('Error getting user info from localStorage:', error)
    return null
  }
}

/**
 * localStorageにユーザー情報を保存
 */
export function setUserInfo(user_id: string, name: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const userInfo: UserInfo = {
      user_id,
      name,
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userInfo))
  } catch (error) {
    console.error('Error setting user info to localStorage:', error)
  }
}

/**
 * localStorageからユーザー情報を削除
 */
export function clearUserInfo(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(USER_STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing user info from localStorage:', error)
  }
}

/**
 * ユーザー情報が存在するかチェック
 */
export function hasUserInfo(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return getUserInfo() !== null
}

