# ✅ CHECKLIST DE IMPLEMENTACIÓN - GUOR v2.1

## 🔄 FASE 1: Actualizar Diálogos Rápidos (1-2 horas)

### Diálogos a Actualizar - Patrón QuickFormDialog

- [ ] **CreateProveedorDialog.tsx**
  - [ ] Reemplazar Dialog imports con QuickFormDialog
  - [ ] Remover icono (actualmente: BriefcaseIcon u otro)
  - [ ] Convertir Label + Input a QuickField
  - [ ] Usar color="blue" (color secundario)
  - [ ] Archivo: `src/components/admin/proveedores/`

- [ ] **CreateTallerDialog.tsx**
  - [ ] Patrón idéntico a proveedor
  - [ ] Campos: nombre, ubicacion (opcional)
  - [ ] Usar color="emerald"
  - [ ] Archivo: `src/components/admin/talleres/`

- [ ] **CreatePersonalDialog.tsx**
  - [ ] Patrón idéntico
  - [ ] Campos: nombres, apellidos, email, rol
  - [ ] Usar color="amber"
  - [ ] Archivo: `src/components/admin/personal/`

- [ ] **CreateConfeccionDialog.tsx**
  - [ ] Patrón idéntico
  - [ ] Usar color="pink"
  - [ ] Archivo: `src/components/admin/confecciones/`

- [ ] **Otros CreateXXXDialog** (revisar cada módulo)
  - [ ] SearchComponents admin para encontrarlos
  - [ ] Patrón consistente con los anteriores

### Template para Copiar
```typescript
'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import QuickFormDialog, { QuickField } from '@/components/admin/common/QuickFormDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateXxxDialog({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implementar API call
      const res = await fetch('/api/admin/xxx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion }),
      });

      if (!res.ok) throw new Error('Error al crear');

      toast.success('Creado exitosamente');
      setNombre('');
      setDescripcion('');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuickFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Xxx"
      description="Descripción breve del formulario"
      primaryColor="pink" // Cambiar color según módulo
      submitLabel="Crear Xxx"
      isLoading={loading}
      onSubmit={handleSubmit}
    >
      <QuickField label="Nombre *">
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ingresa el nombre..."
          disabled={loading}
        />
      </QuickField>
      <QuickField label="Descripción">
        <Textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles adicionales..."
          disabled={loading}
          rows={2}
        />
      </QuickField>
    </QuickFormDialog>
  );
}
```

---

## 🆕 FASE 2: Crear Páginas /nueva para Formularios Complejos (1-2 horas)

### Formularios a Crear - Patrón Página Separada

- [ ] **CreateTallerForm.tsx** (si tiene muchos campos)
  - [ ] Campos: nombre, ubicación, contacto, responsable, servicios
  - [ ] Ubicación: `src/components/admin/talleres/`
  - [ ] Si <4 campos: usa QuickFormDialog en su lugar

- [ ] **CreatePersonalForm.tsx** (si tiene muchos campos)
  - [ ] Campos: nombres, apellidos, email, teléfono, documento, rol, departamento
  - [ ] Ubicación: `src/components/admin/personal/`
  - [ ] Probablemente necesita página separada

- [ ] **Crear /app rutas correspondientes**
  - [ ] `/app/admin/Panel-Administrativo/talleres/nueva/page.tsx`
  - [ ] `/app/admin/Panel-Administrativo/personal/nueva/page.tsx`

### Template para Página /nueva
```typescript
// page.tsx
import { TallerForm } from '@/components/admin/talleres/TallerForm';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Nuevo Taller | GUOR' };

async function getRelatedData() {
  // Fetch datos necesarios
  return await prisma.xxx.findMany({...});
}

export default async function NuevoTallerPage() {
  const relatedData = await getRelatedData();

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-black text-slate-900 uppercase">Nuevo Taller</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Crea un nuevo taller...
        </p>
      </div>
      <TallerForm relatedData={relatedData} />
    </div>
  );
}
```

---

## 🔧 FASE 3: Editar Diálogos - EditXXXDialog (1-2 horas)

### Diálogos Edit a Actualizar

- [ ] **EditCategoriaDialog.tsx** (si existe)
  - [ ] Aplicar patrón QuickFormDialog
  - [ ] Mostrar valores actuales en campos
  - [ ] Usar color="pink"

- [ ] **EditProveedorDialog.tsx**
  - [ ] Patrón QuickFormDialog
  - [ ] Color="blue"

- [ ] **EditTallerDialog.tsx**
  - [ ] Patrón QuickFormDialog
  - [ ] Color="emerald"

- [ ] **EditPersonalDialog.tsx**
  - [ ] Patrón QuickFormDialog o página /editar
  - [ ] Color="amber"

