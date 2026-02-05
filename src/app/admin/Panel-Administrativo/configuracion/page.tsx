"use client";

import React, { useState, useEffect } from 'react';
import { Save, Settings, Building2, Store, Users, CreditCard, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('empresa');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    ruc: '',
    contacto: '',
    email: '',
    direccion: '',
    ciudad: '',
    pais: '',
    nombreTienda: '',
    descripcion: '',
    moneda: 'PEN',
    zonaHoraria: 'America/Lima',
    igv: 18,
    descuentoDefault: 0
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/configuracion', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Error al cargar configuración');

      const { data } = await response.json();
      
      setFormData({
        ...formData,
        ...data.empresa,
        ...data.tienda,
        igv: data.impuestos.igv,
        descuentoDefault: data.impuestos.descuentoDefault
      });
      
      setUsuarios(data.usuarios || []);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al guardar configuración');

      alert('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar configuración');
    }
  };

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: <Building2 size={18} /> },
    { id: 'tienda', label: 'Tienda', icon: <Store size={18} /> },
    { id: 'usuarios', label: 'Usuarios', icon: <Users size={18} /> },
    { id: 'pagos', label: 'Pagos', icon: <CreditCard size={18} /> },
    { id: 'impuestos', label: 'Impuestos', icon: <TrendingUp size={18} /> }
  ];

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Configuración del Sistema</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Ajustes generales de la aplicación</p>
        </div>
        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase gap-2">
          <Save size={18} />
          Guardar Cambios
        </Button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto bg-white rounded-t-4xl px-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-bold uppercase text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DE TABS */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
        
        {/* TAB: EMPRESA */}
        {activeTab === 'empresa' && (
          <div className="space-y-6">
            <h3 className="font-black uppercase text-slate-800 text-lg">Datos de la Empresa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Nombre de la Empresa"
                value={formData.nombreEmpresa}
                onChange={(val) => handleChange('nombreEmpresa', val)}
              />
              <FormField 
                label="RUC"
                value={formData.ruc}
                onChange={(val) => handleChange('ruc', val)}
              />
              <FormField 
                label="Teléfono"
                value={formData.contacto}
                onChange={(val) => handleChange('contacto', val)}
              />
              <FormField 
                label="Email"
                type="email"
                value={formData.email}
                onChange={(val) => handleChange('email', val)}
              />
              <FormField 
                label="Dirección"
                value={formData.direccion}
                onChange={(val) => handleChange('direccion', val)}
                className="md:col-span-2"
              />
              <FormField 
                label="Ciudad"
                value={formData.ciudad}
                onChange={(val) => handleChange('ciudad', val)}
              />
              <FormField 
                label="País"
                value={formData.pais}
                onChange={(val) => handleChange('pais', val)}
              />
            </div>
          </div>
        )}

        {/* TAB: TIENDA */}
        {activeTab === 'tienda' && (
          <div className="space-y-6">
            <h3 className="font-black uppercase text-slate-800 text-lg">Configuración de Tienda</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Nombre de Tienda"
                value={formData.nombreTienda}
                onChange={(val) => handleChange('nombreTienda', val)}
              />
              <FormField 
                label="Descripción"
                value={formData.descripcion}
                onChange={(val) => handleChange('descripcion', val)}
                className="md:col-span-2"
              />
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">Moneda</label>
                <select value={formData.moneda} onChange={(e) => handleChange('moneda', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option>PEN - Sol Peruano</option>
                  <option>USD - Dólar</option>
                  <option>EUR - Euro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">Zona Horaria</label>
                <select value={formData.zonaHoraria} onChange={(e) => handleChange('zonaHoraria', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option>America/Lima</option>
                  <option>America/New_York</option>
                  <option>Europe/Madrid</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB: USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <h3 className="font-black uppercase text-slate-800 text-lg">Gestión de Usuarios</h3>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <p className="text-slate-600 text-sm mb-4">Usuarios registrados en el sistema</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-4 text-xs font-bold text-slate-600">Usuario</th>
                    <th className="text-left py-2 px-4 text-xs font-bold text-slate-600">Email</th>
                    <th className="text-left py-2 px-4 text-xs font-bold text-slate-600">Rol</th>
                    <th className="text-left py-2 px-4 text-xs font-bold text-slate-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length > 0 ? usuarios.map((user: any) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-bold text-slate-900">{user.nombre_completo}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-900 text-white text-xs rounded-full font-bold capitalize">{user.rol}</span></td>
                      <td className="py-3 px-4"><span className={`font-bold text-xs ${user.estado === 'activo' ? 'text-emerald-600' : 'text-red-600'}`}>{user.estado}</span></td>
                    </tr>
                  )) : (
                    <tr className="border-b border-slate-100">
                      <td colSpan={4} className="py-3 px-4 text-sm text-slate-600 text-center">No hay usuarios</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Button className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase gap-2">
                <Users size={16} />
                Agregar Usuario
              </Button>
            </div>
          </div>
        )}

        {/* TAB: PAGOS */}
        {activeTab === 'pagos' && (
          <div className="space-y-6">
            <h3 className="font-black uppercase text-slate-800 text-lg">Métodos de Pago</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Tarjeta Crédito', 'Transferencia Bancaria', 'Efectivo', 'Billetera Digital'].map(metodo => (
                <div key={metodo} className="p-4 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="font-bold text-slate-700">{metodo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: IMPUESTOS */}
        {activeTab === 'impuestos' && (
          <div className="space-y-6">
            <h3 className="font-black uppercase text-slate-800 text-lg">Configuración de Impuestos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="IGV (%)"
                type="number"
                value={formData.igv}
                onChange={(val) => handleChange('igv', val)}
              />
              <FormField 
                label="Descuento Default (%)"
                type="number"
                value={formData.descuentoDefault}
                onChange={(val) => handleChange('descuentoDefault', val)}
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-6">
              <p className="text-sm text-blue-700"><strong>Nota:</strong> Estos valores se aplicarán automáticamente en nuevas ventas y cotizaciones.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
}

function FormField({ label, type = 'text', value, onChange, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-black text-slate-600 uppercase mb-2">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
    </div>
  );
}