interface InfoItemProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
}

export default function InfoItem({ label, value, icon }: InfoItemProps) {
  return (
    <div className="space-y-1.5 p-1">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
          {label}
        </p>
      </div>
      <p className="text-sm font-bold text-slate-800 break-words pl-0">
        {value || "—"}
      </p>
    </div>
  );
}