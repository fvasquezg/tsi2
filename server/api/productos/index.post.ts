export default defineEventHandler(async (event) => {
    // extraer los datos del formulario del producto
    const { nom_producto, desc_producto, stock, stock_critico, precio_unitario, cod_marca, imagen, categorias } = await readBody(event)

    // validar que venga al menos una categoria
    if (!categorias?.length) {
        throw createError({ statusCode: 400, message: 'Debe seleccionar al menos una categoría' })
    }

    const nom_productoNormalizado = typeof nom_producto === 'string' ? nom_producto.trim() : '';
    const desc_productoNormalizado = typeof desc_producto === 'string' ? desc_producto.trim() : '';

    try {
        // insertar el producto en la base de datos, junto con sus categorias
        const producto = await prisma.producto.create({
            data: {
                nom_producto: nom_productoNormalizado,
                desc_producto: desc_productoNormalizado,
                stock,
                stock_critico,
                precio_unitario,
                cod_marca,
                imagen,
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