"use client";

import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* 背景のオーブアニメーション - より洗練されたレイヤー */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 赤いオーブ - メイン */}
        <div 
          className="absolute -top-1/2 -left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-red-600/25 via-red-500/15 to-transparent rounded-full blur-3xl animate-float"
        >
          <div 
            className="absolute inset-0 bg-gradient-to-br from-red-600/15 to-transparent rounded-full blur-2xl animate-pulse"
            style={{ 
              animationDuration: "4s",
            }} 
          />
          {/* 内側のグロー */}
          <div 
            className="absolute inset-8 bg-red-600/10 rounded-full blur-xl"
            style={{ 
              animationDuration: "6s",
            }} 
          />
        </div>
        
        {/* 青いオーブ */}
        <div 
          className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent rounded-full blur-3xl animate-float"
          style={{ 
            animationDuration: "12s",
            animationDelay: "1s",
          }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-2xl animate-pulse"
            style={{ 
              animationDuration: "6s",
              animationDelay: "2s",
            }} 
          />
        </div>

        {/* 追加の装飾的なグラデーション */}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-red-600/5 to-blue-600/5 rounded-full blur-3xl animate-float" 
          style={{ animationDuration: "15s", animationDelay: "3s" }} 
        />
      </div>

      {/* グリッドパターン（微細な装飾） */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* メインコンテンツ */}
      <div className="relative z-10 w-full h-full overflow-y-auto overscroll-none">
        {children}
      </div>
    </div>
  );
}

