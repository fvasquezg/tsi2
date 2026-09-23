export default defineEventHandler(async (event) => {
    // extraer los datos del formulario de la marca
    const { nom_marca } = await readBody(event)

    // insertar la marca en la base de datos
    const marca = await prisma.marca.create({
        data: {
            nom_marca
        }
    })

    return {
        ok: true,
        marca
    }
})