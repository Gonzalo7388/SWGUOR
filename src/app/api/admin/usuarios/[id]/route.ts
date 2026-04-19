export const runtime = 'nodejs';
import { UsuariosService } from "@/lib/services/usuarios-services";
import { NextResponse } from "next/server";

export async function GET_USUARIO_ID(id: string) {
  const usuario = await UsuariosService.obtenerPorId(id);
  if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  return NextResponse.json(usuario);
}