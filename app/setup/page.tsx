"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import GlassCard from "@/components/ui/GlassCard";
import { User, ArrowRight, Loader2 } from "lucide-react";
import { createOrGetUser } from "@/app/actions/user";
import { setUserInfo } from "@/lib/user-storage";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("名前を入力してください。");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createOrGetUser(name.trim());

      if (!result.success) {
        setError(result.error || "ユーザー登録に失敗しました。");
        setIsLoading(false);
        return;
      }

      // localStorageに保存
      if (result.user_id && result.name) {
        setUserInfo(result.user_id, result.name);
        console.log('[Setup] ユーザー情報を保存しました:', result);
        
        // ホーム画面にリダイレクト
        router.push("/");
      } else {
        setError("ユーザー情報の取得に失敗しました。");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError("予期しないエラーが発生しました。もう一度お試しください。");
      setIsLoading(false);
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
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            初回<span className="gradient-text">設定</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            お名前を入力してください
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex items-center justify-center px-6">
          <GlassCard variant="enhanced" delay={200} className="w-full max-w-md p-8">
            <div className="space-y-6">
              {/* アイコン */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-600/20 blur-2xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-500/10 flex items-center justify-center border border-red-600/20 shadow-xl">
                    <User className="w-10 h-10 text-red-600" />
                  </div>
                </div>
              </div>

              {/* 説明 */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  作業者名を入力
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  品質スキャンに使用するお名前を入力してください
                </p>
              </div>

              {/* フォーム */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    placeholder="例: 山田 太郎"
                    className="w-full px-4 py-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
                    maxLength={50}
                    disabled={isLoading}
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-2 text-right">
                    {name.length}/50文字
                  </p>
                </div>

                {/* エラーメッセージ */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 font-medium text-center">
                      {error}
                    </p>
                  </div>
                )}

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-5 rounded-2xl font-black text-lg active:scale-[0.98] transition-all duration-300 shadow-2xl glow-red-sm hover:glow-red hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>登録中...</span>
                    </>
                  ) : (
                    <>
                      <span>開始</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* 注意事項 */}
              <div className="pt-4 border-t border-white/30">
                <p className="text-xs text-slate-400 text-center">
                  注意: 既に使用されている名前は登録できません
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

