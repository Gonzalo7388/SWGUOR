"use client";

import React from 'react';
import { Shield, ChevronRight } from 'lucide-react';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  role: 'administrador' | 'gerente' | 'recepcionista' | 'disenador' | 'cortador' | 'ayudante' | 'representante_taller';
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PALETA DE COLORES DE LA EMPRESA
 * Crema: #FFF9F2 | Melocotón: #F2D2BD | Terracota: #E2725B 
 * Arcilla: #C05A31 | Dorado Pálido: #F0E4D0 | Oscuro Café: #2B1B12 
 * Beige (Fondo): #FAF7F2 | Blanco: #FFFFFF
 */

export function DashboardSection({ 
  title, 
  subtitle, 
  actions, 
  children 
}: DashboardSectionProps) {
  
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER INSTITUCIONAL */}
      <header className="px-8 py-8 border-b border-[#F2D2BD]/30 bg-[#FAF7F2]/40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-5">
            {/* Icono con identidad de marca */}
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#F2D2BD] text-[#E2725B]">
              <Shield size={26} strokeWidth={2.5} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-[#C05A31] tracking-[0.2em] uppercase">
                  GUOR INTERNACIONAL
                </span>
                <ChevronRight size={10} className="text-[#F2D2BD]" />
                <span className="text-[10px] font-bold text-[#2B1B12]/40 uppercase tracking-wider">
                  Sistema de Gestión
                </span>
              </div>
              
              <h1 className="text-3xl font-black text-[#2B1B12] tracking-tighter leading-none">
                {title}
              </h1>
              
              {subtitle && (
                <p className="text-sm text-[#2B1B12]/60 font-medium mt-2 max-w-md">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* ACCIONES (Botones, Filtros) */}
          <div className="flex items-center gap-3">
            {actions}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex flex-col gap-8">
          {children}
        </div>
      </main>

      {/* Footer Sutil opcional */}
      <footer className="max-w-7xl mx-auto px-8 py-6 border-t border-[#F2D2BD]/20">
        <p className="text-[10px] text-center text-[#2B1B12]/30 font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} Guor Internacional - Panel de Control
        </p>
      </footer>
    </div>
  );
}