-- CreateTable
CREATE TABLE `Marca` (
    `cod_marca` TINYINT NOT NULL AUTO_INCREMENT,
    `nom_marca` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`cod_marca`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producto` (
    `cod_producto` SMALLINT NOT NULL AUTO_INCREMENT,
    `nom_producto` VARCHAR(50) NOT NULL,
    `desc_producto` VARCHAR(255) NOT NULL,
    `stock` SMALLINT NOT NULL,
    `stock_critico` SMALLINT NOT NULL,
    `precio_unitario` INTEGER NOT NULL,
    `cod_marca` TINYINT NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `imagen` VARCHAR(250) NULL,

    PRIMARY KEY (`cod_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `cod_categoria` TINYINT NOT NULL AUTO_INCREMENT,
    `nom_categoria` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`cod_categoria`)
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

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_cod_marca_fkey` FOREIGN KEY (`cod_marca`) REFERENCES `Marca`(`cod_marca`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaProducto` ADD CONSTRAINT `CategoriaProducto_cod_producto_fkey` FOREIGN KEY (`cod_producto`) REFERENCES `Producto`(`cod_producto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaProducto` ADD CONSTRAINT `CategoriaProducto_cod_categoria_fkey` FOREIGN KEY (`cod_categoria`) REFERENCES `Categoria`(`cod_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE;
