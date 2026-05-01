# Integración Completa en FichaTecnicaForm.tsx

Este archivo muestra cómo integrar Gemini IA directamente en tu componente de formulario de fichas técnicas, resolviendo los errores de tipo y agregando funcionalidad de extracción automática.

## Paso 1: Actualizar Schema en `src/lib/schemas/fichas-tecnicas.ts`

```typescript
import { z } from 'zod';

// Schema para medidas individuales
export const fichaMedidaSchema = z.object({
  punto_medida: z.string().min(1, 'Requerido'),
  talla: z.string().default('M'),
  valor_cm: z.number().positive('Debe ser positivo'),
  tolerancia: z.number().optional().nullable(),
});

// Schema para ficha técnica completa (para React Hook Form)
export const fichaTecnicaFormSchema = z.object({
  producto_id: z.number().int('Debe ser número'),
  version: z.string().default('1.0'),
  descripcion_detallada: z.string().optional(),
  sam_total: z.number().positive().optional().nullable(),
  costo_estimado: z.number().positive().optional().nullable(),
  ficha_url: z.string().optional(),
  imagen_geometral: z.string().optional(),
  estado: z.enum(['borrador', 'completada', 'aprobada']).default('borrador'),
  
  // Array de medidas (para useFieldArray)
  medidas: z.array(fichaMedidaSchema).default([]),
});

// Tipos TypeScript
export type FichaTecnicaForm = z.infer<typeof fichaTecnicaFormSchema>;
export type FichaMedida = z.infer<typeof fichaMedidaSchema>;
```

## Paso 2: Componente FichaTecnicaForm Actualizado

