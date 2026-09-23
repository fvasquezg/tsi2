export default defineEventHandler(async () => {
    return await prisma.producto.findMany({
        include: {
            marca: true,
            categorias: { include: { categoria: true } }
        },
        orderBy: { cod_producto: 'desc' }
    })
})