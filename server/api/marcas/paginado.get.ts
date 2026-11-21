const MARCAS_POR_PAGINA = 20

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const paginaSolicitada = Number(query.pagina ?? 1)
    const busqueda = query.busqueda ?? ''

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

    const texto = busqueda.trim()
    const where = texto ? { nom_marca: { contains: texto } } : {}
    const total = await prisma.marca.count({ where })
    const totalPaginas = Math.ceil(total / MARCAS_POR_PAGINA)
    const pagina = Math.min(paginaSolicitada, Math.max(totalPaginas, 1))
    const marcas = await prisma.marca.findMany({
        where,
        orderBy: { nom_marca: 'asc' },
        skip: (pagina - 1) * MARCAS_POR_PAGINA,
        take: MARCAS_POR_PAGINA
    })

    return {
        marcas,
        total,
        pagina,
        porPagina: MARCAS_POR_PAGINA,
        totalPaginas
    }
})
