import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { HR_ROLES, requireRole } from '@/lib/permissions';

export async function GET(){const access=await requireRole([...HR_ROLES,'CONSULTA']);if(access.response)return access.response;const plans=await prisma.planilla.findMany({orderBy:{periodo:'desc'},include:{boletas:{orderBy:{colaborador:{apellidos:'asc'}},include:{colaborador:{select:{id:true,codigo:true,nombres:true,apellidos:true,dni:true,area:true,cargo:true}}}}}});return NextResponse.json(plans)}
const schema=z.object({periodo:z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)});
export async function POST(req:Request){const access=await requireRole(HR_ROLES);if(access.response)return access.response;const body=schema.safeParse(await req.json());if(!body.success)return NextResponse.json({error:'Selecciona un periodo válido (AAAA-MM).'}, {status:400});try{const plan=await prisma.planilla.create({data:{periodo:body.data.periodo,estado:'Borrador'}});await prisma.registroAuditoria.create({data:{usuarioId:access.user!.id!,accion:'CREAR',entidad:'Planilla',entidadId:plan.id,detalle:`Creó la planilla ${plan.periodo}`}});return NextResponse.json(plan,{status:201})}catch{return NextResponse.json({error:'Ya existe una planilla para ese periodo.'},{status:409})}}
