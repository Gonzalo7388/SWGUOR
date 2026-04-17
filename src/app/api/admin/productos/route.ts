export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import { productoOutputSchema } from '@/lib/schemas/productos';

// GET: Obtener todos los productos con filtros e información relacionada
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const categoria_id = searchParams.get('categoria_id');
    const estado = searchParams.get('estado');
    const busqueda = searchParams.get('busqueda');
    const color = searchParams.get('color');
    const talla = searchParams.get('talla');
    const sort = searchParams.get('sort');

    const where: any = {};

    // 📌 CATEGORÍA
    if (categoria_id) {
      where.categoria_id = BigInt(categoria_id);
    }

    // 📌 ESTADO
    if (estado) {
      where.estado = estado;
    }

    // 📌 BÚSQUEDA
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { sku: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    // 📌 FILTRO POR VARIANTES (COLOR / TALLA)
    if (color || talla) {
      where.variantes_producto = {
        some: {
          ...(color && { color }),
          ...(talla && { talla })
        }
      };
    }

    // 📌 ORDENAMIENTO
    let orderBy: any = { created_at: 'desc' };

    if (sort === 'asc') {
      orderBy = { precio: 'asc' };
    } else if (sort === 'desc') {
      orderBy = { precio: 'desc' };
    }

    const [productos, categorias] = await Promise.all([
      prisma.productos.findMany({
        where,
        include: {
          categorias: true,
          variantes_producto: true,
        },
        orderBy,
      }),
      prisma.categorias.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' }
      })
    ]);

    return NextResponse.json(serializeBigInt({
      productos,
      categorias
    }));

  } catch (error: any) {
    console.error('Error detallado en GET productos:', error);
    return NextResponse.json(
      { error: "Fallo en el servidor al obtener productos" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo producto (Transacción atómica)
export async function POST(req: Request) {


  try {
    const body = await req.json();
    
    // Validar con el schema transformado
    const validation = productoOutputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    } 

    const { producto, variantes, nueva_ficha_relacional } = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      let fId = producto.fichas_tecnicas_id;

      // 1. Si hay una ficha técnica nueva, la creamos primero
      if (nueva_ficha_relacional && !fId) {
        const fichaCreada = await tx.fichas_tecnicas.create({
          data: {
            ...nueva_ficha_relacional,
            estado: nueva_ficha_relacional.estado as any
          }
        });
        fId = fichaCreada.id;
      }

      const { fichas_tecnicas_id, ...productoSinExtras } = producto;
      
      // 2. Crear el producto vinculado a la ficha (o null)
      const nuevoProducto = await tx.productos.create({
        data: {
          ...productoSinExtras,
          fichas_tecnicas_id: fId ?? null,
          estado: producto.estado,
          reglas_descuento: producto.reglas_descuento,
          updated_at: new Date(),
        },
      });

      // 3. Crear las variantes vinculadas
      if (variantes.length > 0) {
        await tx.variantes_producto.createMany({
          data: variantes.map(v => ({
            ...v,
            producto_id: nuevoProducto.id,
            color: v.color,
            talla: v.talla,
            estado: v.estado,
          }))
        });
      }

      return nuevoProducto;
    });

    return NextResponse.json(serializeBigInt(result), { status: 201 });
  } catch (error: any) {
    console.error('Error en POST productos:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un producto con ese SKU' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}