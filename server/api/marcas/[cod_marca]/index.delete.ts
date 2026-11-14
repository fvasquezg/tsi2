// server/api/marcas/[cod_marca]/index.delete.ts
export default defineEventHandler(async (event) => {
    const cod_marca = Number(getRouterParam(event, 'cod_marca'))

    if (!cod_marca) {
        throw createError({ statusCode: 400, message: 'Código de marca inválido' })
    }

    // revisar cuántos productos tienen esta marca antes de borrarla
    const productosAsociados = await prisma.producto.count({
        where: { cod_marca }
    })

    if (productosAsociados > 0) {
        throw createError({
            statusCode: 409,
            message: productosAsociados === 1
                ? 'No se puede eliminar esta marca porque tiene 1 producto asociado.'
                : `No se puede eliminar esta marca porque tiene ${productosAsociados} productos asociados.`
        })
    }

    try {
        await prisma.marca.delete({
            where: { cod_marca }
        })
    } catch (err: any) {
        // la marca no existe
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'La marca no existe' })
        }
        throw err
    }

    return {
        ok: true
    }
})