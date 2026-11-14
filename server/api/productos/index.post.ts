// server/api/productos/index.post.ts
import fs from 'node:fs'

export default defineEventHandler(async (event) => {
    // extraer los datos del formulario del producto
    const { nom_producto, desc_producto, stock, stock_critico, precio_unitario, cod_marca, nombreArchivo, archivoBase64, categorias } = await readBody(event)

    // validar que venga al menos una categoria
    if (!categorias?.length) {
        throw createError({ statusCode: 400, message: 'Debe seleccionar al menos una categoría' })
    }

    const nom_productoNormalizado = typeof nom_producto === 'string' ? nom_producto.trim() : '';
    const desc_productoNormalizado = typeof desc_producto === 'string' ? desc_producto.trim() : '';

    // convertir a número los campos numéricos (llegan como texto desde el formulario)
    const stockNumero = Number(stock)
    const stockCriticoNumero = Number(stock_critico)
    const precioNumero = Number(precio_unitario)
    const codMarcaNumero = Number(cod_marca)

    // validar que realmente sean números válidos (y que no sean negativos)
    if (
        !Number.isInteger(stockNumero) || stockNumero < 0 ||
        !Number.isInteger(stockCriticoNumero) || stockCriticoNumero < 0 ||
        !Number.isFinite(precioNumero) || precioNumero <= 0
    ) {
        throw createError({ statusCode: 400, message: 'Stock, stock crítico y precio deben ser números válidos y no negativos' })
    }

    //SECCIÓN PARA GUARDAR LA RUTA DE LA IMAGEN
    let ruta = '/img/default.jpg';
    if (archivoBase64) {
        const base64Limpio = archivoBase64.split(';base64,').pop();
        const nombreLimpio = String(nombreArchivo).replace(/[^a-zA-Z0-9.\-]/g, '_');
        const nombreUnico = `${Date.now()}-${nombreLimpio}`;

        // crea la carpeta si no existe y guarda el archivo
        fs.mkdirSync('./public/img/productos', { recursive: true });
        fs.writeFileSync(`./public/img/productos/${nombreUnico}`, base64Limpio, { encoding: 'base64' });
        ruta = `/img/productos/${nombreUnico}`
    }

    try {
        // insertar el producto en la base de datos, junto con sus categorias
        const producto = await prisma.producto.create({
            data: {
                nom_producto: nom_productoNormalizado,
                desc_producto: desc_productoNormalizado,
                stock: stockNumero,
                stock_critico: stockCriticoNumero,
                precio_unitario: precioNumero,
                cod_marca: codMarcaNumero,
                imagen: ruta,
                categorias: {
                    create: categorias.map((cod_categoria: number) => ({ cod_categoria }))
                }
            },
            include: {
                marca: true,
                categorias: { include: { categoria: true } }
            }
        })

        return {
            ok: true,
            producto
        }
    } catch (err: any) {
        // el nombre ya lo tiene otro producto (nom_producto es @unique)
        if (err.code === 'P2002') {
            throw createError({ statusCode: 409, message: 'Ya existe un producto con ese nombre' })
        }
        if (err.code === 'P2003') {
            throw createError({ statusCode: 400, message: 'La marca o alguna categoría indicada no existe' })
        }
        throw err
    }
})