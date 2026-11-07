import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { HR_ROLES, requireRole } from '@/lib/permissions';

export async function GET() {
  const access = await requireRole([...HR_ROLES, 'CONSULTA']); if (access.response) return access.response;
  const [vacantes, postulantes] = await Promise.all([
    prisma.vacante.findMany({ orderBy: { creado: 'desc' }, include: { _count: { select: { postulantes: true } } } }),
    prisma.postulante.findMany({ orderBy: { id: 'desc' }, include: { vacante: { select: { id: true, titulo: true, area: true } } } })
  ]);
  return NextResponse.json({ vacantes, postulantes });
}

const vacancySchema = z.object({ titulo: z.string().trim().min(3).max(120), area: z.string().trim().min(2).max(80) });
export async function POST(req: Request) {
  const access = await requireRole(HR_ROLES); if (access.response) return access.response;
  const body = vacancySchema.safeParse(await req.json()); if (!body.success) return NextResponse.json({ error: 'Completa un título y un área válidos.' }, { status: 400 });
  const vacante = await prisma.vacante.create({ data: body.data });
  await prisma.registroAuditoria.create({ data: { usuarioId: access.user!.id!, accion: 'CREAR', entidad: 'Vacante', entidadId: vacante.id, detalle: `Creó la vacante ${vacante.titulo}` } });
  return NextResponse.json(vacante, { status: 201 });
}
