"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: "pink" | "blue" | "emerald" | "slate" | "sky" | "orange" | "red";
  isActive?: boolean;
  onClick?: () => void;
}

const colorVariants = {
  pink: {
    bg: "bg-pink-50",
    text: "text-pink-600",
    border: "border-pink-100",
    active: "ring-2 ring-pink-500 shadow-lg",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    active: "ring-2 ring-blue-500 shadow-lg",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    active: "ring-2 ring-emerald-500 shadow-lg",
  },
  slate: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-100",
    active: "ring-2 ring-slate-500 shadow-lg",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-100",
    active: "ring-2 ring-sky-500 shadow-lg",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
    active: "ring-2 ring-orange-500 shadow-lg",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    active: "ring-2 ring-red-500 shadow-lg",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "pink",
  isActive = false,
  onClick,
}: StatCardProps) {
  const colors = colorVariants[color];

  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border p-6 shadow-sm transition-all text-left w-full",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        colors.border,
        isActive && colors.active
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
            {title}
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {value.toLocaleString("es-PE")}
          </p>
        </div>
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", colors.bg)}>
          <Icon className={cn("h-6 w-6", colors.text)} />
        </div>
      </div>
    </button>
  );
}