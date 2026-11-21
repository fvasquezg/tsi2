export default defineEventHandler(async () => {
    return await prisma.comunasHabilitadas.findMany({
        orderBy: { nom_comuna: 'asc' }
    })
})
