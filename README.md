# PLAGERHH · TREZ S.A.C.

Aplicación web para centralizar la gestión de RR.HH. Construida con Next.js 15.5, TypeScript, Tailwind CSS, Prisma/SQLite y NextAuth.

## Requisitos

- Node.js 18.18 o superior y npm.

## Instalación local

1. Copia `.env.example` como `.env` y cambia `NEXTAUTH_SECRET` por una clave aleatoria larga.
2. Instala dependencias y crea la base de datos:

```bash
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

3. Abre [http://localhost:3000](http://localhost:3000).

El script seed crea usuarios de demostración, áreas, cargos, 15 colaboradores, 5 vacantes, 12 postulantes y tres periodos de planilla.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador RR.HH. | admin@trez.com.pe | TrezDemo2026! |
| Analista RR.HH. | analista@trez.com.pe | TrezDemo2026! |
| Gerencia | gerencia@trez.com.pe | TrezDemo2026! |
| Consulta | consulta@trez.com.pe | TrezDemo2026! |

## Etapa 1

Incluye tema corporativo, login con bloqueo después de cinco intentos, sesión con duración máxima de ocho horas y cierre por 30 minutos de inactividad, permisos por rol, navegación protegida, tablero inicial y administración de usuarios con auditoría al crear cuentas. En esta etapa la administración presenta catálogo de áreas y cargos; la edición de catálogos se completará en el flujo administrativo.

Para probar: inicia sesión como cada rol. ADMIN_RRHH debe ver Administración y puede crear usuarios; GERENCIA y CONSULTA deben ser enviados al dashboard si ingresan a `/admin`. Cierra sesión y comprueba que `/dashboard` redirige al login. El bloqueo temporal se activa tras cinco contraseñas incorrectas durante 15 minutos.

## Etapa 2 · Talent

Incluye el tablero Kanban (Recibido, Preseleccionado, Entrevista, Oferta, Contratado y Descartado), creación de vacantes y postulantes, búsqueda y filtro por vacante, exportación a Excel, descarga de CV y conversión de una candidatura contratada en colaborador. Los archivos CV se guardan en `storage/cv` y se descargan mediante una ruta autenticada; se aceptan PDF/DOC/DOCX de hasta 5 MB. Esa carpeta queda fuera de Git.

Para probar: entra como `admin@trez.com.pe` o `analista@trez.com.pe`, crea una vacante y registra un postulante con CV. Abre su ficha, mueve la candidatura entre etapas arrastrando una tarjeta o usando el selector, llévala a Contratado y pulsa “Convertir en colaborador”. El nuevo registro se refleja en el directorio de colaboradores cuando esté habilitada la Etapa 3. La cuenta Consulta puede visualizar y exportar datos, pero no editarlos; Gerencia no tiene acceso a Talent.

## Etapa 3 · People

People integra el directorio con los registros que Talent convierte en colaboradores. Permite consultar y filtrar por nombre, código, área y estado; crear y editar legajos con área, cargo, jefatura, fecha de ingreso y estado; consultar el historial; agregar contratos y subir documentos privados (PDF/DOC/DOCX/PNG/JPG, hasta 10 MB). Los archivos quedan fuera de Git en `storage/people` y se entregan solo a usuarios autenticados.

Para probar: aplica `npx prisma migrate dev --name people` y reinicia `npm run dev`. Inicia sesión como Administración o Analista, abre Personas y crea o edita un legajo. Añade un contrato y un documento, vuelve a abrir el legajo y verifica que ambos aparecen junto con el historial. Comprueba que una cuenta Consulta puede abrir y descargar documentos, pero no ve los controles de edición.

## Etapa 4 · Payroll

Payroll administra periodos mensuales, calcula boletas individuales desde la remuneración registrada en People, registra tasas configurables de descuentos y aportes, exporta el detalle a Excel y genera boletas PDF. Las tasas no se fijan automáticamente; el administrador de nómina debe configurar las que correspondan a sus políticas y validaciones vigentes. Los porcentajes en los datos seed son valores ficticios de demostración.

Para probar: aplica `npx prisma migrate dev --name payroll`, vuelve a ejecutar `npm run seed` y reinicia `npm run dev`. Abre Planilla con una cuenta de Administración o Analista, selecciona el periodo en borrador, introduce las tasas de prueba aprobadas internamente y pulsa “Calcular planilla”. Revisa una boleta PDF, exporta Excel, aprueba el periodo y, como Administración, márcalo Pagado. La cuenta Consulta puede ver y descargar; no puede editar, aprobar ni marcar pagos.

## Etapa 5 · Attendance

Attendance ofrece un calendario mensual con marcas diarias de entrada, salida, tardanza, falta y ausencias; registro y edición de asistencia; solicitudes de permiso, licencia y vacaciones; y flujos de aprobación/rechazo. Los registros y decisiones escriben en la auditoría. Los horarios se guardan con la zona horaria de Perú (UTC−5).

Para probar: aplica `npx prisma migrate dev --name attendance`, vuelve a ejecutar `npm run seed` y reinicia `npm run dev`. En Asistencia, navega entre meses, elige un día y registra entrada/salida o una falta. Crea una solicitud para un colaborador y apruébala o recházala con Administración o Analista. Consulta puede ver el calendario y las solicitudes, pero no registrar ni aprobar.

## Etapa 6 · Benefits

Benefits mantiene el catálogo con categoría y disponibilidad, registra asignaciones a colaboradores con fechas de vigencia, evita periodos duplicados que se solapen y permite finalizar una asignación. El estado (programado, vigente o finalizado) se calcula a partir de las fechas. Las altas, ediciones, asignaciones y cierres se escriben en auditoría.

Para probar: ejecuta `npx prisma migrate dev --name benefits`, `npm run seed` y reinicia `npm run dev`. En Beneficios crea un beneficio, asígnalo a una persona, confirma que aparece como vigente y finalízalo con una fecha. Verifica que Consulta puede ver y exportar el listado, pero no puede editarlo.

## Etapa 7 · Analytics

Analytics incorpora los seis reportes pedidos: plantilla y rotación, reclutamiento, asistencia, planilla, beneficios y ejecutivo consolidado. Todos aceptan filtros por mes inicial/final y área, muestran indicadores, gráfico y tabla, y se exportan a Excel y PDF. El reporte de rotación usa el estado actual de colaboradores porque el modelo aún no contiene una fecha histórica de cese.

Para probar: ejecuta `npx prisma migrate dev --name analytics` y reinicia `npm run dev`. Abre Analítica, cambia de reporte, periodo y área; genera cada reporte, exporta a ambos formatos y comprueba que la cuenta Consulta solo puede leer. Administración, Analistas y Gerencia pueden acceder a Analytics.

## Privacidad y seguridad

Los datos de ejemplo son ficticios. Configura una clave de sesión propia, restringe acceso al equipo autorizado y usa una base de datos y respaldos protegidos al desplegar. La aplicación aplica controles de acceso en servidor para la administración y almacena contraseñas con bcrypt.

## Avance por etapas

## Etapa 8 · Dashboard e integración

El dashboard lee los datos de todos los módulos y muestra personal activo, vacantes, asistencia del día, planilla, distribución por área, asistencia semanal, evolución de planilla, embudo de selección y beneficios vigentes. Se integraron descargas privadas de documentos y CV, auditoría de cambios, permisos de rol y exportación Excel sin el paquete SheetJS con alertas conocidas.

La base queda en Next.js 15.5.28 (App Router) en lugar de la versión 14 inicialmente solicitada. La auditoría de npm señaló una vulnerabilidad crítica de ejecución remota en versiones anteriores a 15.5.24 sobre servidores Windows; se eligió 15.5.28 para mantener el proyecto seguro en el entorno Windows previsto.


Para verificar la integración: ejecuta `npm run build`, inicia sesión con cada uno de los cuatro roles y confirma que el dashboard muestra datos de People, Talent, Payroll, Attendance y Benefits. Como Consulta, prueba las vistas de solo lectura; Gerencia accede al dashboard y Analytics. Sin sesión, `/dashboard` y las APIs deben redirigir al login. Verifica los seis reportes y sus exportaciones PDF/Excel. El archivo Excel se genera como OOXML sin la dependencia vulnerable SheetJS.
