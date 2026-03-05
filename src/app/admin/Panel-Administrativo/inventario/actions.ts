'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Database, InsumoInsert, InsumoUpdate } from '@/types'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      cookies: { 
        getAll: () => Array.from(cookieStore.getAll()),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        }
      } 
    }
  )
}

export async function saveInsumo(data: any, id?: number | null) {
  const supabase = await getSupabase()

  if (id) {
    const updateData: InsumoUpdate = {
      nombre: data.nombre,
      tipo: data.tipo,
      unidad_medida: data.unidad_medida,
      stock_actual: data.stock_actual,
      stock_minimo: data.stock_minimo,
    }

    const { error } = await supabase
      .from('insumo')
      .update(updateData)
      .eq('id', id)

    if (error) throw new Error(error.message)
  } else {
    const insertData: InsumoInsert = {
      nombre: data.nombre,
      tipo: data.tipo,
      unidad_medida: data.unidad_medida,
      stock_actual: data.stock_actual,
      stock_minimo: data.stock_minimo,
    }

    const { error } = await supabase
      .from('insumo')
      .insert(insertData)

    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/Panel-Administrativo/inventario')
}

export async function deleteInsumo(id: number) {
  const supabase = await getSupabase()
  
  const { error } = await supabase
    .from('insumo')
    .delete()
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/Panel-Administrativo/inventario')
}