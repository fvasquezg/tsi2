const AJUSTES_POR_PAGINA = 20

function parseFecha(value: unknown, nombre: string) {
    if (value === undefined || value === '') return undefined

    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw createError({ statusCode: 400, message: `La fecha ${nombre} no es válida` })
    }

    const fecha = new Date(`${value}T00:00:00.000Z`)
    if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== value) {
        throw createError({ statusCode: 400, message: `La fecha ${nombre} no es válida` })
    }

    return fecha
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const paginaSolicitada = Number(query.pagina ?? 1)
    const busqueda = query.busqueda ?? ''
    const tipo = query.tipo ?? ''
    const fechaDesde = parseFecha(query.fechaDesde, 'desde')
    const fechaHasta = parseFecha(query.fechaHasta, 'hasta')

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

    if (tipo !== '' && tipo !== 'aumento' && tipo !== 'disminucion') {
        throw createError({ statusCode: 400, message: 'El tipo de ajuste no es válido' })
    }

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
        throw createError({ statusCode: 400, message: 'El rango de fechas no es válido' })
    }

    const texto = busqueda.trim()
    const where = {
        ...(texto
            ? {
                OR: [
                    { motivo: { contains: texto } },
                    { producto: { is: { nom_producto: { contains: texto } } } }
                ]
            }
            : {}),
        ...(tipo === 'aumento' ? { cantidad: { gt: 0 } } : {}),
        ...(tipo === 'disminucion' ? { cantidad: { lt: 0 } } : {}),
        ...(fechaDesde || fechaHasta
            ? {
                fecha: {
                    ...(fechaDesde ? { gte: fechaDesde } : {}),
                    ...(fechaHasta ? { lte: fechaHasta } : {})
                }
            }
            : {})
    }

    const total = await prisma.ajusteStock.count({ where })
    const totalPaginas = Math.ceil(total / AJUSTES_POR_PAGINA)
    const pagina = Math.min(paginaSolicitada, Math.max(totalPaginas, 1))
    const ajustes = await prisma.ajusteStock.findMany({
        where,
        include: {
            producto: { select: { nom_producto: true } },
            empleado: { select: { nombres: true, ap_paterno: true } }
        },
        orderBy: [{ fecha: 'desc' }, { cod_ajuste: 'desc' }],
        skip: (pagina - 1) * AJUSTES_POR_PAGINA,
        take: AJUSTES_POR_PAGINA
    })

    return {
        ajustes,
        total,
        pagina,
        porPagina: AJUSTES_POR_PAGINA,
        totalPaginas
    }
})