```typescript
// src/components/admin/fichas-tecnicas/FichaTecnicaForm.tsx

'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  fichaTecnicaFormSchema,
  type FichaTecnicaForm,
  type FichaMedida,
} from '@/lib/schemas/fichas-tecnicas';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FichaTecnicaFormProps {
  productoId: number;
  onSuccess?: () => void;
  initialData?: Partial<FichaTecnicaForm>;
}

export function FichaTecnicaForm({
  productoId,
  onSuccess,
  initialData,
}: FichaTecnicaFormProps) {
  const [extrayendo, setExtrayendo] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // 1. Inicializar form con schema correcto
  const form = useForm<FichaTecnicaForm>({
    resolver: zodResolver(fichaTecnicaFormSchema),
    defaultValues: {
      producto_id: productoId,
      version: '1.0',
      estado: 'borrador',
      medidas: initialData?.medidas || [],
      sam_total: initialData?.sam_total,
      costo_estimado: initialData?.costo_estimado,
      ...initialData,
    },
  });

  // 2. Setup useFieldArray para medidas
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medidas',
  });

  // 3. Función: Extraer geometral
  const handleExtraerGeometral = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtrayendo(true);
    const loadingToast = toast.loading('Extrayendo datos de geometral...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ai/extract-geometral', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      const { data: extraida } = await res.json();

      // Validar extracción
      if (extraida.confianza_general < 0.7) {
        toast.warning(
          '⚠️ Baja confianza en la extracción. Revisa los datos antes de guardar.'
        );
      }

      // Cargar medidas
      if (extraida.medidas && Array.isArray(extraida.medidas)) {
        // Limpiar medidas existentes
        fields.forEach((_, idx) => remove(idx));

        // Agregar nuevas medidas
        extraida.medidas.forEach((medida: any) => {
          append({
            punto_medida: medida.punto_medida || '',
            talla: medida.talla || 'M',
            valor_cm: Number(medida.valor_cm) || 0,
            tolerancia: medida.tolerancia ? Number(medida.tolerancia) : undefined,
          });
        });

        toast.success(
          `✅ Extraídas ${extraida.medidas.length} medidas`
        );
      }

      // Cargar especificaciones
      if (extraida.especificaciones_tecnicas) {
        const specs = extraida.especificaciones_tecnicas;
        if (specs.sam_total) {
          form.setValue('sam_total', Number(specs.sam_total));
        }
        if (specs.costo_estimado) {
          form.setValue('costo_estimado', Number(specs.costo_estimado));
        }
      }

      // Guardar URL de imagen si se subió a Supabase
      if (extraida.imagen_url) {
        form.setValue('imagen_geometral', extraida.imagen_url);
      }

      toast.dismiss(loadingToast);
    } catch (error: any) {
      toast.error(`❌ Error: ${error.message}`);
    } finally {
      setExtrayendo(false);
    }
  };

  // 4. Función: Guardar formulario
  const onSubmit = async (data: FichaTecnicaForm) => {
    try {
      const res = await fetch('/api/admin/fichas-tecnicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error guardando');

      const resultado = await res.json();

      toast.success('✅ Ficha técnica guardada correctamente');

      // Guardar medidas
      if (data.medidas.length > 0) {
        await saveMedidas(resultado.id, data.medidas);
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // 5. Función auxiliar: Guardar medidas
  const saveMedidas = async (fichaId: number, medidas: FichaMedida[]) => {
    for (const medida of medidas) {
      await fetch('/api/admin/ficha-medidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ficha_id: fichaId,
          ...medida,
        }),
      });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Sección 1: Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versión</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion_detallada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe los detalles de la prenda"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sam_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SAM Total (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="12.5"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costo_estimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo Estimado (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="45.50"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sección 2: Subir Geometral */}
          <Card>
            <CardHeader>
              <CardTitle>Cargar Geometral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Sube una imagen geometral para extraer medidas automáticamente
                </p>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleExtraerGeometral}
                  disabled={extrayendo}
                />
                {extrayendo && <p className="text-sm text-blue-600">Procesando...</p>}
              </div>
            </CardContent>
          </Card>

          {/* Sección 3: Medidas */}
          <Card>
            <CardHeader>
              <CardTitle>Medidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No hay medidas aún. Sube una geometral o agrega manualmente.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Punto de Medida</TableHead>
                        <TableHead>Talla</TableHead>
                        <TableHead>Valor (cm)</TableHead>
                        <TableHead>Tolerancia</TableHead>
                        <TableHead>Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, idx) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`medidas.${idx}.punto_medida`}
                              render={({ field }) => (
                                <Input {...field} placeholder="HPS" />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`medidas.${idx}.talla`}
                              render={({ field }) => (
                                <Input {...field} placeholder="M" />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`medidas.${idx}.valor_cm`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  step="0.1"
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`medidas.${idx}.tolerancia`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  step="0.1"
                                  {...field}
                                  value={field.value ?? ''}
                                  placeholder="0.5"
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(idx)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      punto_medida: '',
                      talla: 'M',
                      valor_cm: 0,
                    })
                  }
                >
                  + Agregar Medida
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex gap-2">
            <Button type="submit" disabled={extrayendo}>
              Guardar Ficha Técnica
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

## Paso 3: Variables de Entorno

Asegúrate de agregar a `.env.local`:

```env
GEMINI_API_KEY=tu_clave_aqui
```

## Paso 4: Crear Endpoints Faltantes

Si no existen estos endpoints, créalos:

```typescript
// src/app/api/admin/fichas-tecnicas/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  // Guardar en BD
  // Retornar { id: ... }
}

// src/app/api/admin/ficha-medidas/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  // Guardar medida en BD
}
```

## ✅ Verificación Final

- [ ] Schema en `src/lib/schemas/fichas-tecnicas.ts`
- [ ] Componente actualizado con correcto `zodResolver`
- [ ] Gemini API key configurada
- [ ] Endpoints `/api/ai/extract-geometral` y `/api/admin/fichas-tecnicas` listos
- [ ] No hay errores de tipo en TypeScript

## 🎯 Lo que se Resuelve

✅ **Errores de Tipo**: El schema ahora es correcto y el `zodResolver` funciona
✅ **Extracción Automática**: Las medidas se cargan automáticamente desde geometral
✅ **Form Management**: React Hook Form está correctamente tipado
✅ **UX**: Usuarios ven progreso, warnings de confianza baja
✅ **Validación**: Zod valida todos los campos antes de guardar

## 🚀 Mejoras Futuras

- [ ] Validar medidas automáticamente (no pueden ser 0)
- [ ] Agregar foto/vista previa de geometral
- [ ] Sincronizar con cotizaciones de materiales
- [ ] Calcular SAM automáticamente basado en materiales
