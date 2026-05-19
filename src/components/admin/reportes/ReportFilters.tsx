'use client';

import { Calendar, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReportFiltersProps {
  range: string;
  setRange: (range: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function ReportFilters({ range, setRange, onRefresh, isLoading }: ReportFiltersProps) {
  return (
    <div className="flex bg-white border border-slate-100 rounded-2xl p-1 gap-1 shadow-sm w-full md:w-auto">
      <Select value={range} onValueChange={setRange}>
        <SelectTrigger className="w-full md:w-[180px] border-none bg-transparent shadow-none font-bold text-slate-600 focus:ring-0 h-10">
          <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-200">
          <SelectItem value="7">Últimos 7 días</SelectItem>
          <SelectItem value="30">Últimos 30 días</SelectItem>
          <SelectItem value="90">Vista Trimestral</SelectItem>
        </SelectContent>
      </Select>
      <div className="w-[1px] h-6 bg-slate-100 my-auto mx-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRefresh}
        className="rounded-xl hover:bg-slate-50 text-slate-400 h-10 w-10"
      >
        <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
      </Button>
    </div>
  );
}
