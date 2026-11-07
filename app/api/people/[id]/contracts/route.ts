import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { HR_ROLES, requireRole } from '@/lib/permissions';
const schema=z.object({tipo:z.string().trim().min(2).max(80),fechaInicio:z.coerce.date(),fechaFin:z.union([z.coerce.date(),z.literal('')]).optional()});
export async function POST(req:Request,{params}:{params: Promise<{ id: string }>}){const {id}=await params;const access=await requireRole(HR_ROLES);if(access.response)return access.response;const input=schema.safeParse(await req.json());if(!input.success)return NextResponse.json({error:'Revisa el tipo y vigencia del contrato.'},{status:400});if(!await prisma.colaborador.findUnique({where:{id:id}}))return NextResponse.json({error:'Colaborador no encontrado.'},{status:404});const d=input.data;const contract=await prisma.contrato.create({data:{colaboradorId:id,tipo:d.tipo,fechaInicio:d.fechaInicio,fechaFin:d.fechaFin instanceof Date?d.fechaFin:null}});await prisma.registroAuditoria.create({data:{usuarioId:access.user!.id!,accion:'CREAR',entidad:'Colaborador',entidadId:id,detalle:`Registró un contrato ${contract.tipo}`}});return NextResponse.json(contract,{status:201})}
