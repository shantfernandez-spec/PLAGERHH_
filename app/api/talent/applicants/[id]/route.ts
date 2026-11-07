import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { HR_ROLES, requireRole } from '@/lib/permissions';

const stageSchema = z.object({ etapa: z.enum(['Recibido','Preseleccionado','Entrevista','Oferta','Contratado','Descartado']) });
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {const {id}=await params;
  const access = await requireRole(HR_ROLES); if (access.response) return access.response;
  const body = stageSchema.safeParse(await req.json()); if (!body.success) return NextResponse.json({ error: 'Etapa no válida.' }, { status: 400 });
  const before = await prisma.postulante.findUnique({ where: { id: id } }); if (!before) return NextResponse.json({ error: 'Postulante no encontrado.' }, { status: 404 });
  const updated = await prisma.postulante.update({ where: { id: id }, data: body.data });
  await prisma.registroAuditoria.create({ data: { usuarioId: access.user!.id!, accion: 'ACTUALIZAR', entidad: 'Postulante', entidadId: updated.id, detalle: `Movió a ${updated.nombres} de ${before.etapa} a ${updated.etapa}` } });
  return NextResponse.json(updated);
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {const {id}=await params;
  const access = await requireRole(HR_ROLES); if (access.response) return access.response;
  const candidate = await prisma.postulante.findUnique({ where: { id: id, etapa: 'Contratado' }, include: { vacante: true } });
  if (!candidate) return NextResponse.json({ error: 'El postulante debe estar en etapa Contratado.' }, { status: 409 });
  if (candidate.colaboradorId) return NextResponse.json({ error: 'Este postulante ya se convirtió en colaborador.' }, { status: 409 });
  const names = candidate.nombres.trim().split(/\s+/); const nombres = names.shift() || candidate.nombres; const apellidos = names.join(' ') || 'Por completar';
  const area = await prisma.area.findUnique({ where: { nombre: candidate.vacante.area } });
  const cargo = await prisma.cargo.upsert({ where: { nombre: candidate.vacante.titulo }, update: {}, create: { nombre: candidate.vacante.titulo } });
  const converted = await prisma.$transaction(async tx => {
    const person = await tx.colaborador.create({ data: { codigo: `TRZ-${Date.now().toString().slice(-8)}`, nombres, apellidos, email: candidate.email, areaId: area?.id, cargoId: cargo.id } });
    await tx.postulante.update({ where: { id: candidate.id }, data: { colaboradorId: person.id } });
    await tx.registroAuditoria.create({ data: { usuarioId: access.user!.id!, accion: 'CONVERTIR', entidad: 'Postulante', entidadId: candidate.id, detalle: `Convirtió a ${candidate.nombres} en colaborador ${person.codigo}` } });
    await tx.registroAuditoria.create({ data: { usuarioId: access.user!.id!, accion: 'CREAR', entidad: 'Colaborador', entidadId: person.id, detalle: `Creó el legajo desde Talent para ${person.nombres} ${person.apellidos}` } });
    return person;
  });
  return NextResponse.json(converted, { status: 201 });
}
