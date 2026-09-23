export default defineEventHandler(async (event) => {
    const cod_producto = Number(
        getRouterParam(event, 'cod_producto')
    );

    // para borrar el producto en si
    await prisma.producto.delete({
        where: { cod_producto }
    })

    return {
        ok: true
    }
})