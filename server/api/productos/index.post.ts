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

    // validar que realmente sean números válidos
    if (
        !Number.isInteger(stockNumero) ||
        !Number.isInteger(stockCriticoNumero) ||
        !Number.isFinite(precioNumero)
    ) {
        throw createError({ statusCode: 400, message: 'Stock, stock crítico y precio deben ser números válidos' })
    }

    //SECCIÓN PARA GUARDAR LA RUTA DE LA IMAGEN
    let ruta = '/img/default.jpg';
    if (archivoBase64) {
        const base64Limpio = archivoBase64.split(';base64,').pop();
        const nombreUnico = `${Date.now()}-${nombreArchivo}`;
        const rutaFisica = `./public/img/${nombreUnico}`;

        fs.writeFileSync(rutaFisica, base64Limpio, { encoding: 'base64' });
        ruta = `/img/${nombreUnico}`
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
        if (err.code === 'P2003') {
            throw createError({ statusCode: 400, message: 'La marca o alguna categoría indicada no existe' })
        }
        throw err
    }
})