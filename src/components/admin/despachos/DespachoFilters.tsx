import React from 'react';
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DespachoFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const DespachoFilters = ({ searchTerm, setSearchTerm, onRefresh, loading }: DespachoFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
        <Input 
          placeholder="Buscar por despacho, cliente o tracking..." 
          className="pl-10 h-11 border-gray-200 focus:ring-pink-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button 
        variant="outline" 
        className="h-11 border-gray-200 hover:bg-gray-50"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};