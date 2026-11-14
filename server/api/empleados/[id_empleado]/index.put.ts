import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    const id_empleado = Number(getRouterParam(event, 'id_empleado'))

    // si no mandaron un código de empleado válido, se devuelve un error
    if (!id_empleado) {
        throw createError({ statusCode: 400, message: 'Código de empleado inválido' })
    }

    // extraer los datos del formulario del empleado
    const { correo, nombres, ap_paterno, ap_materno, contrasena, tipo_cuenta } = await readBody(event)

    const correoNormalizado = typeof correo === 'string' ? correo.trim() : '';
    const nombresNormalizado = typeof nombres === 'string' ? nombres.trim() : '';
    const apPaternoNormalizado = typeof ap_paterno === 'string' ? ap_paterno.trim() : '';
    const apMaternoNormalizado = typeof ap_materno === 'string' ? ap_materno.trim() : '';
    const tipoCuentaNumero = Number(tipo_cuenta)

    if (!correoNormalizado || !nombresNormalizado || !apPaternoNormalizado || !apMaternoNormalizado) {
        throw createError({ statusCode: 400, message: 'Debe completar todos los campos obligatorios' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNormalizado)) {
        throw createError({ statusCode: 400, message: 'El correo no es válido' })
    }

    if (correoNormalizado.length > 50 || nombresNormalizado.length > 50 || apPaternoNormalizado.length > 30 || apMaternoNormalizado.length > 30) {
        throw createError({ statusCode: 400, message: 'Algún campo supera el largo permitido' })
    }

    if (tipoCuentaNumero !== 0 && tipoCuentaNumero !== 1) {
        throw createError({ statusCode: 400, message: 'El tipo de cuenta no es válido' })
    }

    // la contraseña solo se cambia si escribieron una nueva
    let datosContrasena = {}

    if (contrasena) {
        if (typeof contrasena !== 'string' || contrasena.length < 8) {
            throw createError({ statusCode: 400, message: 'La contraseña debe tener al menos 8 caracteres' })
        }
        datosContrasena = { contrasena: await bcrypt.hash(contrasena, 10) }
    }

    try {
        // actualizar el empleado en la base de datos
        const empleado = await prisma.empleado.update({
            where: { id_empleado },
            data: {
                correo: correoNormalizado,
                nombres: nombresNormalizado,
                ap_paterno: apPaternoNormalizado,
                ap_materno: apMaternoNormalizado,
                tipo_cuenta: tipoCuentaNumero,
                // los 3 puntos son para que la contraseña sea opcional
                ...datosContrasena
            },
            omit: { contrasena: true }
        })

        return {
            ok: true,
            empleado
        }
    } catch (err: any) {
        // el empleado que se quiere modificar no existe
        if (err.code === 'P2025') {
            throw createError({ statusCode: 404, message: 'El empleado no existe' })
        }
        // el correo ya lo tiene otro empleado (correo es @unique)
        if (err.code === 'P2002') {
            throw createError({ statusCode: 409, message: 'Ya existe un empleado con ese correo' })
        }
        throw err
    }
})