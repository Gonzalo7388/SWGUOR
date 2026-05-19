import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  isActive?: boolean;
  color?: "pink" | "emerald" | "orange" | "blue" | "slate";
  onClick?: () => void;
  disabled?: boolean;
}

const colorStyles = {
  pink: {
    active: "border-pink-500 ring-pink-50 bg-white",
    iconActive: "bg-pink-600 text-white",
    textActive: "text-pink-600",
  },
  emerald: {
    active: "border-emerald-500 ring-emerald-50 bg-white",
    iconActive: "bg-emerald-600 text-white",
    textActive: "text-emerald-600",
  },
  orange: {
    active: "border-orange-500 ring-orange-50 bg-white",
    iconActive: "bg-orange-600 text-white",
    textActive: "text-orange-600",
  },
  blue: {
    active: "border-blue-500 ring-blue-50 bg-white",
    iconActive: "bg-blue-600 text-white",
    textActive: "text-blue-600",
  },
  slate: {
    active: "border-slate-500 ring-slate-50 bg-white",
    iconActive: "bg-slate-600 text-white",
    textActive: "text-slate-600",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  isActive,
  color = "slate",
  onClick,
  disabled,
}: StatCardProps) {
  const s = colorStyles[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 text-left w-full",
        isActive
          ? cn("ring-4 shadow-xl scale-[1.02] z-10", s.active)
          : "bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:cursor-default disabled:opacity-60"
      )}
    >
      <div
        className={cn(
          "p-3 rounded-lg transition-all duration-300",
          isActive
            ? cn(s.iconActive, "rotate-3")
            : "bg-gray-100 text-gray-600 group-hover:rotate-3"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
          {title}
        </p>
        <p
          className={cn(
            "text-2xl font-black tracking-tight",
            isActive ? s.textActive : "text-gray-800"
          )}
        >
          {value}
        </p>
      </div>
    </button>
  );
}
