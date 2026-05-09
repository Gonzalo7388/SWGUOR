import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
  showAction = true,
  children,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", className)}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {showAction && onAction && actionLabel && (
          <Button
            onClick={onAction}
            className="bg-pink-600 hover:bg-pink-700 shadow-lg font-bold gap-2 h-11 px-6 text-white active:scale-95 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
