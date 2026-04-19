import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export const TalleresService = {

  async listar() {
    const talleres = await prisma.talleres.findMany({
      include: { _count: { select: { confecciones: true } } },
      orderBy: { nombre: 'asc' },
    });
    return serializeBigInt(talleres);
  },

  async crear(data: {
    nombre:       string;
    ruc:          string;
    contacto:     string;
    telefono:     string;
    email?:       string;
    direccion:    string;
    especialidad?: string;
    estado?:      string;
  }) {
    const taller = await prisma.talleres.create({
      data: {
        nombre:       data.nombre,
        ruc:          data.ruc,
        contacto:     data.contacto,
        telefono:     data.telefono,
        email:        data.email        ?? null,
        direccion:    data.direccion,
        especialidad: data.especialidad as any ?? null,
        estado:       (data.estado      as any) ?? 'activo',
      },
    });
    return serializeBigInt(taller);
  },

  async actualizar(id: string, data: Partial<{
    nombre:       string;
    contacto:     string;
    telefono:     string;
    email:        string;
    direccion:    string;
    especialidad: string;
    estado:       string;
  }>) {
    const taller = await prisma.talleres.update({
      where: { id: BigInt(id) },
      data:  { ...data, updated_at: new Date() } as any,
    });
    return serializeBigInt(taller);
  },

  async desactivar(id: string) {
    const taller = await prisma.talleres.update({
      where: { id: BigInt(id) },
      data:  { estado: 'inactivo' as any },
    });
    return serializeBigInt(taller);
  },
};