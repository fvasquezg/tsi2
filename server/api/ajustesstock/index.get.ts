export default defineEventHandler(async () => {
    return await prisma.ajusteStock.findMany({
        include: {
            producto: { select: { nom_producto: true } },
            empleado: { select: { nombres: true, ap_paterno: true } }
        },
        orderBy: { cod_ajuste: 'desc' }
    })
})