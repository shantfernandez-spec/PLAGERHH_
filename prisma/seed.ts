
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seed de PLAGERHH...');

  const pw = await bcrypt.hash('TrezDemo2026!', 12);

  // 1. USUARIOS
  for (const [nombre, email, rol] of [
    ['Administrador RRHH', 'admin@trez.com.pe', 'ADMIN_RRHH'],
    ['Analista RRHH', 'analista@trez.com.pe', 'ANALISTA_RRHH'],
    ['Gerencia', 'gerencia@trez.com.pe', 'GERENCIA'],
    ['Consulta', 'consulta@trez.com.pe', 'CONSULTA']
  ] as const) {
    await prisma.usuario.upsert({
      where: { email },
      update: {
        nombre,
        rol
      },
      create: {
        nombre,
        email,
        rol,
        passwordHash: pw
      }
    });
  }

  // 2. AREAS
  const areaNames = [
    'Administración',
    'Operaciones',
    'Finanzas',
    'Comercial',
    'Tecnología'
  ];

  const areas = [];

  for (const nombre of areaNames) {
    areas.push(
      await prisma.area.upsert({
        where: { nombre },
        update: {},
        create: { nombre }
      })
    );
  }

  // 3. CARGOS
  const roleNames = [
    'Asistente Administrativo',
    'Analista',
    'Coordinador',
    'Jefe de Área',
    'Especialista'
  ];

  const cargos = [];

  for (const nombre of roleNames) {
    cargos.push(
      await prisma.cargo.upsert({
        where: { nombre },
        update: {},
        create: { nombre }
      })
    );
  }

  // 4. COLABORADORES
  const names = [
    'María', 'José', 'Lucía', 'Carlos', 'Ana',
    'Diego', 'Valeria', 'Jorge', 'Camila', 'Luis',
    'Rosa', 'Miguel', 'Elena', 'Pedro', 'Sofía'
  ];

  const surnames = [
    'García', 'Torres', 'Rojas', 'Díaz', 'Flores',
    'Vargas', 'Castro', 'Mendoza', 'Paredes', 'Salazar',
    'Quispe', 'Reyes', 'Navarro', 'Ruiz', 'Cruz'
  ];

  for (let i = 0; i < 15; i++) {
    const codigo = `TRZ-${String(i + 1).padStart(3, '0')}`;

    await prisma.colaborador.upsert({
      where: { codigo },
      update: {
        remuneracion: 2500 + i * 200
      },
      create: {
        codigo,
        nombres: names[i],
        apellidos: surnames[i],
        email: `${names[i].toLowerCase()}.${surnames[i].toLowerCase()}@trez.com.pe`,
        areaId: areas[i % areas.length].id,
        cargoId: cargos[i % cargos.length].id,
        remuneracion: 2500 + i * 200,
        fechaIngreso: new Date(2023 + (i % 3), i % 12, 1)
      }
    });
  }

  // 5. VACANTES
  const vacancyTitles = [
    'Analista de RR.HH.',
    'Asistente de Operaciones',
    'Especialista de Finanzas',
    'Coordinador Comercial',
    'Desarrollador de Sistemas'
  ];

  for (let i = 1; i <= 5; i++) {
    await prisma.vacante.upsert({
      where: { id: `demo-vacante-${i}` },
      update: {},
      create: {
        id: `demo-vacante-${i}`,
        titulo: vacancyTitles[i - 1],
        area: areaNames[(i - 1) % areaNames.length]
      }
    });
  }

  // 6. BENEFICIOS
  const benefitSeeds = [
    ['Tarjeta de alimentación', 'Apoyo mensual para alimentación', 'Alimentación'],
    ['Seguro complementario', 'Cobertura de salud adicional', 'Salud'],
    ['Capacitación anual', 'Presupuesto para formación profesional', 'Formación'],
    ['Programa de bienestar', 'Actividades y recursos de bienestar', 'Bienestar'],
    ['Préstamo educativo', 'Apoyo financiero para estudios', 'Financiero']
  ] as const;

  const benefits = [];

  for (const [nombre, descripcion, categoria] of benefitSeeds) {
    benefits.push(
      await prisma.beneficio.upsert({
        where: { nombre },
        update: {
          descripcion,
          categoria,
          activo: true
        },
        create: {
          nombre,
          descripcion,
          categoria
        }
      })
    );
  }

  // 7. ASIGNACIONES DE BENEFICIOS
  const benefitPeople = await prisma.colaborador.findMany({
    orderBy: { codigo: 'asc' }
  });

  for (let i = 0; i < benefitPeople.length; i++) {
    for (let j = 0; j < 2; j++) {
      const person = benefitPeople[i];
      const benefit = benefits[(i + j) % benefits.length];

      const id = `demo-asign-${person.id}-${benefit.id}`;

      await prisma.asignacionBeneficio.upsert({
        where: { id },
        update: {},
        create: {
          id,
          colaboradorId: person.id,
          beneficioId: benefit.id,
          vigenciaDesde: new Date('2025-01-01T05:00:00.000Z')
        }
      });
    }
  }

  // 8. POSTULANTES
  const vacancies = await prisma.vacante.findMany({
    where: {
      id: { startsWith: 'demo-vacante-' }
    }
  });

  if (vacancies.length === 0) {
    throw new Error('No se encontraron vacantes de demostración.');
  }

  for (let i = 0; i < 12; i++) {
    const id = `demo-postulante-${i + 1}`;

    await prisma.postulante.upsert({
      where: { id },
      update: {},
      create: {
        id,
        nombres: `Postulante ${i + 1}`,
        email: `postulante${i + 1}@correo.pe`,
        canal: i % 2 ? 'LinkedIn' : 'Bumeran',
        etapa: [
          'Recibido',
          'Preseleccionado',
          'Entrevista',
          'Oferta',
          'Contratado',
          'Descartado'
        ][i % 6],
        vacanteId: vacancies[i % vacancies.length].id
      }
    });
  }

  // 9. PLANILLAS Y BOLETAS
  const seededPeople = await prisma.colaborador.findMany({
    where: {
      codigo: {
        in: Array.from(
          { length: 15 },
          (_, i) => `TRZ-${String(i + 1).padStart(3, '0')}`
        )
      },
      estado: 'Activo'
    },
    orderBy: { codigo: 'asc' }
  });

  const demoPeriods = [
    { monthsAgo: 2, tasaDescuento: 12, tasaAporte: 8 },
    { monthsAgo: 1, tasaDescuento: 13, tasaAporte: 9 },
    { monthsAgo: 0, tasaDescuento: 14, tasaAporte: 10 }
  ];

  for (const { monthsAgo, tasaDescuento, tasaAporte } of demoPeriods) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - monthsAgo);

    const periodo = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}`;

    const slips = seededPeople.map((person) => {
      const bruto = person.remuneracion;
      const descuentos = Math.round(bruto * tasaDescuento) / 100;
      const aportes = Math.round(bruto * tasaAporte) / 100;
      const neto = bruto - descuentos;

      return {
        person,
        bruto,
        descuentos,
        aportes,
        neto
      };
    });

    const totals = slips.reduce(
      (sum, s) => ({
        bruto: sum.bruto + s.bruto,
        descuentos: sum.descuentos + s.descuentos,
        aportes: sum.aportes + s.aportes,
        neto: sum.neto + s.neto
      }),
      {
        bruto: 0,
        descuentos: 0,
        aportes: 0,
        neto: 0
      }
    );

    const plan = await prisma.planilla.upsert({
      where: { periodo },
      update: {
        tasaDescuento,
        tasaAporte,
        totalBruto: totals.bruto,
        totalDescuentos: totals.descuentos,
        totalAportes: totals.aportes,
        totalNeto: totals.neto
      },
      create: {
        periodo,
        estado: monthsAgo === 0 ? 'Borrador' : 'Pagada',
        tasaDescuento,
        tasaAporte,
        totalBruto: totals.bruto,
        totalDescuentos: totals.descuentos,
        totalAportes: totals.aportes,
        totalNeto: totals.neto
      }
    });

    for (const { person, ...slip } of slips) {
      await prisma.boleta.upsert({
        where: {
          planillaId_colaboradorId: {
            planillaId: plan.id,
            colaboradorId: person.id
          }
        },
        update: slip,
        create: {
          ...slip,
          planillaId: plan.id,
          colaboradorId: person.id
        }
      });
    }
  }

  // 10. ASISTENCIAS
  const people = await prisma.colaborador.findMany({
    select: { id: true }
  });

  for (let offset = 0; offset < 90; offset++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - offset);

    if (fecha.getDay() === 0 || fecha.getDay() === 6) {
      continue;
    }

    for (let i = 0; i < people.length; i++) {
      const id = `demo-att-${people[i].id}-${fecha.toISOString().slice(0, 10)}`;

      const entrada = new Date(fecha);
      entrada.setHours(8 + (i % 2), i % 3 ? 0 : 12, 0, 0);

      const salida = new Date(fecha);
      salida.setHours(17, 0, 0, 0);

      await prisma.asistencia.upsert({
        where: { id },
        update: {},
        create: {
          id,
          colaboradorId: people[i].id,
          fecha,
          entrada,
          salida,
          estado: i % 17 === 0 ? 'Tardanza' : 'Presente'
        }
      });
    }
  }

  console.log('Seed PLAGERHH listo.');
}

main()
  .catch((e) => {
    console.error('Error ejecutando seed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
