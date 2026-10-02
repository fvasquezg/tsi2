// Este endpoint es para cambiar unicamente el estado del producto de activo a no activo o visceversa

export default defineEventHandler(async (event) => {
    const cod_producto = Number(getRouterParam(event, 'cod_producto'))

    if (!cod_producto) {
        throw createError({ statusCode: 400, message: 'Código de producto inválido' })
    }

    const { activo } = await readBody(event)

    if (typeof activo !== 'boolean') {
        throw createError({ statusCode: 400, message: 'El estado debe ser verdadero o falso' })
    }

    try {
        const producto = await prisma.producto.update({
            where: { cod_producto },
            data: { activo },
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
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'El producto no existe' })
        }
        throw err
    }
})