export default defineEventHandler(async (event) => {
    // extraer los datos del formulario de la categoria
    const { nom_categoria } = await readBody(event)

    const nom_categoriaNormalizado = typeof nom_categoria === 'string' ? nom_categoria.trim(): '';

    if (!nom_categoriaNormalizado) {
        throw createError({ statusCode: 400, message: 'Debe ingresar el nombre de la categoría' })
    }

    try {
        const categoria = await prisma.categoria.create({
            data: {
                nom_categoria: nom_categoriaNormalizado
            }
        })

        return {
            ok: true,
            categoria
        }
    } catch (err: any) {
        if (err.code === 'P2002') {
            throw createError({ statusCode: 409, message: 'Ya existe una categoría con ese nombre' })
        }
        throw err
    }
})