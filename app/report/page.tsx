"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import BottomNav from "@/components/ui/BottomNav";
import GlassCard from "@/components/ui/GlassCard";
import { Mic, Plus, X, Send, Calendar, Clock, Tag, ChevronRight, Sparkles } from "lucide-react";
import { IS_DEMO_MODE } from "@/lib/config";
import type { ReportEntry, GroupedReports } from "@/lib/types/report";

export default function ReportPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<ReportEntry | null>(null);

  // デモ用: サンプルタイムライン（過去の履歴を含む）
  const [entries] = useState<ReportEntry[]>([
    // 今日
    {
      id: "1",
      date: new Date().toISOString().split("T")[0],
      time: "09:30",
      content: "作業開始。本日の生産目標は100個です。機械の点検も完了しました。",
      summary: "作業開始・生産目標100個・機械点検完了",
      tags: ["作業開始", "生産目標", "点検"],
      type: "text",
    },
    {
      id: "2",
      date: new Date().toISOString().split("T")[0],
      time: "10:15",
      content: "機械Aのメンテナンスを実施しました。オイル交換と清掃を行い、異常はありませんでした。",
      summary: "機械Aメンテナンス完了・オイル交換・清掃実施",
      tags: ["メンテナンス", "機械A", "オイル交換"],
      type: "voice",
      duration: 45,
    },
    {
      id: "3",
      date: new Date().toISOString().split("T")[0],
      time: "11:00",
      content: "品質チェック完了。不良品は0個でした。すべての製品が基準をクリアしています。",
      summary: "品質チェック完了・不良品0個・全製品基準クリア",
      tags: ["品質チェック", "不良品0", "基準クリア"],
      type: "text",
    },
    // 昨日
    {
      id: "4",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      time: "14:30",
      content: "午後の作業を開始。生産ラインの調子が良く、順調に進んでいます。",
      summary: "午後作業開始・生産ライン順調",
      tags: ["午後作業", "生産ライン"],
      type: "voice",
      duration: 30,
    },
    {
      id: "5",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      time: "16:00",
      content: "本日の作業を完了。目標達成しました。",
      summary: "作業完了・目標達成",
      tags: ["作業完了", "目標達成"],
      type: "text",
    },
    // 一昨日
    {
      id: "6",
      date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
      time: "09:00",
      content: "週明けの作業開始。週末の点検結果を確認し、問題なく開始できました。",
      summary: "週明け作業開始・週末点検確認・問題なし",
      tags: ["週明け", "点検確認"],
      type: "text",
    },
  ]);

  // 日付ごとにグループ化
  const groupedReports = useMemo<GroupedReports[]>(() => {
    const grouped = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {} as Record<string, ReportEntry[]>);

    return Object.entries(grouped)
      .map(([date, entries]) => {
        const entryDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let displayDate: string;
        if (entryDate.getTime() === today.getTime()) {
          displayDate = "今日";
        } else if (entryDate.getTime() === yesterday.getTime()) {
          displayDate = "昨日";
        } else {
          displayDate = `${entryDate.getMonth() + 1}月${entryDate.getDate()}日`;
        }

        return {
          date,
          displayDate,
          entries: entries.sort((a, b) => b.time.localeCompare(a.time)), // 新しい順
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // 新しい日付順
  }, [entries]);

  // 日付フォーマット関数
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const entryDate = new Date(dateString);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === today.getTime()) {
      return "今日";
    } else if (entryDate.getTime() === yesterday.getTime()) {
      return "昨日";
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  const handleStartRecording = () => {
    if (IS_DEMO_MODE) {
      // デモモード: 録音せず、「話したふり」をして固定テキストを入力
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setTranscript("本日の作業は順調に進んでいます。特に問題はありません。");
      }, 2000);
    } else {
      // 実装時: 実際の音声録音処理
      setIsRecording(true);
      // TODO: 音声録音処理
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSend = () => {
    if (transcript.trim()) {
      // デモモード: 新しいエントリーを追加（実際はAPIコール）
      if (IS_DEMO_MODE) {
        const newEntry: ReportEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          content: transcript,
          summary: transcript.length > 30 ? transcript.substring(0, 30) + "..." : transcript,
          tags: ["音声入力"], // デモ用の簡易タグ
          type: "voice",
          duration: 30,
        };
        // 実際の実装では、ここでAPIコールしてentriesを更新
        console.log("New entry:", newEntry);
      }
      setTranscript("");
      setShowRecordModal(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full pb-24">
        {/* ヘッダー */}
        <div 
          className="p-6 animate-fade-in-up" 
          style={{ 
            paddingTop: "calc(1.5rem + env(safe-area-inset-top))",
            animationDelay: "100ms",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-red-600 animate-pulse" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              作業<span className="gradient-text">日報</span>
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-2 font-medium">業務の軌跡 - Timeline of Work</p>
        </div>

        {/* タイムライン - 日付ごとにグループ化 */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-32">
          {groupedReports.map((group, groupIndex) => (
            <div key={group.date} className="space-y-4">
              {/* 日付ヘッダー */}
              <div className="flex items-center gap-3 sticky top-0 z-20 py-3 -mx-6 px-6 glass-enhanced border-b border-white/50">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600/20 to-red-500/10 flex items-center justify-center border border-red-600/20">
                  <Calendar className="w-4 h-4 text-red-600" />
                </div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  {group.displayDate}
                </h2>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-red-600/20 via-red-600/10 to-transparent" />
                <div className="px-2.5 py-1 rounded-full bg-red-600/10 border border-red-600/20">
                  <span className="text-xs font-black text-red-600">
                    {group.entries.length}件
                  </span>
                </div>
              </div>

              {/* エントリーリスト */}
              {group.entries.map((entry, entryIndex) => (
                <GlassCard 
                  key={entry.id} 
                  variant="enhanced" 
                  delay={200 + groupIndex * 50 + entryIndex * 100}
                  className="p-5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => setSelectedEntry(entry)}
                >
                  {/* 装飾的なグラデーション */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-600/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex gap-5 relative z-10">
                    {/* タイムラインのドット */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-600 to-red-500 shadow-lg glow-red-sm" />
                        <div className="absolute inset-0 w-4 h-4 rounded-full bg-red-600/30 animate-ping" />
                      </div>
                      {entryIndex < group.entries.length - 1 && (
                        <div className="w-0.5 h-full bg-gradient-to-b from-red-600/20 to-transparent mt-2 min-h-[80px]" />
                      )}
                    </div>

                    {/* コンテンツ */}
                    <div className="flex-1 pb-2 space-y-3">
                      {/* ヘッダー（時刻・タイプ） */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-sm font-mono font-black text-slate-700 tracking-tight">
                              {entry.time}
                            </span>
                          </div>
                          {entry.type === "voice" && (
                            <div className="px-2 py-0.5 rounded-full bg-red-600/10 border border-red-600/20 flex items-center gap-1">
                              <Mic className="w-3 h-3 text-red-600" />
                              {entry.duration && (
                                <span className="text-xs font-semibold text-red-600">
                                  {entry.duration}秒
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>

                      {/* AI要約 */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-800 leading-relaxed font-semibold text-sm">
                            {entry.summary}
                          </p>
                        </div>
                      </div>

                      {/* タグ */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag, tagIndex) => (
                            <div
                              key={tagIndex}
                              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600/10 to-red-500/5 border border-red-600/20 flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3 text-red-600" />
                              <span className="text-xs font-semibold text-red-600">{tag}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ))}

          {/* 空の状態 */}
          {groupedReports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">まだ日報がありません</p>
              <p className="text-sm text-slate-400 mt-2">録音ボタンから日報を追加してください</p>
            </div>
          )}
        </div>

        {/* 常時表示される録音ボタン - シームレスな入力 */}
        <div className="fixed bottom-24 left-0 right-0 z-40 px-6" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <button
            onClick={() => setShowRecordModal(true)}
            className="w-full relative rounded-3xl bg-gradient-to-r from-red-600 to-red-500 text-white shadow-2xl glow-red-sm hover:glow-red active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 py-4 group"
          >
            <div className="relative">
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
            </div>
            <span className="font-black text-lg">音声で日報を追加</span>
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* 録音モーダル - より洗練されたデザイン */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end animate-fade-in">
          <div className="w-full glass-enhanced rounded-t-3xl p-6 pb-safe-area-inset-bottom animate-fade-in-up border-t border-white/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                音声<span className="gradient-text">入力</span>
              </h2>
              <button
                onClick={() => {
                  setShowRecordModal(false);
                  setIsRecording(false);
                  setTranscript("");
                }}
                className="w-10 h-10 rounded-2xl bg-slate-100/50 hover:bg-slate-200/50 flex items-center justify-center active:scale-95 transition-all duration-200"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {IS_DEMO_MODE ? (
              // デモモード: 録音せず、「話したふり」をして固定テキストを入力
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 min-h-[200px] border border-slate-200/50 shadow-inner">
                  {transcript ? (
                    <p className="text-slate-800 leading-relaxed font-medium">{transcript}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                      <Mic className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-slate-400 text-sm font-medium">
                        デモモード: 録音ボタンを押すと<br />自動でテキストが入力されます
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  {!isRecording && !transcript ? (
                    <button
                      onClick={handleStartRecording}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-5 rounded-3xl font-black active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl glow-red-sm hover:glow-red hover:scale-[1.02]"
                    >
                      <Mic className="w-5 h-5" />
                      録音開始
                    </button>
                  ) : isRecording ? (
                    <button
                      onClick={handleStopRecording}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-5 rounded-3xl font-black active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl glow-red"
                    >
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      録音中...
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleStartRecording}
                        className="flex-1 glass-enhanced text-slate-800 py-5 rounded-3xl font-black active:scale-[0.98] transition-all duration-300 hover:scale-[1.01]"
                      >
                        再録音
                      </button>
                      <button
                        onClick={handleSend}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-5 rounded-3xl font-black active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl glow-red-sm hover:glow-red hover:scale-[1.02]"
                      >
                        <Send className="w-5 h-5" />
                        送信
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // 実装時: 実際の音声録音UI
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 min-h-[200px]">
                  <p className="text-slate-400 text-center py-8">
                    音声録音実装予定
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 詳細表示モーダル */}
      {selectedEntry && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end animate-fade-in"
          onClick={() => setSelectedEntry(null)}
        >
          <div 
            className="w-full glass-enhanced rounded-t-3xl p-6 pb-safe-area-inset-bottom animate-fade-in-up border-t border-white/60 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                日報<span className="gradient-text">詳細</span>
              </h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-10 h-10 rounded-2xl bg-slate-100/50 hover:bg-slate-200/50 flex items-center justify-center active:scale-95 transition-all duration-200"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 日時情報 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-600">
                    {formatDate(selectedEntry.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-mono font-black text-slate-700">
                    {selectedEntry.time}
                  </span>
                </div>
                {selectedEntry.type === "voice" && selectedEntry.duration && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20">
                    <Mic className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-xs font-semibold text-red-600">
                      {selectedEntry.duration}秒
                    </span>
                  </div>
                )}
              </div>

              {/* AI要約 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-black text-slate-800">AI要約</h3>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-200/50">
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {selectedEntry.summary}
                  </p>
                </div>
              </div>

              {/* 全文 */}
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800">全文</h3>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-200/50">
                  <p className="text-slate-800 leading-relaxed">{selectedEntry.content}</p>
                </div>
              </div>

              {/* タグ */}
              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-800">タグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag, tagIndex) => (
                      <div
                        key={tagIndex}
                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600/10 to-red-500/5 border border-red-600/20 flex items-center gap-1.5"
                      >
                        <Tag className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </AppShell>
  );
}

