// server/api/categorias/[cod_categoria]/index.delete.ts
export default defineEventHandler(async (event) => {
    const cod_categoria = Number(getRouterParam(event, 'cod_categoria'))

    if (!cod_categoria) {
        throw createError({ statusCode: 400, message: 'Código de categoría inválido' })
    }

    // revisar cuántos productos tienen esta categoría antes de borrarla
    const productosAsociados = await prisma.categoriaProducto.count({
        where: { cod_categoria }
    })

    if (productosAsociados > 0) {
        throw createError({
            statusCode: 409,
            message: productosAsociados === 1
                ? 'No se puede eliminar esta categoría porque está asignada a 1 producto.'
                : `No se puede eliminar esta categoría porque está asignada a ${productosAsociados} productos.`
        })
    }

    try {
        await prisma.categoria.delete({
            where: { cod_categoria }
        })
    } catch (err: any) {
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'La categoría no existe' })
        }
        throw err
    }

    return {
        ok: true
    }
})