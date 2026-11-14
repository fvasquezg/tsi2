import fs from 'node:fs'

export default defineEventHandler(async (event) => {
    const cod_marca = Number(getRouterParam(event, 'cod_marca'))

    // si no mandaron un código de marca válido, se devuelve un error
    if (!cod_marca) {
        throw createError({ statusCode: 400, message: 'Código de marca inválido' })
    }

    // extraer los datos del formulario de la marca
    const { nom_marca, nombreArchivo, archivoBase64 } = await readBody(event)

    const nom_marcaNormalizado = typeof nom_marca === 'string' ? nom_marca.trim() : '';

    // validar que se haya ingresado el nombre
    if (!nom_marcaNormalizado) {
        throw createError({ statusCode: 400, message: 'Debe ingresar el nombre de la marca' })
    }

    // si mandaron una imagen nueva, se guarda y se reemplaza la ruta
    // si no, se deja la imagen que la marca ya tenía
    let datosImagen = {}

    if (archivoBase64) {
        const base64Limpio = archivoBase64.split(';base64,').pop();
        const nombreLimpio = String(nombreArchivo).replace(/[^a-zA-Z0-9.\-]/g, '_');
        const nombreUnico = `${Date.now()}-${nombreLimpio}`;

        // crea la carpeta si no existe y guarda el archivo
        fs.mkdirSync('./public/img/marcas', { recursive: true });
        fs.writeFileSync(`./public/img/marcas/${nombreUnico}`, base64Limpio, { encoding: 'base64' });
        datosImagen = { imagen: `/img/marcas/${nombreUnico}` }
    }

    try {
        // actualizar la marca en la base de datos
        const marca = await prisma.marca.update({
            where: { cod_marca },
            data: {
                nom_marca: nom_marcaNormalizado,
                // los 3 puntos son para que la imagen sea opcional
                ...datosImagen
            }
        })

        return {
            ok: true,
            marca
        }
    } catch (err: any) {
        // la marca que se quiere modificar no existe
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'La marca no existe' })
        }
        // el nombre ya lo tiene otra marca (nom_marca es @unique)
        if (err.code === 'P2002') {
            throw createError({ statusCode: 409, message: 'Ya existe una marca con ese nombre' })
        }
        throw err
    }
})