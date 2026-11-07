import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { HR_ROLES, requireRole } from '@/lib/permissions';

export async function GET() {
  const access=await requireRole([...HR_ROLES,'CONSULTA']); if(access.response)return access.response;
  const people=await prisma.colaborador.findMany({orderBy:{apellidos:'asc'},include:{area:true,cargo:true,jefe:{select:{id:true,nombres:true,apellidos:true}},contratos:{orderBy:{fechaInicio:'desc'},take:1}}});
  return NextResponse.json(people);
}
const schema=z.object({nombres:z.string().trim().min(2).max(100),apellidos:z.string().trim().min(2).max(120),email:z.union([z.string().email(),z.literal('')]),dni:z.string().trim().max(12).optional().or(z.literal('')),areaId:z.string().optional().or(z.literal('')),cargoId:z.string().optional().or(z.literal('')),jefeId:z.string().optional().or(z.literal('')),estado:z.enum(['Activo','Inactivo','Licencia','Cesado']),remuneracion:z.coerce.number().min(0).optional().default(0),fechaIngreso:z.coerce.date(),tipoContrato:z.string().trim().min(2).max(80),finContrato:z.union([z.coerce.date(),z.literal('')]).optional()});
export async function POST(req:Request){
 const access=await requireRole(HR_ROLES);if(access.response)return access.response;
 const body=schema.safeParse(await req.json());if(!body.success)return NextResponse.json({error:'Completa los datos obligatorios con un formato válido.'},{status:400});
 const d=body.data;const code=`TRZ-${randomUUID().slice(0,8).toUpperCase()}`;
 if(d.jefeId&&!await prisma.colaborador.findUnique({where:{id:d.jefeId}}))return NextResponse.json({error:'Jefatura no válida.'},{status:400});
 try{const result=await prisma.$transaction(async tx=>{const person=await tx.colaborador.create({data:{codigo:code,nombres:d.nombres,apellidos:d.apellidos,email:d.email||null,dni:d.dni||null,areaId:d.areaId||null,cargoId:d.cargoId||null,jefeId:d.jefeId||null,estado:d.estado,remuneracion:d.remuneracion,fechaIngreso:d.fechaIngreso}});await tx.contrato.create({data:{colaboradorId:person.id,tipo:d.tipoContrato,fechaInicio:d.fechaIngreso,fechaFin:d.finContrato instanceof Date?d.finContrato:null}});await tx.registroAuditoria.create({data:{usuarioId:access.user!.id!,accion:'CREAR',entidad:'Colaborador',entidadId:person.id,detalle:`Creó el legajo de ${person.nombres} ${person.apellidos}`}});return person});return NextResponse.json(result,{status:201})}
 catch{return NextResponse.json({error:'No se pudo crear el colaborador. Revisa que el área, cargo y jefe existan.'},{status:400})}
}
