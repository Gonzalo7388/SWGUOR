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

export function DashboardSection({ 
  title, 
  subtitle, 
  role, 
  actions, 
  children 
}: DashboardSectionProps) {
  
  // Configuración de colores por Rol
  const roleConfig = {
    gerente: { 
      label : 'Gerente General', 
      accent: '#7c3aed', // violet-700
      bg    : '#f5f3ff',     // violet-50 (para el fondo suave)
      iconBg: '#ede9fe', // violet-100
    },
    administrador: { 
      label : 'Administrador', 
      accent: '#0369a1', // sky-700
      bg    : '#f0f9ff',     // sky-50
      iconBg: '#e0f2fe', // sky-100
    },
    recepcionista: { 
      label : 'Recepcionista', 
      accent: '#be185d', // pink-700
      bg    : '#fdf2f8',     // pink-50
      iconBg: '#fce7f3', // pink-100
    },
    disenador: { 
      label : 'Diseñador', 
      accent: '#a21caf', // fuchsia-700
      bg    : '#fdf4ff',     // fuchsia-50
      iconBg: '#fae8ff', // fuchsia-100
    },
    cortador: { 
      label : 'Cortador', 
      accent: '#ea580c', // orange-600
      bg    : '#fff7ed',     // orange-50
      iconBg: '#ffedd5', // orange-100
    },
    ayudante: { 
      label : 'Ayudante', 
      accent: '#0f766e', // teal-700
      bg    : '#f0fdfa',     // teal-50
      iconBg: '#ccfbf1', // teal-100
    },
    representante_taller: { 
      label : 'Representante de Taller', 
      accent: '#4d7c0f', // lime-700
      bg    : '#f7fee7',     // lime-50
      iconBg: '#ecfccb', // lime-100
    },
  };

  const theme = roleConfig[role] || roleConfig.administrador;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      {/* HEADER DINÁMICO POR ROL */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ 
            padding: '12px', 
            background: theme.iconBg, 
            borderRadius: '16px', 
            color: theme.accent,
            boxShadow: `0 4px 12px ${theme.accent}15`
          }}>
            <Shield size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: theme.accent, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                SISTEMA GUOR
              </span>
              <ChevronRight size={10} color="#cbd5e1" />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>
                {theme.label}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
              {title}
            </h1>
            {subtitle && <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{subtitle}</p>}
          </div>
        </div>

        {/* ACCIONES (Filtros, Refresh, etc.) */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {actions}
        </div>
      </div>

      {/* CONTENEDOR DE WIDGETS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {children}
      </div>
    </div>
  );
}