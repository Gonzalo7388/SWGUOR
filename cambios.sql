
-- AlterTable
ALTER TABLE "ventas" ADD COLUMN     "estado_pago" TEXT NOT NULL DEFAULT 'completado',
ADD COLUMN     "referencia_pago" VARCHAR(255),
ADD COLUMN     "usuario_id" BIGINT;

-- CreateTable
CREATE TABLE "proveedores" (
    "id" BIGSERIAL NOT NULL,
    "ruc" VARCHAR(11) NOT NULL,
    "razon_social" VARCHAR(200) NOT NULL,
    "contacto" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "direccion" VARCHAR(255) NOT NULL,
    "categoria_suministro" VARCHAR(100) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" BIGSERIAL NOT NULL,
    "clave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "categoria" VARCHAR(50) NOT NULL DEFAULT 'general',
    "descripcion" VARCHAR(255),
    "tipo_dato" VARCHAR(20) NOT NULL DEFAULT 'string',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidencias_taller" (
    "id" BIGSERIAL NOT NULL,
    "orden_id" BIGINT NOT NULL,
    "confeccion_id" BIGINT,
    "tipo" "TipoIncidencia" NOT NULL,
    "severidad" "SeveridadIncidencia" NOT NULL DEFAULT 'media',
    "descripcion" TEXT NOT NULL,
    "reportado_por" BIGINT,
    "asignado_a" BIGINT,
    "fecha_reporte" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_resolucion" TIMESTAMPTZ(6),
    "resuelto" BOOLEAN NOT NULL DEFAULT false,
    "solucion" TEXT,
    "impacto_horas" DOUBLE PRECISION,
    "foto_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidencias_taller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_produccion" (
    "id" BIGSERIAL NOT NULL,
    "orden_id" BIGINT NOT NULL,
    "etapa" "EtapaProduccion" NOT NULL,
    "iniciado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completado_en" TIMESTAMPTZ(6),
    "duracion_minutos" INTEGER,
    "usuario_id" BIGINT,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estados_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_cliente" (
    "id" BIGSERIAL NOT NULL,
    "orden_id" BIGINT NOT NULL,
    "cliente_id" BIGINT NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "calidad_producto" INTEGER,
    "tiempo_entrega" INTEGER,
    "atencion_personal" INTEGER,
    "comentarios" TEXT,
    "recomendaria" BOOLEAN,
    "enviado_en" TIMESTAMPTZ(6),
    "respondido_en" TIMESTAMPTZ(6),
    "canal" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_orden" (
    "id" BIGSERIAL NOT NULL,
    "orden_id" BIGINT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "fecha_pago" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprobante_url" TEXT,
    "notas" TEXT,
    "usuario_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_orden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas_anuladas" (
    "id" BIGSERIAL NOT NULL,
    "venta_id" UUID NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha_anulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_devuelto" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ventas_anuladas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asientos_contables" (
    "id" BIGSERIAL NOT NULL,
    "fecha" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoAsiento" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "cuenta" "CuentaContable" NOT NULL,
    "descripcion" TEXT,
    "orden_id" BIGINT,
    "venta_id" UUID,
    "pago_id" BIGINT,
    "usuario_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asientos_contables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_ruc_key" ON "proveedores"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_email_key" ON "proveedores"("email");

-- CreateIndex
CREATE INDEX "idx_proveedores_estado" ON "proveedores"("estado");

-- CreateIndex
CREATE INDEX "idx_proveedores_categoria" ON "proveedores"("categoria_suministro");

-- CreateIndex
CREATE INDEX "idx_proveedores_razon" ON "proveedores"("razon_social");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sistema_clave_key" ON "configuracion_sistema"("clave");

-- CreateIndex
CREATE INDEX "idx_config_categoria" ON "configuracion_sistema"("categoria");

-- CreateIndex
CREATE INDEX "idx_incidencias_orden" ON "incidencias_taller"("orden_id");

-- CreateIndex
CREATE INDEX "idx_incidencias_tipo" ON "incidencias_taller"("tipo");

-- CreateIndex
CREATE INDEX "idx_incidencias_severidad" ON "incidencias_taller"("severidad");

-- CreateIndex
CREATE INDEX "idx_incidencias_resuelto" ON "incidencias_taller"("resuelto");

-- CreateIndex
CREATE INDEX "idx_incidencias_fecha" ON "incidencias_taller"("fecha_reporte" DESC);

-- CreateIndex
CREATE INDEX "idx_estados_prod_orden" ON "estados_produccion"("orden_id");

-- CreateIndex
CREATE INDEX "idx_estados_prod_etapa" ON "estados_produccion"("etapa");

-- CreateIndex
CREATE INDEX "idx_estados_prod_activo" ON "estados_produccion"("activo");

-- CreateIndex
CREATE INDEX "idx_estados_prod_inicio" ON "estados_produccion"("iniciado_en" DESC);

-- CreateIndex
CREATE INDEX "idx_feedback_orden" ON "feedback_cliente"("orden_id");

-- CreateIndex
CREATE INDEX "idx_feedback_cliente" ON "feedback_cliente"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_feedback_puntuacion" ON "feedback_cliente"("puntuacion");

-- CreateIndex
CREATE INDEX "idx_pagos_orden_link" ON "pagos_orden"("orden_id");

-- CreateIndex
CREATE INDEX "idx_pagos_fecha" ON "pagos_orden"("fecha_pago" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ventas_anuladas_venta_id_key" ON "ventas_anuladas"("venta_id");

-- CreateIndex
CREATE INDEX "idx_asientos_fecha" ON "asientos_contables"("fecha" DESC);

-- CreateIndex
CREATE INDEX "idx_asientos_orden" ON "asientos_contables"("orden_id");

-- CreateIndex
CREATE INDEX "idx_asientos_venta" ON "asientos_contables"("venta_id");

-- CreateIndex
CREATE INDEX "idx_asientos_cuenta" ON "asientos_contables"("cuenta");

-- CreateIndex
CREATE INDEX "idx_confecciones_pedido" ON "confecciones"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_confecciones_responsable" ON "confecciones"("responsable_id");

-- CreateIndex
CREATE INDEX "idx_despachos_pedido" ON "despachos"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_insumos_categoria" ON "insumo"("categoria_insumo");

-- CreateIndex
CREATE INDEX "idx_insumos_stock" ON "insumo"("stock_actual");

-- CreateIndex
CREATE INDEX "idx_insumos_proveedor" ON "insumo"("proveedor_id");

-- CreateIndex
CREATE INDEX "idx_movimientos_referencia" ON "movimientos_inventario"("referencia_tipo", "referencia_id");

-- CreateIndex
CREATE INDEX "idx_movimientos_fecha" ON "movimientos_inventario"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "variantes_producto" ADD CONSTRAINT "variantes_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "insumo" ADD CONSTRAINT "insumo_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservas_stock" ADD CONSTRAINT "reservas_stock_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "confecciones" ADD CONSTRAINT "confecciones_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confecciones" ADD CONSTRAINT "confecciones_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias_taller" ADD CONSTRAINT "incidencias_taller_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incidencias_taller" ADD CONSTRAINT "incidencias_taller_confeccion_id_fkey" FOREIGN KEY ("confeccion_id") REFERENCES "confecciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incidencias_taller" ADD CONSTRAINT "incidencias_taller_reportado_por_fkey" FOREIGN KEY ("reportado_por") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incidencias_taller" ADD CONSTRAINT "incidencias_taller_asignado_a_fkey" FOREIGN KEY ("asignado_a") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estados_produccion" ADD CONSTRAINT "estados_produccion_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estados_produccion" ADD CONSTRAINT "estados_produccion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback_cliente" ADD CONSTRAINT "feedback_cliente_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback_cliente" ADD CONSTRAINT "feedback_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos_orden" ADD CONSTRAINT "pagos_orden_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos_orden" ADD CONSTRAINT "pagos_orden_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ventas_anuladas" ADD CONSTRAINT "ventas_anuladas_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "asientos_contables" ADD CONSTRAINT "asientos_contables_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "asientos_contables" ADD CONSTRAINT "asientos_contables_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "asientos_contables" ADD CONSTRAINT "asientos_contables_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos_orden"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

