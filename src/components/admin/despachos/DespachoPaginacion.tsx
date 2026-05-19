import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const DespachoPagination = ({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) => {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm mt-4">
      <p className="text-xs text-gray-500">
        Mostrando <span className="font-bold text-gray-900">{totalItems}</span> registros encontrados
      </p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">
          Página {currentPage + 1} de {totalPages || 1}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage + 1 >= totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};