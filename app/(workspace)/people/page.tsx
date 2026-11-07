import { prisma } from '@/lib/prisma';
import PeopleDirectory from '@/components/people-directory';

export default async function PeoplePage(){
 const [people,areas,cargos]=await Promise.all([
  prisma.colaborador.findMany({orderBy:{apellidos:'asc'},include:{area:true,cargo:true,jefe:{select:{id:true,nombres:true,apellidos:true}},contratos:{orderBy:{fechaInicio:'desc'},take:1}}}),
  prisma.area.findMany({where:{activo:true},orderBy:{nombre:'asc'}}),
  prisma.cargo.findMany({where:{activo:true},orderBy:{nombre:'asc'}})
 ]);
 return <PeopleDirectory initialPeople={JSON.parse(JSON.stringify(people))} areas={areas} cargos={cargos}/>;
}
