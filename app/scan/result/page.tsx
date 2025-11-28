"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import BottomNav from "@/components/ui/BottomNav";
import GlassCard from "@/components/ui/GlassCard";
import { XCircle, CheckCircle, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { createInspectionLog } from "@/app/actions/inspection";
import { getDefaultPartId } from "@/app/actions/parts";
import { isDemoMode } from "@/lib/config";
import { getUserInfo, clearUserInfo } from "@/lib/user-storage";

const SCAN_RESULT_STORAGE_KEY = 'scan-result-data';

interface ScanResult {
  status: 'OK' | 'NG' | 'WARNING';
  message: string;
  details?: string[];
  photo_url?: string;
  ai_confidence?: number;
  ai_comment?: string;
}

export default function ScanResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isSaving, setIsSaving] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hasProcessedRef = useRef(false); // 重複処理防止用
  const isSavingRef = useRef(false); // 保存中フラグ

  const saveInspectionLog = useCallback(async (scanResult: ScanResult) => {
    // 重複実行防止: 既に保存処理中の場合はスキップ
    if (isSavingRef.current) {
      console.warn('[ScanResult] 保存処理が既に実行中のため、重複実行をスキップします。');
      return;
    }

    isSavingRef.current = true;

    try {
      // localStorageからuser_idを取得
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.user_id) {
        setSaveError('ユーザー情報が見つかりません。設定画面から再度お名前を入力してください。');
        setIsSaving(false);
        isSavingRef.current = false;
        return;
      }

      // user_idがusersテーブルに存在するか確認
      const { verifyUser } = await import('@/app/actions/user');
      const userExists = await verifyUser(userInfo.user_id);
      
      if (!userExists) {
        // ユーザーが存在しない場合、localStorageをクリアしてsetupページにリダイレクト
        console.warn('[ScanResult] user_idが存在しないため、ユーザー情報をクリアします:', userInfo.user_id);
        clearUserInfo();
        setSaveError('ユーザー情報が無効です。設定画面から再度お名前を入力してください。');
        setIsSaving(false);
        isSavingRef.current = false;
        // setupページにリダイレクト
        setTimeout(() => {
          router.push('/setup');
        }, 2000);
        return;
      }

      // part_idを取得（parts_masterから最初の1件、存在しない場合はデフォルトを作成）
      const part_id = await getDefaultPartId();
      if (!part_id) {
        setSaveError('部品情報の取得に失敗しました。データベースの設定を確認してください。');
        setIsSaving(false);
        isSavingRef.current = false;
        return;
      }

      console.log('[ScanResult] DB保存処理を開始 - user_id:', userInfo.user_id, 'part_id:', part_id);
      console.log('[ScanResult] スキャン結果ステータス:', scanResult.status);

      const saveResult = await createInspectionLog({
        user_id: userInfo.user_id,
        part_id,
        status: scanResult.status,
        ai_confidence: scanResult.ai_confidence ?? null,
        photo_url: scanResult.photo_url ?? null,
        ai_comment: scanResult.ai_comment ?? scanResult.message,
      });

      console.log('[ScanResult] DB保存結果:', {
        success: saveResult.success,
        inspection_log_id: saveResult.inspection_log_id,
        alert_id: saveResult.alert_id,
        alert_chat_id: saveResult.alert_chat_id,
        ai_learning_data_id: saveResult.ai_learning_data_id,
      });

      if (!saveResult.success) {
        setSaveError(saveResult.error || 'データの保存に失敗しました。');
      } else {
        console.log('[ScanResult] DB保存成功 - inspection_log_id:', saveResult.inspection_log_id);
        
        // アラートが作成された場合のログ
        if (saveResult.alert_id) {
          console.log('[ScanResult] アラートが作成されました - alert_id:', saveResult.alert_id);
          console.log('[ScanResult] Dashboardにリアルタイム通知が送信されるはずです');
          if (saveResult.alert_chat_id) {
            console.log('[ScanResult] alert_chat_id:', saveResult.alert_chat_id);
          }
          if (saveResult.ai_learning_data_id) {
            console.log('[ScanResult] ai_learning_data_id:', saveResult.ai_learning_data_id);
          }
        } else if (scanResult.status === 'NG') {
          console.warn('[ScanResult] statusがNGですが、アラートが作成されませんでした');
        }
        
        // StorageにアップロードされたURLがある場合は、表示用のresultを更新
        if (saveResult.photo_url && saveResult.photo_url !== scanResult.photo_url) {
          console.log('[ScanResult] StorageにアップロードされたURLで画像を更新:', saveResult.photo_url);
          setResult((prevResult) => {
            if (prevResult) {
              return {
                ...prevResult,
                photo_url: saveResult.photo_url || prevResult.photo_url,
              };
            }
            return prevResult;
          });
        }
      }

      // sessionStorageをクリア
      sessionStorage.removeItem(SCAN_RESULT_STORAGE_KEY);
      setIsSaving(false);
      isSavingRef.current = false;
    } catch (error) {
      console.error('Error saving inspection log:', error);
      setSaveError('データの保存中にエラーが発生しました。');
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [router]);

  // processScanResult関数をuseCallbackで定義（デモモードからも呼び出せるように）
  const processScanResult = useCallback((savedData: string) => {
    try {
      console.log('[ScanResult] データのパースを開始');
      const scanResult: ScanResult = JSON.parse(savedData);
      console.log('[ScanResult] データのパース成功:', scanResult);
      
      setResult(scanResult);

      // DB保存処理を実行（デモモードでも実行）
      console.log('[ScanResult] DB保存処理を開始');
      saveInspectionLog(scanResult);
    } catch (error) {
      console.error('[ScanResult] データのパースエラー:', error);
      console.error('[ScanResult] パースしようとしたデータ:', savedData?.substring(0, 200));
      
      if (error instanceof SyntaxError) {
        setSaveError('スキャン結果データの形式が正しくありません。スキャン画面から再度お試しください。');
      } else {
        setSaveError('スキャン結果データの処理中にエラーが発生しました。もう一度お試しください。');
      }
      setIsSaving(false);
    }
  }, [saveInspectionLog]);

  useEffect(() => {
    // 重複処理防止: 既に処理済みの場合はスキップ（React Strict Mode対策）
    if (hasProcessedRef.current) {
      console.log('[ScanResult] 既に処理済みのため、重複実行をスキップします。');
      return;
    }

    // デモモードの場合は、sessionStorageに依存せずにデモデータを直接使用
    // ただし、DB保存は実行する（デモモードでもデータを保存）
    if (isDemoMode()) {
      console.log('[ScanResult] デモモード: デモデータを直接使用');
      hasProcessedRef.current = true; // 処理済みフラグを設定
      
      // デモ用のプレースホルダー画像（Base64データURL）
      const demoImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuOBk+OCk+ODoeODu+OCpOODq+ODqeOCpDwvdGV4dD48L3N2Zz4=';
      
      const demoResult: ScanResult = {
        status: 'NG',
        message: '品質チェックに失敗しました',
        details: [
          '表面に傷が検出されました',
          '寸法が基準値を外れています',
        ],
        photo_url: demoImageUrl,
        ai_confidence: 0.85,
        ai_comment: '表面に傷が検出されました。寸法が基準値を外れています。',
      };
      setResult(demoResult);
      
      // デモモードでもDB保存を実行
      processScanResult(JSON.stringify(demoResult));
      return;
    }

    // 本番モード: sessionStorageからスキャン結果データを取得（最大5回まで再試行、より長い間隔で）
    const fetchScanResult = (retryCount = 0) => {
      // sessionStorageの全キーをデバッグ出力
      if (retryCount === 0) {
        console.log('[ScanResult] sessionStorageの全キー:', Object.keys(sessionStorage));
        console.log('[ScanResult] 取得しようとしているキー:', SCAN_RESULT_STORAGE_KEY);
      }
      
      const savedData = sessionStorage.getItem(SCAN_RESULT_STORAGE_KEY);
      
      console.log(`[ScanResult] sessionStorageからデータ取得 (試行 ${retryCount + 1}):`, savedData ? `データあり (${savedData.length}文字)` : 'データなし');
      
      if (!savedData) {
        // データが存在しない場合、少し待ってから再試行（最大5回）
        if (retryCount < 5) {
          const delayMs = 300 * (retryCount + 1); // 300ms, 600ms, 900ms, 1200ms, 1500ms で再試行
          console.log(`[ScanResult] データが見つかりません。${delayMs}ms後に再試行します... (残り ${5 - retryCount} 回)`);
          setTimeout(() => {
            fetchScanResult(retryCount + 1);
          }, delayMs);
          return;
        }
        
        // 5回試行しても見つからない場合
        console.error('[ScanResult] スキャン結果データが見つかりませんでした（5回試行後）');
        console.error('[ScanResult] sessionStorageの全内容:', Object.keys(sessionStorage).map(key => ({ key, value: sessionStorage.getItem(key)?.substring(0, 50) })));
        
        // エラーを表示するが、ユーザーには分かりやすいメッセージを表示
        setSaveError('スキャン結果データの読み込みに失敗しました。スキャン画面に戻って再度お試しください。');
        setIsSaving(false);
        return;
      }
      
      // データが見つかった場合の処理を続行
      hasProcessedRef.current = true; // 処理済みフラグを設定
      processScanResult(savedData);
    };
    
    // 本番モードの場合のみsessionStorageから取得を試行
    fetchScanResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 依存配列を空にして、初回マウント時のみ実行

  // データ取得中または保存中の場合はローディング表示
  if (isSaving) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-full gap-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-red-600/20 blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl glass-enhanced flex items-center justify-center shadow-2xl">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              保存<span className="gradient-text">中</span>...
            </h2>
            <p className="text-sm text-slate-500 font-medium">データを保存しています</p>
          </div>
        </div>
        <BottomNav />
      </AppShell>
    );
  }

  // エラーまたはデータが存在しない場合
  if (saveError || !result) {
    return (
      <AppShell>
        <div className="flex flex-col h-full pb-24">
          <div className="p-6 animate-fade-in-up" style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top))" }}>
            <Link href="/scan" className="inline-flex items-center gap-2 text-slate-600 mb-4 hover:text-slate-800 transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">戻る</span>
            </Link>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">エラー</h1>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            <GlassCard variant="enhanced" className="p-8">
              <div className="text-center space-y-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                <p className="text-slate-800 font-semibold">
                  {saveError || 'スキャン結果データが見つかりませんでした。'}
                </p>
                <Link
                  href="/scan"
                  className="inline-block bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-3xl font-black text-lg active:scale-[0.98] transition-all duration-300"
                >
                  再スキャン
                </Link>
              </div>
            </GlassCard>
          </div>
          <BottomNav />
        </div>
      </AppShell>
    );
  }

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
            ) : result.status === "WARNING" ? (
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-600/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
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
              ) : result.status === "WARNING" ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 w-28 h-28 rounded-full bg-yellow-600/20 blur-2xl animate-pulse" />
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 flex items-center justify-center border border-yellow-600/20 shadow-xl">
                      <XCircle className="w-14 h-14 text-yellow-600" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-5xl font-black text-yellow-600 mb-2 tracking-tight">警告</h2>
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

          {/* 撮影画像 */}
          {result.photo_url && (
            <GlassCard variant="enhanced" delay={300} className="p-6">
              <h3 className="text-lg font-black text-slate-800 mb-4 tracking-tight flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-600" />
                撮影画像
              </h3>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 bg-slate-100/50 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.photo_url}
                  alt="スキャン画像"
                  className="w-full h-full object-contain"
                />
              </div>
            </GlassCard>
          )}

          {/* 詳細情報 */}
          {result.details && result.details.length > 0 && (
            <GlassCard variant="enhanced" delay={400} className="p-6">
              <h3 className="text-lg font-black text-slate-800 mb-5 tracking-tight">詳細情報</h3>
              <ul className="space-y-3">
                {result.details.map((detail, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${500 + index * 100}ms` }}
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

