export default defineEventHandler(async (event) => {
    // extraer los datos del formulario de la categoria
    const { nom_categoria } = await readBody(event)

    // insertar la categoria en la base de datos
    const categoria = await prisma.categoria.create({
        data: {
            nom_categoria
        }
    })

    return {
        ok: true,
        categoria
    }
})