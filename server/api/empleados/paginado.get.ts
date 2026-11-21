const EMPLEADOS_POR_PAGINA = 20

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const paginaSolicitada = Number(query.pagina ?? 1)
    const busqueda = query.busqueda ?? ''
    const tipoCuentaRaw = query.tipo_cuenta
    const tipoCuenta = tipoCuentaRaw === undefined || tipoCuentaRaw === ''
        ? null
        : Number(tipoCuentaRaw)

    if (
        typeof query.pagina === 'object'
        || !Number.isSafeInteger(paginaSolicitada)
        || paginaSolicitada < 1
    ) {
        throw createError({ statusCode: 400, message: 'El número de página no es válido' })
    }

    if (typeof busqueda !== 'string') {
        throw createError({ statusCode: 400, message: 'El texto de búsqueda no es válido' })
    }

    if (
        typeof tipoCuentaRaw === 'object'
        || (tipoCuenta !== null && (!Number.isSafeInteger(tipoCuenta) || (tipoCuenta !== 0 && tipoCuenta !== 1)))
    ) {
        throw createError({ statusCode: 400, message: 'El tipo de cuenta no es válido' })
    }

    const terminos = busqueda.trim().split(/\s+/).filter(Boolean)
    const where = {
        ...(terminos.length
            ? {
                AND: terminos.map(termino => ({
                    OR: [
                        { nombres: { contains: termino } },
                        { ap_paterno: { contains: termino } },
                        { ap_materno: { contains: termino } },
                        { correo: { contains: termino } }
                    ]
                }))
            }
            : {}),
        ...(tipoCuenta !== null ? { tipo_cuenta: tipoCuenta } : {})
    }

    const total = await prisma.empleado.count({ where })
    const totalPaginas = Math.ceil(total / EMPLEADOS_POR_PAGINA)
    const pagina = Math.min(paginaSolicitada, Math.max(totalPaginas, 1))
    const empleados = await prisma.empleado.findMany({
        where,
        omit: { contrasena: true },
        orderBy: { id_empleado: 'asc' },
        skip: (pagina - 1) * EMPLEADOS_POR_PAGINA,
        take: EMPLEADOS_POR_PAGINA
    })

    return {
        empleados,
        total,
        pagina,
        porPagina: EMPLEADOS_POR_PAGINA,
        totalPaginas
    }
})
