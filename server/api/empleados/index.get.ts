export default defineEventHandler(async () => {
    return await prisma.empleado.findMany({
        orderBy: { correo: 'asc' }
    })
})