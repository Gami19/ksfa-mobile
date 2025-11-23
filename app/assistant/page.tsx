"use client";

import { useState, useRef, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import BottomNav from "@/components/ui/BottomNav";
import GlassCard from "@/components/ui/GlassCard";
import { Zap, Send, Sparkles, ArrowLeft, Bot, Mic } from "lucide-react";
import Link from "next/link";
import { IS_DEMO_MODE } from "@/lib/config";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "こんにちは！AIコパイロットです。現場作業に関する質問や、作業手順の確認など、何でもお聞きください。⚡️",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // デモモード: 即座にAI応答を返す
    if (IS_DEMO_MODE) {
      setTimeout(() => {
        const responses = [
          "了解しました。その作業手順について、安全確認を最優先に行ってください。⚡️",
          "その問題については、まず機械の電源を確認し、次にエラーメッセージを確認してください。詳細な手順をお伝えできます。",
          "品質チェックのポイントは、表面の傷、寸法の確認、そして機能テストです。各項目を順番に確認していきましょう。",
          "メンテナンスのタイミングですね。定期メンテナンスのチェックリストに基づいて、順番に確認していきましょう。",
          "その作業は、安全装備を着用してから開始してください。手順書に従って、一つずつ丁寧に進めていきましょう。⚡️",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: randomResponse,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 800);
    } else {
      // 実装時: 実際のAI APIコール
      // TODO: AI API呼び出し
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartRecording = () => {
    if (IS_DEMO_MODE) {
      // デモモード: 録音せず、「話したふり」をして固定テキストを入力
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const voiceQueries = [
          "作業手順を教えてください",
          "エラーが発生しました。どうすればいいですか？",
          "品質チェックのポイントを確認したいです",
          "メンテナンスの手順を教えてください",
          "この機械の操作方法を確認したいです",
        ];
        const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
        setInput(randomQuery);
        inputRef.current?.focus();
      }, 2000);
    } else {
      // 実装時: 実際の音声録音処理
      setIsRecording(true);
      // TODO: 音声録音処理
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // 実装時: 音声をテキストに変換してinputにセット
  };

  const quickActions = [
    { label: "作業手順を確認", query: "作業手順を教えてください" },
    { label: "トラブル対応", query: "エラーが発生しました。どうすればいいですか？" },
    { label: "品質チェック", query: "品質チェックのポイントを教えてください" },
    { label: "メンテナンス", query: "定期メンテナンスの手順を確認したいです" },
  ];

  const handleQuickAction = (query: string) => {
    setInput(query);
    inputRef.current?.focus();
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
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 mb-4 hover:text-slate-800 transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">戻る</span>
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              AI<span className="gradient-text">コパイロット</span>
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-2 font-medium">現場アシスタント - 即座にサポート</p>
        </div>

        {/* クイックアクション */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.query)}
                  className="px-3 py-1.5 rounded-full glass-enhanced border border-white/50 text-xs font-semibold text-slate-700 active:scale-95 transition-all duration-200 hover:scale-105"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex animate-fade-in-up",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "max-w-[80%]",
                message.role === "user" ? "order-2" : "order-1"
              )}>
                <GlassCard variant="enhanced" className="p-4 relative overflow-hidden">
                  {message.role === "assistant" && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  )}
                  
                  <div className="flex items-start gap-3 relative z-10">
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 flex items-center justify-center border border-yellow-500/20 flex-shrink-0">
                        <Bot className="w-4 h-4 text-yellow-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-slate-800 leading-relaxed font-medium text-sm">
                        {message.content}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {message.timestamp.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600/20 to-red-500/10 flex items-center justify-center border border-red-600/20 flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>
          ))}

          {/* ローディング表示 */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <GlassCard variant="enhanced" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 flex items-center justify-center border border-yellow-500/20">
                    <Bot className="w-4 h-4 text-yellow-600 animate-pulse" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <div className="px-6 pb-6 pt-4 border-t border-white/30">
          <div className="flex items-end gap-2">
            {/* 音声入力ボタン */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 flex-shrink-0",
                isRecording
                  ? "bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg animate-pulse"
                  : "glass-enhanced border border-white/50 text-slate-700 hover:scale-105"
              )}
              disabled={isLoading}
            >
              {isRecording ? (
                <div className="relative">
                  <Mic className="w-5 h-5" />
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* テキスト入力 */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? "録音中..." : "質問を入力..."}
                className="w-full px-4 py-3 rounded-2xl glass-enhanced border border-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/30 transition-all"
                disabled={isLoading || isRecording}
              />
            </div>

            {/* 送信ボタン */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isRecording}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 flex-shrink-0",
                input.trim() && !isLoading && !isRecording
                  ? "bg-gradient-to-br from-yellow-500 to-yellow-400 text-white shadow-lg hover:shadow-xl hover:scale-105"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* 録音中のインジケーター */}
          {isRecording && (
            <div className="mt-3 flex items-center justify-center gap-2 animate-fade-in">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs font-semibold text-red-600">録音中... タップして停止</span>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </AppShell>
  );
}

