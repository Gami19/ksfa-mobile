"use client";

import AppShell from "@/components/layout/AppShell";
import BottomNav from "@/components/ui/BottomNav";
import GlassCard from "@/components/ui/GlassCard";
import { Package, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  // デモ用: 在庫データ
  const inventoryItems = [
    { id: "1", name: "部品A", stock: 150, minStock: 100, unit: "個" },
    { id: "2", name: "部品B", stock: 45, minStock: 50, unit: "個" },
    { id: "3", name: "部品C", stock: 200, minStock: 150, unit: "個" },
    { id: "4", name: "部品D", stock: 30, minStock: 50, unit: "個" },
  ];

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
            <Package className="w-6 h-6 text-red-600" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              在庫<span className="gradient-text">確認</span>
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-2 font-medium">現在の在庫状況</p>
        </div>

        {/* 在庫リスト */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-6">
          {inventoryItems.map((item, index) => {
            const isLowStock = item.stock < item.minStock;
            
            return (
              <GlassCard 
                key={item.id} 
                variant="enhanced" 
                delay={200 + index * 100}
                className="p-5 relative overflow-hidden"
              >
                {/* 装飾的なグラデーション */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-600/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-black text-slate-800">{item.name}</h3>
                      {isLowStock && (
                        <div className="px-2 py-0.5 rounded-full bg-red-600/10 border border-red-600/20 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span className="text-xs font-semibold text-red-600">在庫不足</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-slate-900">
                        {item.stock}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">{item.unit}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      最低在庫: {item.minStock}{item.unit}
                    </p>
                  </div>
                  
                  {/* 在庫バー */}
                  <div className="w-24 flex flex-col items-end gap-2">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLowStock
                            ? "bg-gradient-to-r from-red-600 to-red-500"
                            : "bg-gradient-to-r from-green-600 to-green-500"
                        }`}
                        style={{
                          width: `${Math.min((item.stock / item.minStock) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className={`text-xs font-black ${
                      isLowStock ? "text-red-600" : "text-green-600"
                    }`}>
                      {Math.round((item.stock / item.minStock) * 100)}%
                    </span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </AppShell>
  );
}

