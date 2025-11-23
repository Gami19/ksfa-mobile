"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "enhanced" | "subtle";
  delay?: number;
}

/**
 * グラスモーフィズム風のカードコンポーネント
 * 
 * Platinum White デザインに基づき、半透明・白ボーダー・影を持つカード
 * エレガントで洗練されたデザイン
 */
export default function GlassCard({ 
  children, 
  className,
  onClick,
  variant = "default",
  delay = 0,
}: GlassCardProps) {
  const variantStyles = {
    default: "bg-white/70 backdrop-blur-md border border-white/50",
    enhanced: "glass-enhanced",
    subtle: "bg-white/60 backdrop-blur-sm border border-white/40",
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        "rounded-3xl shadow-xl",
        "transition-all duration-300 ease-out",
        "hover:shadow-2xl hover:scale-[1.01]",
        onClick && "cursor-pointer active:scale-[0.98]",
        "animate-fade-in-up",
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        animationFillMode: "forwards",
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

