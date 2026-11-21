const PRODUCTOS_POR_PAGINA = 20

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const paginaSolicitada = Number(query.pagina ?? 1)
    const codMarca = Number(query.cod_marca ?? 0)
    const codCategoria = query.cod_categoria === undefined || query.cod_categoria === ''
        ? null
        : Number(query.cod_categoria)
    const busqueda = query.busqueda ?? ''

    if (
        typeof query.pagina === 'object'
        || !Number.isSafeInteger(paginaSolicitada)
        || paginaSolicitada < 1
    ) {
        throw createError({ statusCode: 400, message: 'El número de página no es válido' })
    }

    if (
        typeof query.cod_marca === 'object'
        || !Number.isSafeInteger(codMarca)
        || codMarca < 0
    ) {
        throw createError({ statusCode: 400, message: 'La marca seleccionada no es válida' })
    }

    if (
        typeof query.cod_categoria === 'object'
        || (codCategoria !== null && (!Number.isSafeInteger(codCategoria) || codCategoria < 1))
    ) {
        throw createError({ statusCode: 400, message: 'La categoría seleccionada no es válida' })
    }

    if (typeof busqueda !== 'string') {
        throw createError({ statusCode: 400, message: 'El texto de búsqueda no es válido' })
    }

    const where = {
        ...(busqueda.trim()
            ? {
                OR: [
                    { nom_producto: { contains: busqueda.trim() } },
                    { desc_producto: { contains: busqueda.trim() } }
                ]
            }
            : {}),
        ...(codMarca > 0 ? { cod_marca: codMarca } : {}),
        ...(codCategoria !== null
            ? { categorias: { some: { cod_categoria: codCategoria } } }
            : {})
    }

    const total = await prisma.producto.count({ where })
    const totalPaginas = Math.ceil(total / PRODUCTOS_POR_PAGINA)
    const pagina = Math.min(paginaSolicitada, Math.max(totalPaginas, 1))
    const productos = await prisma.producto.findMany({
        where,
        include: {
            marca: true,
            categorias: { include: { categoria: true } }
        },
        orderBy: { cod_producto: 'desc' },
        skip: (pagina - 1) * PRODUCTOS_POR_PAGINA,
        take: PRODUCTOS_POR_PAGINA
    })

    return {
        productos,
        total,
        pagina,
        porPagina: PRODUCTOS_POR_PAGINA,
        totalPaginas
    }
})