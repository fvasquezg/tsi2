export default defineEventHandler(async () => {
    return await prisma.categoria.findMany({
        orderBy: { nom_categoria: 'asc' }
    })
})