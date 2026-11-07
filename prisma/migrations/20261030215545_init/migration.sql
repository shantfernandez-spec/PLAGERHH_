-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoHasta" DATETIME,
    "ultimoAcceso" DATETIME,
    "creado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Cargo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT,
    "dni" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "remuneracion" REAL NOT NULL DEFAULT 0,
    "fechaIngreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jefeId" TEXT,
    "areaId" TEXT,
    "cargoId" TEXT,
    CONSTRAINT "Colaborador_jefeId_fkey" FOREIGN KEY ("jefeId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Colaborador_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Colaborador_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vacante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Abierta',
    "creado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Postulante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombres" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "creado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etapa" TEXT NOT NULL DEFAULT 'Recibido',
    "cvUrl" TEXT,
    "cvNombre" TEXT,
    "colaboradorId" TEXT,
    "vacanteId" TEXT NOT NULL,
    CONSTRAINT "Postulante_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Postulante_vacanteId_fkey" FOREIGN KEY ("vacanteId") REFERENCES "Vacante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME,
    "colaboradorId" TEXT NOT NULL,
    CONSTRAINT "Contrato_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Planilla" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Borrador',
    "tasaDescuento" REAL NOT NULL DEFAULT 0,
    "tasaAporte" REAL NOT NULL DEFAULT 0,
    "totalBruto" REAL NOT NULL DEFAULT 0,
    "totalDescuentos" REAL NOT NULL DEFAULT 0,
    "totalAportes" REAL NOT NULL DEFAULT 0,
    "totalNeto" REAL NOT NULL DEFAULT 0,
    "creado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Boleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colaboradorId" TEXT NOT NULL,
    "planillaId" TEXT NOT NULL,
    "bruto" REAL NOT NULL,
    "descuentos" REAL NOT NULL DEFAULT 0,
    "aportes" REAL NOT NULL DEFAULT 0,
    "neto" REAL NOT NULL,
    CONSTRAINT "Boleta_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Boleta_planillaId_fkey" FOREIGN KEY ("planillaId") REFERENCES "Planilla" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colaboradorId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "entrada" DATETIME,
    "salida" DATETIME,
    "estado" TEXT NOT NULL,
    "notas" TEXT,
    CONSTRAINT "Asistencia_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colaboradorId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "inicio" DATETIME NOT NULL,
    "fin" DATETIME NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "revisadoPorId" TEXT,
    "revisadoEn" DATETIME,
    CONSTRAINT "Permiso_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Permiso_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Beneficio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'Otro',
    "activo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "AsignacionBeneficio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colaboradorId" TEXT NOT NULL,
    "beneficioId" TEXT NOT NULL,
    "vigenciaDesde" DATETIME NOT NULL,
    "vigenciaHasta" DATETIME,
    "creado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AsignacionBeneficio_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AsignacionBeneficio_beneficioId_fkey" FOREIGN KEY ("beneficioId") REFERENCES "Beneficio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colaboradorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "creado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Documento_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "detalle" TEXT,
    "creado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Area_nombre_key" ON "Area"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Cargo_nombre_key" ON "Cargo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Colaborador_codigo_key" ON "Colaborador"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Postulante_colaboradorId_key" ON "Postulante"("colaboradorId");

-- CreateIndex
CREATE UNIQUE INDEX "Planilla_periodo_key" ON "Planilla"("periodo");

-- CreateIndex
CREATE UNIQUE INDEX "Boleta_planillaId_colaboradorId_key" ON "Boleta"("planillaId", "colaboradorId");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficio_nombre_key" ON "Beneficio"("nombre");
