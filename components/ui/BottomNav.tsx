"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/scan", icon: ScanLine, label: "スキャン" },
  { href: "/report", icon: FileText, label: "日報" },
];

/**
 * 画面下部に固定されるフローティングメニュー
 * 
 * Platinum White デザインに基づき、グラスモーフィズム風のデザイン
 */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-4 mb-4">
        <div className="glass-enhanced rounded-3xl shadow-2xl px-2 py-3 border border-white/60">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl",
                    "transition-all duration-300 ease-out",
                    "active:scale-90",
                    "relative group",
                    isActive
                      ? "text-red-600"
                      : "text-slate-600"
                  )}
                >
                  {/* アクティブ時の背景 */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-500/5 rounded-2xl animate-fade-in" />
                  )}
                  
                  <div className={cn(
                    "relative z-10 flex flex-col items-center gap-1.5",
                    isActive && "transform group-hover:scale-110"
                  )}>
                    <div className={cn(
                      "p-2 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-red-600/10 shadow-lg" 
                        : "group-hover:bg-slate-100/50"
                    )}>
                      <Icon
                        className={cn(
                          "w-6 h-6 transition-all duration-300",
                          isActive && "scale-110 drop-shadow-sm"
                        )}
                      />
                    </div>
                    <span className={cn(
                      "text-xs font-semibold transition-all duration-300",
                      isActive ? "text-red-600" : "text-slate-600 group-hover:text-slate-800"
                    )}>
                      {item.label}
                    </span>
                  </div>
                  
                  {/* アクティブインジケーター */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full animate-fade-in" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

