import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
  width?: string;
}

export default function FilterSelect({
  placeholder = "Filtrar por...",
  value,
  onValueChange,
  options,
  className,
  width = "w-48",
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("h-11 border-gray-200 rounded-xl", width, className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
