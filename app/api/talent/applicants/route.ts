import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { HR_ROLES, requireRole } from '@/lib/permissions';

export const runtime = 'nodejs';
const MAX_CV_BYTES = 5 * 1024 * 1024;
const schema = z.object({ nombres: z.string().trim().min(2).max(120), email: z.string().email(), canal: z.string().trim().min(2).max(80), vacanteId: z.string().min(1) });
export async function POST(req: Request) {
  const access = await requireRole(HR_ROLES); if (access.response) return access.response;
  const form = await req.formData(); const parsed = schema.safeParse({ nombres: form.get('nombres'), email: form.get('email'), canal: form.get('canal'), vacanteId: form.get('vacanteId') });
  if (!parsed.success) return NextResponse.json({ error: 'Revisa nombre, correo, canal y vacante.' }, { status: 400 });
  if (!await prisma.vacante.findUnique({ where: { id: parsed.data.vacanteId } })) return NextResponse.json({ error: 'La vacante ya no existe.' }, { status: 404 });
  const file = form.get('cv'); let cvUrl: string | undefined; let cvNombre: string | undefined;
  if (file && typeof file !== 'string' && file.size > 0) {
    const ext = path.extname(file.name).toLowerCase(); const mimeOk = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
    if (!['.pdf','.doc','.docx'].includes(ext) || !mimeOk || file.size > MAX_CV_BYTES) return NextResponse.json({ error: 'El CV debe ser PDF, DOC o DOCX y pesar hasta 5 MB.' }, { status: 400 });
    const key = `${randomUUID()}${ext}`; const dir = path.join(process.cwd(), 'storage', 'cv'); await mkdir(dir, { recursive: true }); await writeFile(path.join(dir, key), Buffer.from(await file.arrayBuffer()), { flag: 'wx' }); cvUrl = `/api/talent/cv/${key}`; cvNombre = path.basename(file.name).slice(0, 180);
  }
  const applicant = await prisma.postulante.create({ data: { ...parsed.data, email: parsed.data.email.toLowerCase(), ...(cvUrl ? { cvUrl, cvNombre } : {}) } });
  await prisma.registroAuditoria.create({ data: { usuarioId: access.user!.id!, accion: 'CREAR', entidad: 'Postulante', entidadId: applicant.id, detalle: `Registró al postulante ${applicant.nombres}` } });
  return NextResponse.json(applicant, { status: 201 });
}
