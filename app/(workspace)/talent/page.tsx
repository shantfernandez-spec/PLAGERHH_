import { prisma } from '@/lib/prisma';
import TalentBoard from '@/components/talent-board';

export default async function TalentPage() {
  const [vacancies, applicants] = await Promise.all([
    prisma.vacante.findMany({ orderBy: { creado: 'desc' }, include: { _count: { select: { postulantes: true } } } }),
    prisma.postulante.findMany({ orderBy: { id: 'desc' }, include: { vacante: { select: { id: true, titulo: true, area: true } } } })
  ]);
  return <TalentBoard initialVacancies={JSON.parse(JSON.stringify(vacancies))} initialApplicants={JSON.parse(JSON.stringify(applicants))}/>;
}
