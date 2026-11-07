import { readFileSync } from 'node:fs';
import { encode } from 'next-auth/jwt';

const env = readFileSync('.env', 'utf8');
const secret = env.match(/^NEXTAUTH_SECRET="([^"]+)"/m)?.[1];
if (!secret) throw new Error('NEXTAUTH_SECRET missing');
const base = 'http://localhost:3000';
const token = await encode({ token: { sub: 'smoke-admin', uid: 'smoke-admin', name: 'Smoke Admin', email: 'admin@trez.com.pe', role: 'ADMIN_RRHH' }, secret, maxAge: 8 * 60 * 60 });
const cookie = `next-auth.session-token=${token}`;
const urls = ['/dashboard','/talent','/people','/payroll','/attendance','/benefits','/analytics','/admin','/api/talent','/api/people','/api/payroll','/api/attendance?month=2026-10','/api/benefits','/api/analytics?report=ejecutivo&desde=2026-10&hasta=2026-10','/api/admin/users'];
for (const path of urls) {
  const response = await fetch(base + path, { headers: { cookie }, redirect: 'manual' });
  const text = await response.text();
  let extra = '';
  if (response.headers.get('content-type')?.includes('application/json')) {
    try { const data = JSON.parse(text); extra = ` ${Array.isArray(data) ? data.length : data.error || Object.keys(data).join(',')}`; }
    catch { extra = ' invalid-json'; }
  }
  console.log(`${response.status} ${path}${extra}`);
  if (response.status >= 500) console.log(text.slice(0, 700));
}
const consultation = await encode({ token: { sub: 'smoke-consulta', uid: 'smoke-consulta', name: 'Smoke Consulta', email: 'consulta@trez.com.pe', role: 'CONSULTA' }, secret, maxAge: 8 * 60 * 60 });
for (const [path, method, body] of [['/api/talent','POST',{titulo:'No autorizado',area:'Prueba'}],['/api/benefits','POST',{nombre:'No autorizado',categoria:'Otro'}],['/api/admin/users','POST',{nombre:'No autorizado'}]]) {
  const response = await fetch(base + path, { method, headers: { cookie: `next-auth.session-token=${consultation}`, 'content-type':'application/json' }, body: JSON.stringify(body), redirect:'manual' });
  console.log(`${response.status} CONSULTA ${method} ${path}`);
}
const management = await encode({ token: { sub: 'smoke-gerencia', uid: 'smoke-gerencia', name: 'Smoke Gerencia', email: 'gerencia@trez.com.pe', role: 'GERENCIA' }, secret, maxAge: 8 * 60 * 60 });
for (const path of ['/api/payroll','/api/attendance?month=2026-10']) {
  const response = await fetch(base + path, { headers: { cookie: `next-auth.session-token=${management}` }, redirect:'manual' });
  console.log(`${response.status} GERENCIA GET ${path}`);
}
