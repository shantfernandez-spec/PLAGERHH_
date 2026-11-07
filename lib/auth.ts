import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './prisma';
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [CredentialsProvider({ name: 'Credenciales', credentials: { email: { label: 'Correo', type: 'email' }, password: { label: 'Contraseña', type: 'password' } }, async authorize(credentials) {
    const input = loginSchema.safeParse(credentials); if (!input.success) return null;
    const user = await prisma.usuario.findUnique({ where: { email: input.data.email.toLowerCase() } }); if (!user || !user.activo) return null;
    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) return null;
    const valid = await bcrypt.compare(input.data.password, user.passwordHash);
    if (!valid) { const tries = user.intentosFallidos + 1; await prisma.usuario.update({ where: { id: user.id }, data: { intentosFallidos: tries >= 5 ? 0 : tries, bloqueadoHasta: tries >= 5 ? new Date(Date.now() + 15 * 60_000) : null } }); return null; }
    await prisma.usuario.update({ where: { id: user.id }, data: { intentosFallidos: 0, bloqueadoHasta: null, ultimoAcceso: new Date() } });
    return { id: user.id, name: user.nombre, email: user.email, role: user.rol } as any;
  } })],
  callbacks: { async jwt({ token, user }) { if (user) { token.role = (user as any).role; token.uid = user.id; } return token; }, async session({ session, token }) { if (session.user) { (session.user as any).role = token.role; (session.user as any).id = token.uid; } return session; } }
};
