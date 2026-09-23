export default defineEventHandler(async (event) => {
    // extraer los datos del formulario de la marca
    const { nom_marca } = await readBody(event)

    const nom_marcaNormalizado = typeof nom_marca === 'string' ? nom_marca.trim(): '';

    // insertar la marca en la base de datos
    const marca = await prisma.marca.create({
        data: {
            nom_marca: nom_marcaNormalizado
        }
    })

    return {
        ok: true,
        marca
    }
})