"use client";

import { useState, useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Scale, RefreshCw, ChevronDown } from "lucide-react";

interface InventarioToolbarProps {
  isInsumos: boolean;
  // Búsqueda
  searchTermIns: string;
  setSearchTermIns: (v: string) => void;
  searchTermMat: string;
  setSearchTermMat: (v: string) => void;
  // Tipo
  selectedTipoIns: string;
  setSelectedTipoIns: (v: string) => void;
  selectedTipoMat: string;
  setSelectedTipoMat: (v: string) => void;
  // Refresh
  cargando: boolean;
  onRefresh: () => void;
}

export default function InventarioToolbar({
  isInsumos,
  searchTermIns, setSearchTermIns,
  searchTermMat, setSearchTermMat,
  selectedTipoIns, setSelectedTipoIns,
  selectedTipoMat, setSelectedTipoMat,
  cargando,
  onRefresh,
}: InventarioToolbarProps) {
  const [calcOpen, setCalcOpen]       = useState(false);
  const [kilos, setKilos]             = useState("");
  const [rendimiento, setRendimiento] = useState("");
  const kilosId = useId();
  const rendId  = useId();

  const k             = parseFloat(kilos) || 0;
  const r             = parseFloat(rendimiento) || 0;
  const total         = k * r;
  const hasResult     = k > 0 && r > 0;

  return (
    <div
      className="overflow-hidden rounded-xl shadow-sm"
      style={{ border: "1px solid #e5e7eb", background: "#fff" }}
    >
      {/* ── Fila principal ── */}
      <div className="flex flex-col md:flex-row gap-3 p-4">

        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <Input
            placeholder={isInsumos ? "Buscar insumo por nombre..." : "Buscar tela, hilos, cierres o avíos..."}
            className="pl-10 h-11 border-gray-200 focus:ring-pink-500"
            value={isInsumos ? searchTermIns : searchTermMat}
            onChange={e =>
              isInsumos ? setSearchTermIns(e.target.value) : setSearchTermMat(e.target.value)
            }
          />
        </div>

        {/* Tipo */}
        <Select
          value={isInsumos ? selectedTipoIns : selectedTipoMat}
          onValueChange={isInsumos ? setSelectedTipoIns : setSelectedTipoMat}
        >
          <SelectTrigger className="h-11 w-full md:w-48 border-gray-200">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {isInsumos ? (
              <>
                <SelectItem value="Materia Prima">Materia Prima</SelectItem>
                <SelectItem value="Insumo">Botones / Cierres</SelectItem>
                <SelectItem value="Herramienta">Herramientas</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="plano">Plano</SelectItem>
                <SelectItem value="punto">Punto</SelectItem>
                <SelectItem value="tejido">Tejido</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        {/* Botón calculadora — solo en materiales */}
        {!isInsumos && (
          <button
            onClick={() => setCalcOpen(v => !v)}
            className="flex items-center gap-2 rounded-xl px-4 h-11 text-sm font-bold transition-all"
            style={{
              background: calcOpen ? "#231e1d" : "#f9fafb",
              color:      calcOpen ? "#e4c28a" : "#6b7280",
              border:     calcOpen ? "1px solid rgba(228,194,138,0.35)" : "1px solid #e5e7eb",
            }}
          >
            <Scale className="w-4 h-4" />
            <span>Calculadora</span>
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ transform: calcOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        )}

        {/* Refresh */}
        <Button variant="outline" className="h-11 border-gray-200" onClick={onRefresh}>
          <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* ── Panel calculadora deslizante ── */}
      <div
        style={{
          display:          "grid",
          gridTemplateRows: calcOpen ? "1fr" : "0fr",
          transition:       "grid-template-rows 0.25s ease",
        }}
      >
        <div className="overflow-hidden">
          <div
            className="flex flex-wrap items-end gap-4 px-4 py-4"
            style={{ background: "#1c1815", borderTop: "1px solid rgba(228,194,138,0.12)" }}
          >
            {/* Label */}
            <div className="flex items-center gap-2 self-center">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(228,194,138,0.1)" }}
              >
                <Scale className="h-3.5 w-3.5" style={{ color: "#e4c28a" }} />
              </div>
              <span
                className="text-[10px] font-black uppercase tracking-[0.14em]"
                style={{ color: "#e4c28a" }}
              >
                Rendimiento de tela
              </span>
            </div>

            <div className="hidden h-8 w-px sm:block" style={{ background: "rgba(228,194,138,0.12)" }} />

            {/* Kilos */}
            <div className="flex flex-col gap-1">
              <label htmlFor={kilosId} className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#b5854b" }}>
                Peso del rollo
              </label>
              <div className="relative">
                <input
                  id={kilosId}
                  type="number" min="0" step="0.1" placeholder="0.00"
                  value={kilos}
                  onChange={e => setKilos(e.target.value)}
                  className="w-28 rounded-lg py-1.5 pl-3 text-sm font-bold outline-none"
                  style={{ paddingRight: "30px", background: "#2e2623", border: "1px solid #3d3028", color: "#fff4e2", caretColor: "#e4c28a" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(228,194,138,0.5)" }}
                  onBlur={e  => { e.target.style.borderColor = "#3d3028" }}
                />
                <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase" style={{ right: "8px", color: "#b5854b" }}>
                  kg
                </span>
              </div>
            </div>

            <span className="mb-1 text-lg font-black" style={{ color: "rgba(228,194,138,0.3)" }}>×</span>

            {/* Rendimiento */}
            <div className="flex flex-col gap-1">
              <label htmlFor={rendId} className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#b5854b" }}>
                Rendimiento
              </label>
              <div className="relative">
                <input
                  id={rendId}
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={rendimiento}
                  onChange={e => setRendimiento(e.target.value)}
                  className="w-28 rounded-lg py-1.5 pl-3 text-sm font-bold outline-none"
                  style={{ paddingRight: "42px", background: "#2e2623", border: "1px solid #3d3028", color: "#fff4e2", caretColor: "#e4c28a" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(228,194,138,0.5)" }}
                  onBlur={e  => { e.target.style.borderColor = "#3d3028" }}
                />
                <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase" style={{ right: "8px", color: "#b5854b" }}>
                  m/kg
                </span>
              </div>
            </div>

            <span className="mb-1 text-lg font-black" style={{ color: "rgba(228,194,138,0.3)" }}>=</span>

            {/* Resultado */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#b5854b" }}>
                Total disponible
              </span>
              <div
                className="flex items-baseline gap-1 rounded-lg px-3 py-1.5"
                style={{
                  background: hasResult ? "rgba(228,194,138,0.1)" : "#2e2623",
                  border:     hasResult ? "1px solid rgba(228,194,138,0.3)" : "1px solid #3d3028",
                  minWidth:   "90px",
                  transition: "all 0.2s",
                }}
              >
                <span
                  className="text-sm font-black tabular-nums"
                  style={{ color: hasResult ? "#e4c28a" : "#4a3e38", transition: "color 0.2s" }}
                >
                  {hasResult
                    ? total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "—"}
                </span>
                {hasResult && (
                  <span className="text-[9px] font-bold uppercase" style={{ color: "#b5854b" }}>m</span>
                )}
              </div>
            </div>

            {/* Limpiar */}
            {hasResult && (
              <button
                onClick={() => { setKilos(""); setRendimiento(""); }}
                className="self-end rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors"
                style={{ color: "#b5854b", border: "1px solid #3d3028", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(228,194,138,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#3d3028"; }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}