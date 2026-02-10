import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Mapeo de productos a categorías basado en el nombre de la imagen
const PRODUCTOS_DATA = [
  // BLUSAS
  { nombre: 'Camiseta Caña Liso Casual', sku: 'CAMISETA-001', categoria: 'Blusas', precio: 24.99, stock: 8, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/camiseta-canale-liso-casual.jpg' },
  { nombre: 'Camiseta Marrón Pastel', sku: 'CAMISETA-002', categoria: 'Blusas', precio: 24.99, stock: 6, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/camiseta-marron-pastel.jpg' },
  { nombre: 'Polera Beige Logo Donald Duck', sku: 'POLERA-001', categoria: 'Blusas', precio: 29.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/polera-beige-logo-donald-duck.jpg' },
  { nombre: 'Polera Colores Pastel con Logo', sku: 'POLERA-002', categoria: 'Blusas', precio: 29.99, stock: 7, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/polera-colores-pastel-con-logo.jpg' },
  { nombre: 'Polera Marrón Pastel', sku: 'POLERA-003', categoria: 'Blusas', precio: 27.99, stock: 4, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/polera-marron-pastel.jpg' },
  { nombre: 'Polera Vino', sku: 'POLERA-004', categoria: 'Blusas', precio: 27.99, stock: 9, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/polera-vino.jpg' },
  { nombre: 'Polo Mujer Gris Chiffon', sku: 'POLO-001', categoria: 'Blusas', precio: 32.99, stock: 6, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/polo-mujer-gris-chiffon.jpg' },

  // FALDAS
  { nombre: 'Falda Azul con Flores', sku: 'FALDA-001', categoria: 'Faldas', precio: 34.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/falda-azul-con-flores.jpg' },
  { nombre: 'Falda Línea Simple Casual', sku: 'FALDA-002', categoria: 'Faldas', precio: 32.99, stock: 8, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/falda-linea-simple-casual-mujer-verano.jpg' },
  { nombre: 'Falda Negro Puntos Blancos', sku: 'FALDA-003', categoria: 'Faldas', precio: 31.99, stock: 4, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/falda-negro-puntos-blancos.jpg' },
  { nombre: 'Falda Verde Lazo', sku: 'FALDA-004', categoria: 'Faldas', precio: 35.99, stock: 3, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/falda-verde-lazo.jpg' },
  { nombre: 'Falda Volantes Cinto', sku: 'FALDA-005', categoria: 'Faldas', precio: 38.99, stock: 6, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/falda-volantes-cinto.jpg' },

  // PANTALONES
  { nombre: 'Crush Straight Jean', sku: 'JEAN-001', categoria: 'Pantalones', precio: 44.99, stock: 7, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/crush-straight-jean.jpg' },
  { nombre: 'Jeans Azul con Lazo', sku: 'JEAN-002', categoria: 'Pantalones', precio: 45.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/jeans-azul-con-lazo-jean.jpg' },
  { nombre: 'Pantalón Jeans Azul Oscuro Olgado', sku: 'JEAN-003', categoria: 'Pantalones', precio: 42.99, stock: 8, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/pantalon-jeans-mujer-azul-oscuro-olgado.jpg' },
  { nombre: 'Pantalón Cargo Blanco', sku: 'CARGO-001', categoria: 'Pantalones', precio: 39.99, stock: 4, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/pantalon-cargo-blanco.jpg' },
  { nombre: 'Pantalón Cargo Crema', sku: 'CARGO-002', categoria: 'Pantalones', precio: 39.99, stock: 6, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/pantalon-cargo-crema.jpg' },
  { nombre: 'Pantalón Cargo Jeans Negro', sku: 'CARGO-003', categoria: 'Pantalones', precio: 41.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/pantalon-cargo-jeans-mujer-negro.jpg' },
  { nombre: 'Pantalón Cargo Jeans Mujer', sku: 'CARGO-004', categoria: 'Pantalones', precio: 41.99, stock: 7, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/pantalon-cargo-jeans-mujer.jpg' },
  { nombre: 'Pantalón Cargo Negro', sku: 'CARGO-005', categoria: 'Pantalones', precio: 39.99, stock: 3, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/pantalon-cargo-negro.jpg' },

  // BUZOS/SWEATERS
  { nombre: 'Casaca Colorblock 1', sku: 'CASACA-001', categoria: 'Buzos', precio: 54.99, stock: 4, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/casaca-colorblock-1.jpg' },
  { nombre: 'Casaca Colorblock', sku: 'CASACA-002', categoria: 'Buzos', precio: 54.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/casaca-colorblock.jpg' },
  { nombre: 'Jacket Crema con Marrón', sku: 'JACKET-001', categoria: 'Buzos', precio: 64.99, stock: 3, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/jacket-crema-con-marron.jpg' },
  { nombre: 'Jacket Female', sku: 'JACKET-002', categoria: 'Buzos', precio: 59.99, stock: 4, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/jacket-female.jpg' },
  { nombre: 'Jacket Gris', sku: 'JACKET-003', categoria: 'Buzos', precio: 59.99, stock: 6, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/jacket-gris.jpg' },
  { nombre: 'Jacket Light Blue', sku: 'JACKET-004', categoria: 'Buzos', precio: 59.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/jacket-light-blue.jpg' },
  { nombre: 'Jersey Dos Tonos Hombros Caídos', sku: 'JERSEY-001', categoria: 'Buzos', precio: 35.99, stock: 7, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/jersey-dos-tonos-hombros-caidos.jpg' },
  { nombre: 'Sueter Tricolor Blanco Azul', sku: 'SUETER-001', categoria: 'Buzos', precio: 42.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/sueter-tricolor-blanco-azul.jpg' },
  { nombre: 'Sueter Tricolor Blanco Gris Negro', sku: 'SUETER-002', categoria: 'Buzos', precio: 42.99, stock: 4, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/sueter-tricolor-blanco-gris-negro.jpg' },
  { nombre: 'Sweater Tricolores Pastel', sku: 'SWEATER-001', categoria: 'Buzos', precio: 44.99, stock: 6, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/sweater-tricolores-pastel.jpg' },
  { nombre: 'Sweaters Azul Claro', sku: 'SWEATER-002', categoria: 'Buzos', precio: 39.99, stock: 8, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/sweaters-azul-claro.jpg' },
  { nombre: 'Sweaters Azul Oscuro', sku: 'SWEATER-003', categoria: 'Buzos', precio: 39.99, stock: 6, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/sweaters-azul-oscuro.jpg' },
  { nombre: 'Sweaters Morado Claro', sku: 'SWEATER-004', categoria: 'Buzos', precio: 39.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/sweaters-morado-claro.jpg' },
  { nombre: 'Sweaters Rosado', sku: 'SWEATER-005', categoria: 'Buzos', precio: 39.99, stock: 7, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/sweaters-rosado.jpg' },

  // VESTIDOS
  { nombre: 'Vestido Casual Tirantes', sku: 'VESTIDO-001', categoria: 'Vestidos', precio: 49.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/vestido-casual-tirantes.jpg' },
  { nombre: 'Vestido Jean Azul', sku: 'VESTIDO-002', categoria: 'Vestidos', precio: 54.99, stock: 3, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/vestido-jean-azul.jpg' },
  { nombre: 'Vestido sin Espalda Amarre', sku: 'VESTIDO-003', categoria: 'Vestidos', precio: 54.99, stock: 4, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/vestido-sin-espalda-amarre.jpg' },
  { nombre: 'Vestido sin Mango con Volante', sku: 'VESTIDO-004', categoria: 'Vestidos', precio: 49.99, stock: 6, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/vestido-sin-mango-con-volante-borde.jpg' },
  { nombre: 'Vestido Verde Pastel', sku: 'VESTIDO-005', categoria: 'Vestidos', precio: 52.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/vestido-verde-pastel.jpg' },
  { nombre: 'Vestido Verde Jade Mujer', sku: 'VESTIDO-006', categoria: 'Vestidos', precio: 51.99, stock: 4, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/vestigo-verde-jade-mujer.jpg' },

  // PRENDAS VERSÁTILES (Asignar a Accesorios o crear una categoría)
  { nombre: 'Prenda Aesthetic', sku: 'PRENDA-001', categoria: 'Accesorios', precio: 29.99, stock: 5, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/prenda-aesthetic.jpg' },
  { nombre: 'Prenda Azul Mujer', sku: 'PRENDA-002', categoria: 'Accesorios', precio: 29.99, stock: 7, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/prenda-azul-mujer.jpg' },
  { nombre: 'Prenda Mujer Aesthetic', sku: 'PRENDA-003', categoria: 'Accesorios', precio: 29.99, stock: 4, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/prenda-mujer-aesthetic.jpg' },
  { nombre: 'Prenda Verde Mujer', sku: 'PRENDA-004', categoria: 'Accesorios', precio: 29.99, stock: 6, imagen: 'https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/prenda-verde-mujer.jpg' },
];

export async function POST() {
  try {
    // Usar clave de servicio para bypass RLS
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Primero, obtener o crear las categorías
    const categorias = ['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Accesorios', 'Buzos'];
    
    // Obtener categorías existentes
    const { data: categoriasExistentes, error: categGetError } = await supabase
      .from('categorias')
      .select()
      .in('nombre', categorias);

    if (categGetError) throw categGetError;

    // Si faltan categorías, crearlas
    const nombresExistentes = new Set((categoriasExistentes || []).map((c: any) => c.nombre));
    const categoriasACrear = categorias.filter(cat => !nombresExistentes.has(cat));

    let categoriasData = categoriasExistentes || [];

    if (categoriasACrear.length > 0) {
      const { data: nuevasCategs, error: categInsertError } = await supabase
        .from('categorias')
        .insert(
          categoriasACrear.map(cat => ({
            nombre: cat,
            descripcion: `Categoría de ${cat.toLowerCase()}`,
            activo: true
          }))
        )
        .select();

      if (categInsertError) throw categInsertError;
      categoriasData = [...categoriasExistentes, ...nuevasCategs];
    }

    // Preparar datos de productos con IDs de categoría
    const now = new Date().toISOString();
    const productosConCategoria = PRODUCTOS_DATA.map(prod => ({
      nombre: prod.nombre,
      descripcion: `${prod.nombre} - Producto de alta calidad`,
      sku: prod.sku,
      categoria_id: categoriasData.find((c: any) => c.nombre === prod.categoria)?.id,
      precio: prod.precio,
      stock: prod.stock,
      stock_minimo: 400,
      estado: 'activo',
      imagen: prod.imagen,
      updated_at: now,
    }));

    // Insertar productos
    const { data: productosData, error: prodError } = await supabase
      .from('productos')
      .insert(productosConCategoria)
      .select();

    if (prodError) throw prodError;

    return NextResponse.json({
      success: true,
      message: 'Productos cargados exitosamente',
      categorias: {
        count: categoriasData?.length || 0,
        data: categoriasData
      },
      productos: {
        count: productosData?.length || 0,
        data: productosData
      },
    });
  } catch (error: any) {
    console.error('[LOAD-PRODUCTS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al cargar productos',
        details: error.details || error.message
      },
      { status: 500 }
    );
  }
}
