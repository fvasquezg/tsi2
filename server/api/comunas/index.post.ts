function esNumeroEntero(value: unknown): value is number | string {
    return (typeof value === 'number' || (typeof value === 'string' && value.trim() !== ''))
        && Number.isSafeInteger(Number(value))
}

export default defineEventHandler(async (event) => {
    await requireUserSession(event)

    const body: unknown = await readBody(event)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw createError({ statusCode: 400, message: 'Los datos de la comuna no son válidos' })
    }

    const datos = body as Record<string, unknown>
    const nom_comuna = typeof datos.nom_comuna === 'string' ? datos.nom_comuna.trim() : ''
    const costo_envio = esNumeroEntero(datos.costo_envio) ? Number(datos.costo_envio) : Number.NaN
    const dia_desde = datos.dia_desde === null
        ? null
        : esNumeroEntero(datos.dia_desde) ? Number(datos.dia_desde) : Number.NaN
    const dia_hasta = datos.dia_hasta === null
        ? null
        : esNumeroEntero(datos.dia_hasta) ? Number(datos.dia_hasta) : Number.NaN

    if (!nom_comuna) {
        throw createError({ statusCode: 400, message: 'Debe ingresar el nombre de la comuna' })
    }
    if (nom_comuna.length > 50) {
        throw createError({ statusCode: 400, message: 'El nombre de la comuna no puede superar los 50 caracteres' })
    }
    if (costo_envio < 0 || costo_envio > 32767 || !Number.isSafeInteger(costo_envio)) {
        throw createError({ statusCode: 400, message: 'El costo de envío debe ser un entero entre 0 y 32767' })
    }

    const todosLosDias = dia_desde === null && dia_hasta === null
    const rangoDiasValido = typeof dia_desde === 'number'
        && typeof dia_hasta === 'number'
        && Number.isSafeInteger(dia_desde)
        && Number.isSafeInteger(dia_hasta)
        && dia_desde >= 1
        && dia_desde <= 7
        && dia_hasta >= 1
        && dia_hasta <= 7

    if (!todosLosDias && !rangoDiasValido) {
        throw createError({
            statusCode: 400,
            message: 'Debe indicar ambos días entre 1 y 7 o dejar ambos vacíos para todos los días'
        })
    }

    try {
        const comuna = await prisma.comunasHabilitadas.create({
            data: {
                nom_comuna,
                costo_envio,
                dia_desde,
                dia_hasta,
                activa: true
            }
        })

        return { ok: true, comuna }
    } catch (err: any) {
        if (err.code === 'P2002') {
            throw createError({ statusCode: 409, message: 'Ya existe una comuna con ese nombre' })
        }
        throw err
    }
})
