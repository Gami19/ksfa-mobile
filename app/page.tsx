"use client";

import AppShell from "@/components/layout/AppShell";
import BottomNav from "@/components/ui/BottomNav";
import GlassCard from "@/components/ui/GlassCard";
import { User, ScanLine, Sparkles, Package, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col h-full pb-24">
        {/* ヘッダー */}
        <div 
          className="p-4 pb-3 animate-fade-in-up" 
          style={{ 
            paddingTop: "calc(1rem + env(safe-area-inset-top))",
            animationDelay: "100ms",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-red-600 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              KSFA <span className="gradient-text">Mobile</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">現場作業支援システム</p>
        </div>

        {/* メインコンテンツ - スクロールなしで全表示 */}
        <div className="flex-1 flex flex-col px-4 space-y-4 pb-4">
          {/* 作業者IDカード - コンパクトに */}
          <GlassCard variant="enhanced" delay={200} className="p-4 overflow-hidden relative">
            {/* 装飾的なグラデーション */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-600/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/20 to-red-500/10 flex items-center justify-center backdrop-blur-sm border border-red-600/20 shadow-lg">
                  <User className="w-7 h-7 text-red-600" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">作業者ID</p>
                <p className="text-2xl font-black font-mono text-slate-900 mb-0.5 tracking-tight">OP-001</p>
                <p className="text-xs text-slate-600 font-medium">山田 太郎</p>
              </div>
            </div>
          </GlassCard>

          {/* 機能ボタン - グリッドレイアウト */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {/* スキャン開始 */}
            <Link href="/scan" className="block">
              <GlassCard 
                variant="enhanced" 
                delay={300} 
                className="h-full p-6 text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-xl glow-red-sm group-hover:glow-red transition-all duration-500 group-hover:scale-110">
                      <ScanLine className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-red-600/30 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 tracking-tight">
                      スキャン<span className="gradient-text">開始</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">品質チェック</p>
                  </div>
                </div>
              </GlassCard>
            </Link>

            {/* 在庫確認 */}
            <Link href="/inventory" className="block">
              <GlassCard 
                variant="enhanced" 
                delay={350} 
                className="h-full p-6 text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 tracking-tight">
                      在庫<span className="text-blue-600">確認</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">在庫状況</p>
                  </div>
                </div>
              </GlassCard>
            </Link>

            {/* 日報管理 */}
            <Link href="/report" className="block col-span-2">
              <GlassCard 
                variant="enhanced" 
                delay={400} 
                className="p-5 text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center justify-center gap-4 relative z-10">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-black text-slate-800 mb-1 tracking-tight">
                      日報<span className="text-purple-600">管理</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">作業記録の確認・追加</p>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </AppShell>
  );
}
