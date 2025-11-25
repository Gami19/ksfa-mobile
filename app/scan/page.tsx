"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import BottomNav from "@/components/ui/BottomNav";
import { IS_DEMO_MODE } from "@/lib/config";
import { Loader2, Camera } from "lucide-react";

export default function ScanPage() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  // カメラ起動処理
  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        setCameraError(null);
        
        // 既存のストリームがあれば停止
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          streamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // バックカメラを優先
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (!isMounted) {
          // コンポーネントがアンマウントされた場合はストリームを停止
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        
        if (video) {
          // 既存のsrcObjectをクリア
          if (video.srcObject) {
            const oldStream = video.srcObject as MediaStream;
            oldStream.getTracks().forEach((track) => {
              track.stop();
            });
          }
          
          video.srcObject = stream;
          
          // play()をawaitで待機し、エラーハンドリングを追加
          try {
            await video.play();
          } catch (playError) {
            // AbortErrorは無視（新しいロードリクエストによる中断は正常）
            if (playError instanceof Error && playError.name !== "AbortError") {
              console.warn("ビデオ再生エラー:", playError);
            }
          }
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error("カメラアクセスエラー:", error);
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            setCameraError("カメラへのアクセスが拒否されました。ブラウザの設定でカメラの許可を確認してください。");
          } else if (error.name === "NotFoundError") {
            setCameraError("カメラが見つかりませんでした。");
          } else {
            setCameraError("カメラの起動に失敗しました。");
          }
        } else {
          setCameraError("カメラの起動に失敗しました。");
        }
      }
    };

    startCamera();

    // クリーンアップ: コンポーネントアンマウント時にカメラストリームを停止
    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const handleCapture = () => {
    if (IS_DEMO_MODE) {
      // デモモード: 即座に撮影完了として解析開始
      setIsCapturing(false);
      setIsAnalyzing(true);
      
      // 3秒間の解析中アニメーション
      setTimeout(() => {
        setIsAnalyzing(false);
        router.push("/scan/result");
      }, 3000);
    } else {
      // 実装時: 実際のカメラ撮影処理
      setIsCapturing(true);
      // TODO: カメラ撮影処理
    }
  };

  if (isAnalyzing) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-full gap-8 animate-fade-in">
          <div className="relative">
            {/* 外側のグローリング */}
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-red-600/20 blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl glass-enhanced flex items-center justify-center shadow-2xl">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              解析<span className="gradient-text">中</span>...
            </h2>
            <p className="text-sm text-slate-500 font-medium">画像を分析しています</p>
            {/* プログレスドット */}
            <div className="flex gap-2 justify-center mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-red-600/40 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms`, animationDuration: "1s" }}
                />
              ))}
            </div>
          </div>
        </div>
        <BottomNav />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full pb-24 min-h-0">
        {/* ヘッダー */}
        <div 
          className="p-6 flex-shrink-0 animate-fade-in-up" 
          style={{ 
            paddingTop: "calc(1.5rem + env(safe-area-inset-top))",
            animationDelay: "100ms",
          }}
        >
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            品質<span className="gradient-text">スキャン</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">製品をカメラに向けてください</p>
        </div>

        {/* カメラビューエリア */}
        <div className="flex-1 relative min-h-0 overflow-hidden">
          {cameraError ? (
            // カメラエラー表示
            <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900 to-black flex items-center justify-center">
              <div className="text-center px-6 space-y-4">
                <p className="text-white/70 text-sm">{cameraError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  再試行
                </button>
              </div>
            </div>
          ) : (
            // カメラビュー + HUDオーバーレイ
            <div 
              className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden"
              onClick={handleCapture}
            >
              {/* カメラ映像 */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }} // ミラー表示
              />

              {/* HUD オーバーレイ - より洗練されたデザイン */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-80 h-80 animate-scale-in">
                  {/* 外側の枠線 - グロー効果付き */}
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                    {/* 四隅のコーナーマーカー - より大きく、アニメーション付き */}
                    <div className="absolute -top-2 -left-2 w-12 h-12">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-600 rounded-tl-lg glow-red-sm" />
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500/50 rounded-tl-lg animate-pulse" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12">
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-600 rounded-tr-lg glow-red-sm" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500/50 rounded-tr-lg animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 w-12 h-12">
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-600 rounded-bl-lg glow-red-sm" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500/50 rounded-bl-lg animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12">
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-600 rounded-br-lg glow-red-sm" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500/50 rounded-br-lg animate-pulse" />
                    </div>
                  </div>
                  
                  {/* 中央のガイドライン - より洗練されたデザイン */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                  </div>

                  {/* 中央のフォーカスリング */}
                  <div className="absolute inset-4 rounded-xl border border-red-600/20 animate-pulse" />
                </div>
              </div>

              {/* カメラアイコンボタン */}
              <div className="absolute bottom-24 left-0 right-0 flex justify-center animate-fade-in-up pointer-events-none">
                <button
                  onClick={handleCapture}
                  className="pointer-events-auto w-20 h-20 rounded-full glass-enhanced backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
                >
                  <div className="absolute inset-0 rounded-full bg-red-600/20 blur-xl group-hover:bg-red-600/30 transition-colors" />
                  <Camera className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </AppShell>
  );
}

