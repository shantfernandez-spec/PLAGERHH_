import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { HR_ROLES, requireRole } from '@/lib/permissions';

export async function GET(_req:Request,{params}:{params: Promise<{ id: string }>}){const {id}=await params;
 const access=await requireRole([...HR_ROLES,'CONSULTA']);if(access.response)return access.response;
 const person=await prisma.colaborador.findUnique({where:{id:id},include:{area:true,cargo:true,jefe:{select:{id:true,nombres:true,apellidos:true}},reportes:{select:{id:true,nombres:true,apellidos:true}},contratos:{orderBy:{fechaInicio:'desc'}},}});
 if(!person)return NextResponse.json({error:'Colaborador no encontrado.'},{status:404});
 const [documentos,historial]=await Promise.all([prisma.documento.findMany({where:{colaboradorId:person.id},orderBy:{creado:'desc'}}),prisma.registroAuditoria.findMany({where:{entidadId:person.id},include:{usuario:{select:{nombre:true}}},orderBy:{creado:'desc'},take:50})]);
 return NextResponse.json({...person,documentos,historial});
}
const schema=z.object({nombres:z.string().trim().min(2).max(100),apellidos:z.string().trim().min(2).max(120),email:z.union([z.string().email(),z.literal('')]),dni:z.string().trim().max(12).optional().or(z.literal('')),areaId:z.string().optional().or(z.literal('')),cargoId:z.string().optional().or(z.literal('')),jefeId:z.string().optional().or(z.literal('')),estado:z.enum(['Activo','Inactivo','Licencia','Cesado']),remuneracion:z.coerce.number().min(0),fechaIngreso:z.coerce.date()});
export async function PATCH(req:Request,{params}:{params: Promise<{ id: string }>}){const {id}=await params;
 const access=await requireRole(HR_ROLES);if(access.response)return access.response;
 const body=schema.safeParse(await req.json());if(!body.success)return NextResponse.json({error:'Revisa los datos del legajo.'},{status:400});
 const previous=await prisma.colaborador.findUnique({where:{id:id}});if(!previous)return NextResponse.json({error:'Colaborador no encontrado.'},{status:404});
 if(body.data.jefeId===id)return NextResponse.json({error:'Un colaborador no puede ser su propio jefe.'},{status:400});
 try{const d=body.data;const person=await prisma.colaborador.update({where:{id:id},data:{nombres:d.nombres,apellidos:d.apellidos,email:d.email||null,dni:d.dni||null,areaId:d.areaId||null,cargoId:d.cargoId||null,jefeId:d.jefeId||null,estado:d.estado,remuneracion:d.remuneracion,fechaIngreso:d.fechaIngreso}});await prisma.registroAuditoria.create({data:{usuarioId:access.user!.id!,accion:'ACTUALIZAR',entidad:'Colaborador',entidadId:person.id,detalle:`Actualizó el legajo de ${person.nombres} ${person.apellidos}${previous.estado!==person.estado?`; cambió estado de ${previous.estado} a ${person.estado}`:''}`}});return NextResponse.json(person)}catch{return NextResponse.json({error:'No se pudo actualizar el legajo.'},{status:400})}
}
