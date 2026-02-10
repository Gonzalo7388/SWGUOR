import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Crear categorías de prueba
    const { data: categorias, error: catError } = await supabase
      .from('categorias')
      .insert([
        { nombre: 'Vestidos', descripcion: 'Hermosos vestidos para toda ocasión', activo: true },
        { nombre: 'Blusas', descripcion: 'Blusas cómodas y elegantes', activo: true },
        { nombre: 'Pantalones', descripcion: 'Pantalones de moda', activo: true },
        { nombre: 'Faldas', descripcion: 'Faldas variadas', activo: true },
        { nombre: 'Buzos', descripcion: 'Buzos para el invierno', activo: true },
      ])
      .select();

    if (catError) throw catError;

    // Crear productos de prueba
    const productosData = [
      {
        nombre: 'Vestido Floral Elegante',
        descripcion: 'Vestido floral perfecto para eventos especiales',
        sku: 'VEST-001',
        categoria_id: 1,
        precio: 49.99,
        stock: 10,
        stock_minimo: 5,
        estado: 'activo',
        imagen: '/placeholder-image.png',
      },
      {
        nombre: 'Blusa Blanca Clásica',
        descripcion: 'Blusa blanca de algodón suave',
        sku: 'BLUS-001',
        categoria_id: 2,
        precio: 29.99,
        stock: 15,
        stock_minimo: 5,
        estado: 'activo',
        imagen: '/placeholder-image.png',
      },
      {
        nombre: 'Pantalones Negros Ajustados',
        descripcion: 'Pantalones negros modernos y cómodos',
        sku: 'PANT-001',
        categoria_id: 3,
        precio: 39.99,
        stock: 8,
        stock_minimo: 5,
        estado: 'activo',
        imagen: '/placeholder-image.png',
      },
      {
        nombre: 'Falda Midi Estampada',
        descripcion: 'Falda midi con estampado bonito',
        sku: 'FALDA-001',
        categoria_id: 4,
        precio: 34.99,
        stock: 12,
        stock_minimo: 5,
        estado: 'activo',
        imagen: '/placeholder-image.png',
      },
      {
        nombre: 'Buzo Gris Cómodo',
        descripcion: 'Buzo gris perfecto para estar en casa',
        sku: 'BUZO-001',
        categoria_id: 5,
        precio: 24.99,
        stock: 20,
        stock_minimo: 5,
        estado: 'activo',
        imagen: '/placeholder-image.png',
      },
      {
        nombre: 'Vestido Rojo Sofisticado',
        descripcion: 'Vestido rojo para cenas y celebraciones',
        sku: 'VEST-002',
        categoria_id: 1,
        precio: 59.99,
        stock: 5,
        stock_minimo: 3,
        estado: 'activo',
        imagen: '/placeholder-image.png',
      },
    ];

    const { data: productos, error: prodError } = await supabase
      .from('productos')
      .insert(productosData)
      .select();

    if (prodError) throw prodError;

    return NextResponse.json({
      success: true,
      message: 'Datos de prueba cargados correctamente',
      categorias: {
        count: categorias?.length || 0,
        data: categorias,
      },
      productos: {
        count: productos?.length || 0,
        data: productos,
      },
    });
  } catch (error) {
    console.error('[SEED] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as any).message,
      },
      { status: 500 }
    );
  }
}
