import { prisma } from '@/lib/prisma';
import AnalyticsWorkspace from '@/components/analytics-workspace';
export default async function AnalyticsPage(){const areas=await prisma.area.findMany({where:{activo:true},orderBy:{nombre:'asc'},select:{id:true,nombre:true}});return <AnalyticsWorkspace areas={areas}/>}
