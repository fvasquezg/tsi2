import fs from 'node:fs'

export default defineEventHandler(async (event) => {
    // extraer los datos del formulario de la marca
    const { nom_marca, nombreArchivo, archivoBase64 } = await readBody(event)

    const nom_marcaNormalizado = typeof nom_marca === 'string' ? nom_marca.trim() : '';

    // validar que se haya ingresado el nombre
    if (!nom_marcaNormalizado) {
        throw createError({ statusCode: 400, message: 'Debe ingresar el nombre de la marca' })
    }

    //SECCIÓN PARA GUARDAR LA RUTA DE LA IMAGEN (opcional, si no suben imagen queda null)
    let ruta: string | null = null;

    if (archivoBase64) {
        const base64Limpio = archivoBase64.split(';base64,').pop();
        const nombreLimpio = String(nombreArchivo).replace(/[^a-zA-Z0-9.\-]/g, '_');
        const nombreUnico = `${Date.now()}-${nombreLimpio}`;

        // crea la carpeta si no existe y guarda el archivo
        fs.mkdirSync('./public/img/marcas', { recursive: true });
        fs.writeFileSync(`./public/img/marcas/${nombreUnico}`, base64Limpio, { encoding: 'base64' });
        ruta = `/img/marcas/${nombreUnico}`
    }

    try {
        // insertar la marca en la base de datos
        const marca = await prisma.marca.create({
            data: {
                nom_marca: nom_marcaNormalizado,
                imagen: ruta
            }
        })

        return {
            ok: true,
            marca
        }
    } catch (err: any) {
        // el nombre de la marca ya existe (nom_marca es @unique)
        if (err.code === 'P2002') {
            throw createError({ statusCode: 409, message: 'Ya existe una marca con ese nombre' })
        }
        throw err
    }
})