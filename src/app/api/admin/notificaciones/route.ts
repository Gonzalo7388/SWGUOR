import { NextRequest, NextResponse } from 'next/server';

// Almacenamiento temporal de notificaciones (en producción usarías Supabase)
let notificacionesStore: any[] = [
  {
    id: 1,
    tipo: 'orden',
    titulo: 'Nueva orden recibida',
    descripcion: 'Orden #ORD-001234 de Cliente Importante',
    fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    leida: false,
    importante: false
  },
  {
    id: 2,
    tipo: 'inventario',
    titulo: 'Stock bajo',
    descripcion: 'Producto Tela Algodón 100% stock por debajo del mínimo',
    fecha: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    leida: false,
    importante: true
  },
  {
    id: 3,
    tipo: 'pago',
    titulo: 'Pago recibido',
    descripcion: 'Pago de $500.00 confirmado para Orden #ORD-001200',
    fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    leida: true,
    importante: false
  },
  {
    id: 4,
    tipo: 'mensaje',
    titulo: 'Nuevo mensaje del cliente',
    descripcion: 'Cliente Importante pregunta sobre estado de su pedido',
    fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    leida: true,
    importante: false
  },
  {
    id: 5,
    tipo: 'sistema',
    titulo: 'Mantenimiento programado',
    descripcion: 'Mantenimiento del sistema el próximo sábado de 2:00 AM a 4:00 AM',
    fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    leida: true,
    importante: false
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tipoFilter = searchParams.get('tipo');
    const soloNoLeidas = searchParams.get('soloNoLeidas') === 'true';

    let result = [...notificacionesStore];

    if (tipoFilter && tipoFilter !== 'todos') {
      result = result.filter(n => n.tipo === tipoFilter);
    }

    if (soloNoLeidas) {
      result = result.filter(n => !n.leida);
    }

    result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const kpis = {
      sinLeer: notificacionesStore.filter(n => !n.leida).length,
      importantes: notificacionesStore.filter(n => n.importante).length,
      total: notificacionesStore.length
    };

    return NextResponse.json({
      data: result,
      kpis,
      count: result.length
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id } = body;

    if (action === 'marcarComoLeida') {
      const notif = notificacionesStore.find(n => n.id === id);
      if (notif) {
        notif.leida = true;
      }
      return NextResponse.json({ success: true, data: notif });
    }

    if (action === 'marcarComoImportante') {
      const notif = notificacionesStore.find(n => n.id === id);
      if (notif) {
        notif.importante = !notif.importante;
      }
      return NextResponse.json({ success: true, data: notif });
    }

    if (action === 'eliminar') {
      notificacionesStore = notificacionesStore.filter(n => n.id !== id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, leida, importante } = body;

    const notif = notificacionesStore.find(n => n.id === id);
    if (!notif) {
      return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 });
    }

    if (leida !== undefined) notif.leida = leida;
    if (importante !== undefined) notif.importante = importante;

    return NextResponse.json({ success: true, data: notif });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    notificacionesStore = notificacionesStore.filter(n => n.id !== parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
