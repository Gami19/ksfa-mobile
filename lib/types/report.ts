/**
 * 日報エントリーの型定義
 */
export interface ReportEntry {
  id: string;
  date: string; // YYYY-MM-DD形式
  time: string; // HH:mm形式
  content: string; // 全文
  summary: string; // AI要約
  tags: string[]; // タグ配列
  type: "text" | "voice";
  duration?: number; // 音声の長さ（秒）
}

/**
 * 日付ごとにグループ化された日報
 */
export interface GroupedReports {
  date: string;
  displayDate: string; // 表示用日付（例: "今日", "昨日", "2024年1月15日"）
  entries: ReportEntry[];
}

