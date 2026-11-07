import { prisma } from '@/lib/prisma';
import PayrollWorkspace from '@/components/payroll-workspace';

export default async function PayrollPage(){const plans=await prisma.planilla.findMany({orderBy:{periodo:'desc'},include:{boletas:{orderBy:{colaborador:{apellidos:'asc'}},include:{colaborador:{select:{id:true,codigo:true,nombres:true,apellidos:true,dni:true,area:{select:{nombre:true}},cargo:{select:{nombre:true}}}}}}}});return <PayrollWorkspace initialPlans={JSON.parse(JSON.stringify(plans))}/>}
