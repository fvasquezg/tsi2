export default defineEventHandler(async (event) => {
    // extraer los datos del formulario del producto
    const { nom_producto, desc_producto, stock, stock_critico, precio_unitario, cod_marca, imagen, categorias } = await readBody(event)

    // validar que venga al menos una categoria
    if (!categorias?.length) {
        throw createError({ statusCode: 400, message: 'Debe seleccionar al menos una categoría' })
    }

    // insertar el producto en la base de datos, junto con sus categorias
    const producto = await prisma.producto.create({
        data: {
            nom_producto,
            desc_producto,
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
})