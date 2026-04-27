# GUÍA DE IMPLEMENTACIÓN - NUEVOS PATRONES GUOR v2

Fecha: 25 de Abril, 2026

## ✅ COMPLETADO - Componentes Implementados

### 1. Diálogos Rápidos Estandarizados
**Patrón Base:** `QuickFormDialog.tsx`

Reemplaza diálogos antiguos con este patrón. Ventajas:
- Sin íconos en header (solo título + descripción)
- Franja superior coloreada
- Componentes reusables (`QuickField`)
- Estados de carga consistentes

**Ejemplo aplicado:**
```typescript
import QuickFormDialog, { QuickField } from "@/components/admin/common/QuickFormDialog";

export default function CreateCategoriaDialog({ isOpen, onClose, onSuccess }: any) {
  return (
    <QuickFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Categoría"
      description="Define una nueva línea para tus productos"
      primaryColor="pink"
      submitLabel="Crear Categoría"
      isLoading={loading}
      onSubmit={handleSubmit}
    >
      <QuickField label="Nombre">
        <Input {...field} />
      </QuickField>
    </QuickFormDialog>
  );
}
```

**Diálogos a Actualizar:**
- ✅ CreateCategoriaDialog.tsx (ya actualizado)
- ⏳ CreateProveedorDialog.tsx
- ⏳ CreateTallerDialog.tsx
- ⏳ CreatePersonalDialog.tsx
- ⏳ Otros CreateXXXDialog.tsx que sean simples

---

### 2. Extracción IA de PDFs
**Componente:** `PdfUploadExtractor.tsx`

Características:
- Drag & drop de PDFs
- Validación de archivo (tipo y tamaño)
- Progreso de extracción
- Manejo de errores

**API Endpoints:**
- `POST /api/ai/extract-cotizacion` - Cotizaciones de proveedor
- `POST /api/ai/extract-ficha-tecnica` - Fichas técnicas y medidas

**Uso:**
```typescript
import PdfUploadExtractor from '@/components/admin/common/PdfUploadExtractor';

function MiFormulario() {
  const handlePdfExtracted = (data: any) => {
    // data contiene información extraída
    form.setValue('proveedor_nombre', data.proveedor_nombre);
    // ... rellenar otros campos
  };

  return (
    <PdfUploadExtractor
      extractType="cotizacion"
      label="Cargar PDF de Cotización"
      onExtract={handlePdfExtracted}
    />
  );
}
```

---

### 3. Formularios Complejos en Página Separada
**Patrón:** Crear componente Form + página `/nueva`

Ventajas:
- Más espacio para campos
- Mejor UX para formularios con muchos items
- Posibilidad de agregar/remover items dinámicamente

**Ejemplos Implementados:**
- ✅ `CotizacionProveedorForm.tsx` → `/cotizaciones-proveedor/nueva/page.tsx`
- ✅ `FichaTecnicaForm.tsx` → `/fichas-tecnicas/nueva/page.tsx`

---

## 📋 INSTRUCCIONES - APLICAR PATRONES A OTROS MÓDULOS

### Para Actualizar un CreateXXXDialog a QuickFormDialog:

1. **Reemplaza las imports:**
```typescript
// Antes
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SomeIcon } from "lucide-react"; // ❌ REMOVER ICONO

// Después
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import QuickFormDialog, { QuickField } from "@/components/admin/common/QuickFormDialog";
```

2. **Refactoriza el componente:**
```typescript
// Antes
const [loading, setLoading] = useState(false);

return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <SomeIcon /> {/* ❌ REMOVER */}
        <DialogTitle>Nuevo Proveedor</DialogTitle>
      </DialogHeader>
      <form>
        <Label>Nombre</Label>
        <Input />
      </form>
    </DialogContent>
  </Dialog>
);

// Después
const [loading, setLoading] = useState(false);
const [nombre, setNombre] = useState("");

return (
  <QuickFormDialog
    isOpen={isOpen}
    onClose={onClose}
    title="Nuevo Proveedor"
    description="Crea un nuevo proveedor"
    primaryColor="pink" // o "blue", "emerald", "amber", "slate"
    submitLabel="Crear Proveedor"
    isLoading={loading}
    onSubmit={handleSubmit}
  >
    <QuickField label="Nombre">
      <Input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        disabled={loading}
        className="bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-pink-400 transition-all h-10 text-sm"
      />
    </QuickField>
  </QuickFormDialog>
);
```

3. **Mantén los campos simples:**
- Si es un formulario rápido (2-3 campos) → QuickFormDialog
- Si tiene muchos campos → Crea una página separada como `/nueva/page.tsx`

---

## 📊 HISTÓRICO DE MOVIMIENTOS

Componente mejorado: `MovimientosInventarioTable.tsx`

Features:
- Tabla con tipo de movimiento (entrada/salida/ajuste)
- Íconos visuales para cada tipo
- Resumen de estadísticas
- Filtros por fecha, usuario, motivo

**Uso:**
```typescript
import MovimientosInventarioTable from '@/components/admin/inventario/MovimientosInventarioTable';

function InventarioPage() {
  const { movimientos } = useInventario();

  return (
    <MovimientosInventarioTable
      data={movimientos}
      loading={cargando}
      limit={20}
    />
  );
}
```

---

## 🎨 PALETA DE COLORES PARA primaryColor

En `QuickFormDialog.tsx`, usa:
- `"pink"` - Rosa/Magenta (predeterminado)
- `"blue"` - Azul
- `"emerald"` - Verde
- `"amber"` - Ámbar
- `"slate"` - Gris

---

## 🔧 PRÓXIMOS PASOS SUGERIDOS

1. **Aplicar QuickFormDialog a todos los diálogos simples** (Create/Edit)
2. **Crear páginas `/nueva` para formularios complejos** (Talleres, Personal, etc.)
3. **Actualizar otros EditXXXDialog** con el mismo patrón
4. **Implementar exportar PDF** en fichas técnicas
5. **Mejorar filtros** en módulo de movimientos de inventario

---

## 📝 NOTAS

- Los API endpoints de IA usan **Gemini 2.0 Flash**
- La extracción es automática pero el usuario siempre puede editar
- Los PDFs se procesan en backend, el archivo nunca se guarda
- Máximo 10 MB por archivo PDF

---

**Última actualización:** 25 de Abril, 2026
**Versión:** GUOR v2.1
