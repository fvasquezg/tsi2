// server/api/empleados/[id_empleado]/index.delete.ts
export default defineEventHandler(async (event) => {
    const id_empleado = Number(getRouterParam(event, 'id_empleado'))

    if (!id_empleado) {
        throw createError({ statusCode: 400, message: 'Código de empleado inválido' })
    }

    // revisar si el empleado tiene ajustes de stock registrados antes de borrarlo
    const ajustesAsociados = await prisma.ajusteStock.count({
        where: { id_empleado }
    })

    if (ajustesAsociados > 0) {
        throw createError({
            statusCode: 409,
            message: ajustesAsociados === 1
                ? 'No se puede eliminar esta cuenta porque tiene 1 ajuste de stock registrado. Puede desactivarla en su lugar.'
                : `No se puede eliminar esta cuenta porque tiene ${ajustesAsociados} ajustes de stock registrados. Puede desactivarla en su lugar.`
        })
    }

    try {
        await prisma.empleado.delete({
            where: { id_empleado }
        })
    } catch (err: any) {
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'El empleado no existe' })
        }
        throw err
    }

    return {
        ok: true
    }
})