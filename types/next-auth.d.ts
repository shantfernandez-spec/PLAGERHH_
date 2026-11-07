import 'next-auth';
declare module 'next-auth' { interface Session { user: { id: string; role: 'ADMIN_RRHH'|'ANALISTA_RRHH'|'GERENCIA'|'CONSULTA' } & DefaultSession['user'] } }
import { DefaultSession } from 'next-auth';
