export default defineEventHandler(async (event) => {
    await requireUserSession(event)

    const cod_comuna = Number(getRouterParam(event, 'cod_comuna'))
    if (!Number.isSafeInteger(cod_comuna) || cod_comuna < 1) {
        throw createError({ statusCode: 400, message: 'Código de comuna inválido' })
    }

    const { activa } = await readBody(event)
    if (typeof activa !== 'boolean') {
        throw createError({ statusCode: 400, message: 'El estado debe ser verdadero o falso' })
    }

    try {
        const comuna = await prisma.comunasHabilitadas.update({
            where: { cod_comuna },
            data: { activa }
        })
        return { ok: true, comuna }
    } catch (err: any) {
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'La comuna no existe' })
        }
        throw err
    }
})
