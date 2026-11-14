export default defineEventHandler(async (event) => {
    const id_empleado = Number(getRouterParam(event, 'id_empleado'))

    if (!id_empleado) {
        throw createError({ statusCode: 400, message: 'Código de empleado inválido' })
    }

    const { activa } = await readBody(event)

    if (typeof activa !== 'boolean') {
        throw createError({ statusCode: 400, message: 'El estado debe ser verdadero o falso' })
    }

    try {
        const empleado = await prisma.empleado.update({
            where: { id_empleado },
            data: { activa },
            omit: { contrasena: true }
        })

        return {
            ok: true,
            empleado
        }
    } catch (err: any) {
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'El empleado no existe' })
        }
        throw err
    }
})