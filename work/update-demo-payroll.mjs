import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const demoCodes = Array.from({ length: 15 }, (_, i) => `TRZ-${String(i + 1).padStart(3, '0')}`);
const rates = [{ discount: 12, contribution: 8 }, { discount: 13, contribution: 9 }, { discount: 14, contribution: 10 }];
try {
  const plans = await prisma.planilla.findMany({ where: { periodo: { in: ['2026-08', '2026-09', '2026-10'] } }, orderBy: { periodo: 'asc' } });
  if (plans.length !== 3) throw new Error('No se encontraron exactamente los tres periodos demo esperados; no se hicieron cambios.');
  const people = await prisma.colaborador.findMany({ where: { codigo: { in: demoCodes }, estado: 'Activo' }, orderBy: { codigo: 'asc' } });
  if (people.length !== 15) throw new Error('No se encontraron los 15 colaboradores demo; no se hicieron cambios.');
  for (let monthIndex = 0; monthIndex < plans.length; monthIndex++) {
    const plan = plans[monthIndex], { discount, contribution } = rates[monthIndex];
    const slips = people.map(person => {
      const bruto = person.remuneracion;
      const descuentos = Math.round(bruto * discount) / 100;
      const aportes = Math.round(bruto * contribution) / 100;
      return { person, bruto, descuentos, aportes, neto: bruto - descuentos };
    });
    const totals = slips.reduce((t, s) => ({ bruto: t.bruto + s.bruto, descuentos: t.descuentos + s.descuentos, aportes: t.aportes + s.aportes, neto: t.neto + s.neto }), { bruto: 0, descuentos: 0, aportes: 0, neto: 0 });
    await prisma.$transaction(async tx => {
      await tx.planilla.update({ where: { id: plan.id }, data: { tasaDescuento: discount, tasaAporte: contribution, totalBruto: totals.bruto, totalDescuentos: totals.descuentos, totalAportes: totals.aportes, totalNeto: totals.neto } });
      for (const { person, ...slip } of slips) await tx.boleta.upsert({ where: { planillaId_colaboradorId: { planillaId: plan.id, colaboradorId: person.id } }, update: slip, create: { ...slip, planillaId: plan.id, colaboradorId: person.id } });
    });
  }
  console.log('Cada periodo quedó con 15 colaboradores y tasas demo distintas por mes.');
} finally { await prisma.$disconnect(); }
