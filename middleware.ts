import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
export default withAuth(function middleware(req) {
 const role = req.nextauth.token?.role as string | undefined; const path = req.nextUrl.pathname;
 if (path.startsWith('/admin') && role !== 'ADMIN_RRHH') return NextResponse.redirect(new URL('/dashboard?acceso=denegado', req.url));
 if (['/talent','/people','/payroll','/attendance','/benefits'].some(p=>path.startsWith(p)) && !['ADMIN_RRHH','ANALISTA_RRHH','CONSULTA'].includes(role || '')) return NextResponse.redirect(new URL('/dashboard?acceso=denegado', req.url));
 if (path.startsWith('/analytics') && !['ADMIN_RRHH','ANALISTA_RRHH','GERENCIA','CONSULTA'].includes(role || '')) return NextResponse.redirect(new URL('/dashboard?acceso=denegado', req.url));
 return NextResponse.next();
}, { pages: { signIn: '/login' }, callbacks: { authorized: ({ token }) => !!token } });
export const config = { matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|logo-lumaq.png).*)'] };
