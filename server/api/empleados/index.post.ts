// server/api/empleados/index.post.ts
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    // extraer los datos del formulario del empleado
    const { correo, nombres, ap_paterno, ap_materno, contrasena, tipo_cuenta } = await readBody(event)

    const correoNormalizado = typeof correo === 'string' ? correo.trim() : '';
    const nombresNormalizado = typeof nombres === 'string' ? nombres.trim() : '';
    const apPaternoNormalizado = typeof ap_paterno === 'string' ? ap_paterno.trim() : '';
    const apMaternoNormalizado = typeof ap_materno === 'string' ? ap_materno.trim() : '';
    const tipoCuentaNumero = Number(tipo_cuenta)

    // validar que vengan todos los campos obligatorios
    if (!correoNormalizado || !nombresNormalizado || !apPaternoNormalizado || !apMaternoNormalizado || !contrasena) {
        throw createError({ statusCode: 400, message: 'Debe completar todos los campos obligatorios' })
    }

    // largos máximos según la tabla Empleado
    if (correoNormalizado.length > 50 || nombresNormalizado.length > 50 || apPaternoNormalizado.length > 30 || apMaternoNormalizado.length > 30) {
        throw createError({ statusCode: 400, message: 'Algún campo supera el largo permitido' })
    }

    if (typeof contrasena !== 'string' || contrasena.length < 8) {
        throw createError({ statusCode: 400, message: 'La contraseña debe tener al menos 8 caracteres' })
    }

    // 0 = empleado, 1 = administrador
    if (tipoCuentaNumero !== 0 && tipoCuentaNumero !== 1) {
        throw createError({ statusCode: 400, message: 'El tipo de cuenta no es válido' })
    }

    // encriptar la contraseña antes de guardarla
    const contrasenaHash = await bcrypt.hash(contrasena, 10)

    try {
        // insertar el empleado en la base de datos
        const empleado = await prisma.empleado.create({
            data: {
                correo: correoNormalizado,
                nombres: nombresNormalizado,
                ap_paterno: apPaternoNormalizado,
                ap_materno: apMaternoNormalizado,
                contrasena: contrasenaHash,
                tipo_cuenta: tipoCuentaNumero
            },
            omit: { contrasena: true }
        })

        return {
            ok: true,
            empleado
        }
    } catch (err: any) {
        // el correo ya existe (correo es @unique)
        if (err.code === 'P2002') {
            throw createError({ statusCode: 409, message: 'Ya existe un empleado con ese correo' })
        }
        throw err
    }
})