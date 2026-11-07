import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { requireRole, HR_ROLES } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {const {key}=await params;
  const access = await requireRole([...HR_ROLES, 'CONSULTA']); if (access.response) return access.response;
  if (!/^[0-9a-f-]{36}\.(pdf|doc|docx)$/.test(key)) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404 });
  const url = `/api/talent/cv/${key}`; const applicant = await prisma.postulante.findFirst({ where: { cvUrl: url } });
  if (!applicant) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404 });
  try { const file = await readFile(path.join(process.cwd(), 'storage', 'cv', key)); const ext = path.extname(key); const type = ext === '.pdf' ? 'application/pdf' : ext === '.doc' ? 'application/msword' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; return new NextResponse(file, { headers: { 'Content-Type': type, 'Content-Disposition': `attachment; filename="${encodeURIComponent(applicant.cvNombre || 'CV')}${ext}"`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } }); }
  catch { return NextResponse.json({ error: 'El archivo no está disponible.' }, { status: 404 }); }
}
