import bcrypt from "bcryptjs"
export default defineEventHandler(async (event) => {
    // extraer los datos del formulario de creacion de cuenta
    const { correo, contrasena, nombres, ap_paterno, ap_materno, tipo_cuenta } = await readBody(event)
    
    // pasar la contraseña a hash
    const hash = await bcrypt.hash(contrasena, 12)

    // insertar el empleado en la bd
    const empleado = await prisma.empleado.create({
        data: {
            correo,
            contrasena: hash,
            nombres,
            ap_paterno,
            ap_materno,
            tipo_cuenta
        }
    })

    return {
        ok: true,
        empleado
    }
})