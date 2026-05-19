"use client";

import { Package, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  count: number;
  onClick: () => void;
}

function TabButton({ label, icon, isActive, count, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all",
        isActive
          ? "bg-pink-600 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      {icon} {label}
      <span
        className={cn(
          "text-[11px] font-black px-2 py-0.5 rounded-full",
          isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
        )}
      >
        {count}
      </span>
    </button>
  );
}

interface InventarioTabsProps {
  activeTab: "insumos" | "materiales";
  setActiveTab: (tab: "insumos" | "materiales") => void;
  counts: {
    insumos: number;
    materiales: number;
  };
}

export default function InventarioTabs({
  activeTab,
  setActiveTab,
  counts,
}: InventarioTabsProps) {
  return (
    <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
      <TabButton
        label="Insumos"
        icon={<Package className="w-4 h-4" />}
        isActive={activeTab === "insumos"}
        count={counts.insumos}
        onClick={() => setActiveTab("insumos")}
      />
      <TabButton
        label="Materiales"
        icon={<Shirt className="w-4 h-4" />}
        isActive={activeTab === "materiales"}
        count={counts.materiales}
        onClick={() => setActiveTab("materiales")}
      />
    </div>
  );
}
