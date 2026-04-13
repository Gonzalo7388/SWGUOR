"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Package, 
  Calculator, 
  Loader2, 
  X,
  CreditCard,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Estilos constantes para coherencia visual
const ERP_LABEL = "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-2";
const ERP_INPUT_BOX = "bg-[#f1f5f9] border-none rounded-2xl focus-within:ring-2 focus-within:ring-pink-100 transition-all";

export default function CreatePedidoDialog({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [searchProd, setSearchProd] = useState("");
  const [carrito, setCarrito] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const loadInitialData = async () => {
        try {
          const [cliRes, prodRes] = await Promise.all([
            fetch('/api/admin/clientes'),
            fetch('/api/admin/productos')
          ]);
          const cliData = await cliRes.json();
          const prodData = await prodRes.json();
          setClientes(cliData || []);
          setProductos(prodData.filter((p: any) => p.stock > 0) || []);
        } catch (error) {
          toast.error("Error al sincronizar datos de inventario");
        }
      };
      loadInitialData();
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!searchProd) return [];
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(searchProd.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchProd.toLowerCase())
    ).slice(0, 5);
  }, [searchProd, productos]);

  const addToCart = (prod: any) => {
    const exists = carrito.find(item => item.id === prod.id);
    if (exists) {
      if (exists.cantidad >= prod.stock) return toast.error("Stock máximo alcanzado");
      setCarrito(carrito.map(item => item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { ...prod, cantidad: 1 }]);
    }
    setSearchProd("");
  };

  const updateQuantity = (id: number, delta: number) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const newQty = item.cantidad + delta;
        if (newQty > item.stock) { toast.error("Límite de stock"); return item; }
        return newQty > 0 ? { ...item, cantidad: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCarrito(carrito.filter(item => item.id !== id));
    toast.info("Prenda removida del carrito");
  };

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const handleSave = async () => {
    if (!selectedCliente) return toast.error("Seleccione un cliente");
    if (carrito.length === 0) return toast.error("El carrito está vacío");

    setLoading(true);
    try {
      const pedidoData = {
        cliente_id: selectedCliente,
        metodo_pago: "EFECTIVO",
        subtotal: total / 1.18,
        impuesto: total - (total / 1.18),
        total: total,
        productos: carrito.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: item.precio
        }))
      };

      const response = await fetch('/api/admin/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData),
      });

      if (!response.ok) throw new Error("Error al procesar pedido");

      toast.success("¡Venta registrada correctamente!");
      onSuccess();
      onClose();
      setCarrito([]);
      setSelectedCliente("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] bg-white rounded-[40px] overflow-hidden p-0 border-none shadow-2xl flex flex-col">
        
        {/* HEADER DE CAJA */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#fff0f6] rounded-2xl">
              <ShoppingCart className="w-7 h-7 text-[#e32d6f]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-[#1a2b4b] uppercase tracking-tight">
                Punto de Venta
              </DialogTitle>
              <p className="text-slate-400 text-sm font-medium">Gestión de salida de mercancía y facturación</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* PANEL IZQUIERDO: SELECCIÓN */}
          <div className="flex-1 p-8 space-y-8 overflow-y-auto">
            
            {/* CLIENTE */}
            <div className="space-y-1">
              <Label className={ERP_LABEL}><User className="w-3.5 h-3.5" /> Cliente Responsable</Label>
              <Select onValueChange={setSelectedCliente} value={selectedCliente}>
                <SelectTrigger className="bg-[#f1f5f9] border-none h-14 rounded-2xl font-bold text-[#334155] focus:ring-2 focus:ring-pink-100">
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()} className="rounded-xl py-3 px-4 font-medium mb-1">
                      <div className="flex flex-col">
                        <span>{c.razon_social}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">RUC: {c.ruc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BUSCADOR DE PRODUCTOS */}
            <div className="space-y-1 relative">
              <Label className={ERP_LABEL}><Package className="w-3.5 h-3.5" /> Buscar en Inventario</Label>
              <div className={`flex items-center px-4 ${ERP_INPUT_BOX}`}>
                <Search className="w-5 h-5 text-slate-400" />
                <Input 
                  placeholder="Nombre de prenda o SKU..." 
                  className="bg-transparent border-none h-14 font-medium focus-visible:ring-0 shadow-none text-lg"
                  value={searchProd}
                  onChange={(e) => setSearchProd(e.target.value)}
                />
              </div>

              {/* Resultados de búsqueda */}
              {filteredProducts.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-slate-100 rounded-3xl shadow-2xl mt-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="w-full p-5 text-left hover:bg-pink-50 flex justify-between items-center border-b border-slate-50 last:border-0 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 text-xs">IMG</div>
                        <div>
                          <p className="font-bold text-[#1a2b4b]">{p.nombre}</p>
                          <p className="text-[10px] text-pink-500 font-bold uppercase">Stock: {p.stock} pzas</p>
                        </div>
                      </div>
                      <span className="font-black text-[#1a2b4b] bg-white border border-slate-100 px-4 py-2 rounded-xl">S/ {p.precio.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* INFO EXTRA (OPCIONAL) */}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <CreditCard className="w-5 h-5 text-slate-400 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Método de Pago</p>
                  <p className="text-sm font-black text-slate-800">EFECTIVO / CAJA</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <Receipt className="w-5 h-5 text-slate-400 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Tipo Documento</p>
                  <p className="text-sm font-black text-slate-800">NOTA DE PEDIDO</p>
               </div>
            </div>
          </div>

          {/* PANEL DERECHO: RESUMEN (CARRITO) */}
          <div className="w-[400px] bg-[#f8fafc] border-l border-slate-100 p-8 flex flex-col">
            <h3 className={ERP_LABEL}><Calculator className="w-3.5 h-3.5" /> Carrito de Venta</h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 my-6 pr-2 custom-scrollbar">
              {carrito.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
                  <ShoppingCart className="w-16 h-16 mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest text-center">Bandeja Vacía</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/50 flex flex-col gap-3 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#1a2b4b] leading-tight">{item.nombre}</p>
                        <p className="text-[11px] text-slate-400 font-medium">S/ {item.precio.toFixed(2)} por unidad</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-500"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center font-black text-sm">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-500"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className="font-black text-[#1a2b4b]">S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TOTALES */}
            <div className="mt-auto space-y-4 pt-6 border-t border-slate-200 border-dashed">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total a Pagar</span>
                <span className="text-4xl font-black text-[#1a2b4b] tracking-tighter">S/ {total.toFixed(2)}</span>
              </div>
              
              <Button 
                onClick={handleSave} 
                disabled={loading || carrito.length === 0} 
                className="w-full h-16 bg-[#e32d6f] hover:bg-[#c4235d] text-white rounded-[20px] font-black text-lg shadow-xl shadow-pink-100 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Finalizar Pedido</span>
                  </>
                )}
              </Button>
              <button 
                onClick={onClose} 
                className="w-full text-center text-slate-400 text-xs font-bold uppercase hover:text-slate-600 transition-colors"
              >
                Cancelar Operación
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}