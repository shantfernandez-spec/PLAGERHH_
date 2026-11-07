import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';

export async function requireRole(roles: string[]) {
  const session = await getServerSession(authOptions);
  const user = session?.user as ({ id?: string; role?: string }) | undefined;
  if (!user || !roles.includes(user.role || '')) return { user: null, response: NextResponse.json({ error: 'No autorizado.' }, { status: 403 }) };
  return { user, response: null };
}
export const HR_ROLES = ['ADMIN_RRHH', 'ANALISTA_RRHH'];
export const READ_ROLES = [...HR_ROLES, 'CONSULTA', 'GERENCIA'];
