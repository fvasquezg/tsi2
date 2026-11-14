export default defineEventHandler(async (event) => {
    const cod_categoria = Number(getRouterParam(event, 'cod_categoria'))

    // si no mandaron un código de categoría válido, se devuelve un error
    if (!cod_categoria) {
        throw createError({ statusCode: 400, message: 'Código de categoría inválido' })
    }

    // extraer los datos del formulario de la categoria
    const { nom_categoria } = await readBody(event)

    const nom_categoriaNormalizado = typeof nom_categoria === 'string' ? nom_categoria.trim() : '';

    // validar que se haya ingresado el nombre
    if (!nom_categoriaNormalizado) {
        throw createError({ statusCode: 400, message: 'Debe ingresar el nombre de la categoría' })
    }

    try {
        // actualizar la categoria en la base de datos
        const categoria = await prisma.categoria.update({
            where: { cod_categoria },
            data: {
                nom_categoria: nom_categoriaNormalizado
            }
        })

        return {
            ok: true,
            categoria
        }
    } catch (err: any) {
        // la categoría que se quiere modificar no existe
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'La categoría no existe' })
        }
        // el nombre ya lo tiene otra categoría (nom_categoria es @unique)
        if (err.code === 'P2002') {
            throw createError({ statusCode: 409, message: 'Ya existe una categoría con ese nombre' })
        }
        throw err
    }
})