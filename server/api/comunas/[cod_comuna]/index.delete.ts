export default defineEventHandler(async (event) => {
    await requireUserSession(event)

    const cod_comuna = Number(getRouterParam(event, 'cod_comuna'))
    if (!Number.isSafeInteger(cod_comuna) || cod_comuna < 1) {
        throw createError({ statusCode: 400, message: 'Código de comuna inválido' })
    }

    const [clientes, envios] = await Promise.all([
        prisma.cliente.count({ where: { cod_comuna } }),
        prisma.envio.count({ where: { cod_comuna } })
    ])

    if (clientes > 0 || envios > 0) {
        throw createError({
            statusCode: 409,
            message: `No se puede eliminar esta comuna: está asociada a ${clientes} cliente(s) y ${envios} envío(s). Puede desactivarla en su lugar.`
        })
    }

    try {
        await prisma.comunasHabilitadas.delete({
            where: { cod_comuna }
        })
    } catch (err: any) {
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'La comuna no existe' })
        }
        if (err.code === 'P2003') {
            throw createError({
                statusCode: 409,
                message: 'No se puede eliminar la comuna porque tiene registros asociados. Puede desactivarla en su lugar.'
            })
        }
        throw err
    }

    return { ok: true }
})
