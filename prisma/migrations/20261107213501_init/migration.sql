-- CreateTable
CREATE TABLE `Marca` (
    `cod_marca` TINYINT NOT NULL AUTO_INCREMENT,
    `nom_marca` VARCHAR(30) NOT NULL,
    `imagen` VARCHAR(250) NULL,

    UNIQUE INDEX `Marca_nom_marca_key`(`nom_marca`),
    PRIMARY KEY (`cod_marca`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `cod_categoria` TINYINT NOT NULL AUTO_INCREMENT,
    `nom_categoria` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `Categoria_nom_categoria_key`(`nom_categoria`),
    PRIMARY KEY (`cod_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producto` (
    `cod_producto` SMALLINT NOT NULL AUTO_INCREMENT,
    `nom_producto` VARCHAR(50) NOT NULL,
    `desc_producto` VARCHAR(255) NULL,
    `stock` SMALLINT UNSIGNED NOT NULL,
    `stock_critico` SMALLINT UNSIGNED NOT NULL,
    `precio_unitario` INTEGER NOT NULL,
    `cod_marca` TINYINT NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `imagen` VARCHAR(250) NULL,

    UNIQUE INDEX `Producto_nom_producto_key`(`nom_producto`),
    PRIMARY KEY (`cod_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaProducto` (
    `cod_producto` SMALLINT NOT NULL,
    `cod_categoria` TINYINT NOT NULL,

    PRIMARY KEY (`cod_producto`, `cod_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empleado` (
    `id_empleado` TINYINT NOT NULL AUTO_INCREMENT,
    `correo` VARCHAR(50) NOT NULL,
    `nombres` VARCHAR(50) NOT NULL,
    `ap_paterno` VARCHAR(30) NOT NULL,
    `ap_materno` VARCHAR(30) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `tipo_cuenta` TINYINT NOT NULL,

    UNIQUE INDEX `Empleado_correo_key`(`correo`),
    PRIMARY KEY (`id_empleado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ComunasHabilitadas` (
    `cod_comuna` TINYINT NOT NULL AUTO_INCREMENT,
    `nom_comuna` VARCHAR(50) NOT NULL,
    `costo_envio` SMALLINT NOT NULL,
    `dia_desde` TINYINT NULL,
    `dia_hasta` TINYINT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ComunasHabilitadas_nom_comuna_key`(`nom_comuna`),
    PRIMARY KEY (`cod_comuna`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id_cliente` SMALLINT NOT NULL AUTO_INCREMENT,
    `correo` VARCHAR(50) NOT NULL,
    `nombres` VARCHAR(50) NOT NULL,
    `ap_paterno` VARCHAR(30) NOT NULL,
    `ap_materno` VARCHAR(30) NOT NULL,
    `direccion` VARCHAR(100) NOT NULL,
    `cod_comuna` TINYINT NOT NULL,
    `fono` VARCHAR(12) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Cliente_correo_key`(`correo`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cupon` (
    `cod_cupon` SMALLINT NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `porcentaje_descuento` TINYINT NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Cupon_codigo_key`(`codigo`),
    PRIMARY KEY (`cod_cupon`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venta` (
    `cod_venta` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `id_cliente` SMALLINT NOT NULL,
    `total_neto` INTEGER NOT NULL,
    `iva` TINYINT NOT NULL,
    `total` INTEGER NOT NULL,
    `estado` TINYINT NOT NULL,
    `cod_cupon` SMALLINT NULL,
    `metodo_pago` TINYINT NOT NULL,
    `tipo_entrega` TINYINT NOT NULL,

    PRIMARY KEY (`cod_venta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Envio` (
    `cod_venta` INTEGER NOT NULL,
    `direccion_venta` VARCHAR(100) NOT NULL,
    `cod_comuna` TINYINT NOT NULL,
    `costo_envio` SMALLINT NOT NULL,

    PRIMARY KEY (`cod_venta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetalleVenta` (
    `cod_venta` INTEGER NOT NULL,
    `cod_producto` SMALLINT NOT NULL,
    `cantidad` TINYINT UNSIGNED NOT NULL,
    `precio_unitario` INTEGER NOT NULL,
    `subtotal` INTEGER NOT NULL,

    PRIMARY KEY (`cod_venta`, `cod_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AjusteStock` (
    `cod_ajuste` INTEGER NOT NULL AUTO_INCREMENT,
    `cod_producto` SMALLINT NOT NULL,
    `id_empleado` TINYINT NOT NULL,
    `fecha` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `cantidad` SMALLINT NOT NULL,
    `motivo` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`cod_ajuste`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_cod_marca_fkey` FOREIGN KEY (`cod_marca`) REFERENCES `Marca`(`cod_marca`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaProducto` ADD CONSTRAINT `CategoriaProducto_cod_producto_fkey` FOREIGN KEY (`cod_producto`) REFERENCES `Producto`(`cod_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaProducto` ADD CONSTRAINT `CategoriaProducto_cod_categoria_fkey` FOREIGN KEY (`cod_categoria`) REFERENCES `Categoria`(`cod_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_cod_comuna_fkey` FOREIGN KEY (`cod_comuna`) REFERENCES `ComunasHabilitadas`(`cod_comuna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_cod_cupon_fkey` FOREIGN KEY (`cod_cupon`) REFERENCES `Cupon`(`cod_cupon`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Envio` ADD CONSTRAINT `Envio_cod_venta_fkey` FOREIGN KEY (`cod_venta`) REFERENCES `Venta`(`cod_venta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Envio` ADD CONSTRAINT `Envio_cod_comuna_fkey` FOREIGN KEY (`cod_comuna`) REFERENCES `ComunasHabilitadas`(`cod_comuna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetalleVenta` ADD CONSTRAINT `DetalleVenta_cod_venta_fkey` FOREIGN KEY (`cod_venta`) REFERENCES `Venta`(`cod_venta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetalleVenta` ADD CONSTRAINT `DetalleVenta_cod_producto_fkey` FOREIGN KEY (`cod_producto`) REFERENCES `Producto`(`cod_producto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AjusteStock` ADD CONSTRAINT `AjusteStock_cod_producto_fkey` FOREIGN KEY (`cod_producto`) REFERENCES `Producto`(`cod_producto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AjusteStock` ADD CONSTRAINT `AjusteStock_id_empleado_fkey` FOREIGN KEY (`id_empleado`) REFERENCES `Empleado`(`id_empleado`) ON DELETE RESTRICT ON UPDATE CASCADE;
