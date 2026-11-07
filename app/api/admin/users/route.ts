import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
const schema=z.object({nombre:z.string().min(2),email:z.string().email(),password:z.string().min(8),rol:z.enum(['ADMIN_RRHH','ANALISTA_RRHH','GERENCIA','CONSULTA'])});
export async function POST(req:Request){const s=await getServerSession(authOptions);if((s?.user as any)?.role!=='ADMIN_RRHH')return NextResponse.json({error:'No autorizado'},{status:403});const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:'Revisa los datos ingresados.'},{status:400});try{const data=parsed.data;const user=await prisma.usuario.create({data:{...data,email:data.email.toLowerCase(),passwordHash:await bcrypt.hash(data.password,12)}});await prisma.registroAuditoria.create({data:{usuarioId:(s!.user as any).id,accion:'CREAR',entidad:'Usuario',entidadId:user.id,detalle:`Creó la cuenta ${user.email}`}});return NextResponse.json({id:user.id},{status:201})}catch{return NextResponse.json({error:'Ya existe una cuenta con ese correo.'},{status:409})}}
