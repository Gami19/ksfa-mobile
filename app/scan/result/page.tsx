"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import BottomNav from "@/components/ui/BottomNav";
import GlassCard from "@/components/ui/GlassCard";
import { XCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ScanResultPage() {
  const router = useRouter();

  // デモ用: NG判定を表示
  const result = {
    status: "NG" as const,
    message: "品質チェックに失敗しました",
    details: [
      "表面に傷が検出されました",
      "寸法が基準値を外れています",
    ],
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
          <Link 
            href="/scan" 
            className="inline-flex items-center gap-2 text-slate-600 mb-4 hover:text-slate-800 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">戻る</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            スキャン<span className="gradient-text">結果</span>
          </h1>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          {/* 結果カード */}
          <GlassCard variant="enhanced" delay={200} className="p-8 relative overflow-hidden">
            {/* 背景のグラデーション */}
            {result.status === "NG" ? (
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-600/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            ) : (
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-600/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            )}
            
            <div className="flex flex-col items-center gap-6 relative z-10">
              {result.status === "NG" ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 w-28 h-28 rounded-full bg-red-600/20 blur-2xl animate-pulse" />
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-600/20 to-red-500/10 flex items-center justify-center border border-red-600/20 shadow-xl">
                      <XCircle className="w-14 h-14 text-red-600" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-5xl font-black text-red-600 mb-2 tracking-tight">NG</h2>
                    <p className="text-lg text-slate-800 font-semibold">{result.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 w-28 h-28 rounded-full bg-green-600/20 blur-2xl animate-pulse" />
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-green-600/20 to-green-500/10 flex items-center justify-center border border-green-600/20 shadow-xl">
                      <CheckCircle className="w-14 h-14 text-green-600" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-5xl font-black text-green-600 mb-2 tracking-tight">OK</h2>
                    <p className="text-lg text-slate-800 font-semibold">{result.message}</p>
                  </div>
                </>
              )}
            </div>
          </GlassCard>

          {/* 詳細情報 */}
          {result.details && result.details.length > 0 && (
            <GlassCard variant="enhanced" delay={300} className="p-6">
              <h3 className="text-lg font-black text-slate-800 mb-5 tracking-tight">詳細情報</h3>
              <ul className="space-y-3">
                {result.details.map((detail, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-red-600/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-xs font-bold">•</span>
                    </div>
                    <span className="text-slate-700 flex-1 font-medium leading-relaxed">{detail}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* アクションボタン */}
          <div className="space-y-3 pb-6">
            <Link
              href="/scan"
              className="block w-full bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-5 rounded-3xl font-black text-lg active:scale-[0.98] transition-all duration-300 shadow-2xl glow-red-sm hover:glow-red hover:scale-[1.02]"
            >
              再スキャン
            </Link>
            <Link
              href="/"
              className="block w-full glass-enhanced text-slate-800 text-center py-5 rounded-3xl font-black text-lg active:scale-[0.98] transition-all duration-300 hover:scale-[1.01]"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </AppShell>
  );
}

