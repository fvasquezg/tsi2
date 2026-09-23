export default defineEventHandler(async () => {
    return await prisma.marca.findMany({
        orderBy: { nom_marca: 'asc' }
    })
})