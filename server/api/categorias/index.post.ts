export default defineEventHandler(async (event) => {
    // extraer los datos del formulario de la categoria
    const { nom_categoria } = await readBody(event)

    const nom_categoriaNormalizado = typeof nom_categoria === 'string' ? nom_categoria.trim(): '';

    // insertar la categoria en la base de datos
    const categoria = await prisma.categoria.create({
        data: {
            nom_categoria: nom_categoriaNormalizado
        }
    })

    return {
        ok: true,
        categoria
    }
})