### Diferencia con Create
```typescript
// Edit usa los mismos patrones pero:
// 1. Valores iniciales del item editado
// 2. DefaultValues en form
// 3. Método POST/PUT en API

export default function EditXxxDialog({ isOpen, onClose, item, onSuccess }: Props) {
  const [nombre, setNombre] = useState(item?.nombre || '');

  const handleSubmit = async () => {
    const res = await fetch(`/api/admin/xxx/${item.id}`, {
      method: 'PUT', // Cambiar a PUT
      body: JSON.stringify({ nombre }),
    });
    // ...
  };
}
```

---

## 📊 FASE 4: Mejorar Movimientos de Inventario (30-45 min)

- [ ] **Integrar MovimientosInventarioTable.tsx**
  - [ ] Encontrar página de inventario
  - [ ] Importar `MovimientosInventarioTable`
  - [ ] Pasar data de movimientos
  - [ ] Archivo: `src/components/admin/inventario/`

- [ ] **Agregar Filtros** (opcional, mejora UX)
  - [ ] Por fecha (desde/hasta)
  - [ ] Por tipo (entrada/salida/ajuste)
  - [ ] Por usuario
  - [ ] Por motivo

---

## 💾 FASE 5: Export PDF en Fichas Técnicas (30-45 min)

- [ ] **Agregar Botón "Descargar PDF"**
  - [ ] En página de detalle de ficha técnica
  - [ ] En lista de fichas (en acciones)

- [ ] **Crear export-ficha-tecnica.ts**
  - [ ] Usar biblioteca: `react-pdf` o `jspdf`
  - [ ] Formato: Incluir medidas en tabla
  - [ ] Header con logo GUOR

```typescript
// Ejemplo minimalista
import jsPDF from 'jspdf';

export function exportFichaTecnicaPDF(ficha: any) {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text(`Ficha Técnica: ${ficha.producto.nombre}`, 20, 20);
  
  // Tabla de medidas
  doc.autoTable({
    head: [['Punto', 'Talla', 'Valor (cm)', 'Tolerancia']],
    body: ficha.medidas.map(m => [m.punto_medida, m.talla, m.valor_cm, m.tolerancia]),
    startY: 50,
  });

  doc.save(`ficha-tecnica-${ficha.id}.pdf`);
}
```

---

## 🔒 FASE 6: QA y Testing (1 hora)

- [ ] **Testear QuickFormDialogs**
  - [ ] Verificar estilos consistentes
  - [ ] Probar loading state
  - [ ] Probar error handling

- [ ] **Testear Extracción IA**
  - [ ] Upload PDF cotización
  - [ ] Upload PDF ficha técnica
  - [ ] Verificar datos extraídos

- [ ] **Testear Tablas**
  - [ ] MovimientosInventarioTable renderiza correctamente
  - [ ] Números y datos se muestran bien

- [ ] **Testear Responsiveness**
  - [ ] Mobile (375px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1440px)

---

## 📋 ORDEN SUGERIDO DE IMPLEMENTACIÓN

### Día 1 (Mañana)
1. Actualizar CreateCategoriaDialog (✅ ya hecho)
2. Actualizar CreateProveedorDialog
3. Actualizar CreateTallerDialog

### Día 1 (Tarde)
4. Actualizar CreatePersonalDialog
5. Actualizar CreateConfeccionDialog
6. Otros Create dialogs simples

### Día 2 (Mañana)
7. Crear formularios complejos (si aplica)
8. Crear páginas /nueva

### Día 2 (Tarde)
9. Actualizar Edit dialogs
10. Mejorar MovimientosInventarioTable
11. Agregar PDF export a fichas

### Día 3
12. QA y Testing
13. Documentación y deployment

---

## 🔗 REFERENCIAS RÁPIDAS

**Archivo de componentes base:**
- `src/components/admin/common/QuickFormDialog.tsx`
- `src/components/admin/common/PdfUploadExtractor.tsx`

**Ejemplos de implementación:**
- `src/components/admin/categorias/CreateCategoriaDialog.tsx` (QuickFormDialog)
- `src/components/admin/cotizaciones-proveedor/CotizacionProveedorForm.tsx` (Página)
- `src/components/admin/fichas-tecnicas/FichaTecnicaForm.tsx` (Página)

**Documentación:**
- `GUIA_IMPLEMENTACION_NUEVOS_PATRONES.md`
- `RESUMEN_IMPLEMENTACION.md`

**Colores por módulo (recomendados):**
```
Categorías    → pink
Proveedores   → blue
Talleres      → emerald
Personal      → amber
Confecciones  → slate
```

---

## ✨ NOTAS FINALES

✅ **Completado y listo para usar:**
- QuickFormDialog pattern
- PdfUploadExtractor component
- AI extraction (cotizaciones + fichas técnicas)
- MovimientosInventarioTable

⏳ **En el queue:**
- Actualizar diálogos existentes (patrón QuickFormDialog)
- Crear páginas /nueva para formularios complejos
- Mejorar UX de movimientos
- Agregar PDF export

🎯 **Meta:** Consistencia visual y UX en toda la aplicación

---

**Última actualización:** 25 de Abril, 2026  
**Responsable:** GitHub Copilot  
**Versión:** GUOR v2.1
