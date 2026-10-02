-- DropForeignKey
ALTER TABLE `categoriaproducto` DROP FOREIGN KEY `CategoriaProducto_cod_producto_fkey`;

-- AddForeignKey
ALTER TABLE `CategoriaProducto` ADD CONSTRAINT `CategoriaProducto_cod_producto_fkey` FOREIGN KEY (`cod_producto`) REFERENCES `Producto`(`cod_producto`) ON DELETE CASCADE ON UPDATE CASCADE;
