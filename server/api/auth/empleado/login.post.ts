import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
    //para el correo y contraseña que se envia en el form
    const { correo, contrasena } = await readBody(event);
    
    //para ver si se escribio el correo y la contraseña
    if (!correo || !contrasena) {
        throw createError({ statusCode: 401, message: 'Credenciales no validas' });
    }

    //buscar el empleado en la base de datos por correo
    const empleado = await prisma.empleado.findUnique({
        where: { correo },
    });

    //si no se encuentra el empleado
    if (!empleado) {
        throw createError({ statusCode: 401, message: 'Credenciales no validas' });
    }

    // revisar password
    // bcrypt.compare(password que se ingreso en el form, password dentro de la bd)
    const contraValida = await bcrypt.compare(contrasena, empleado.contrasena);
    if (!contraValida) {
        throw createError({ statusCode: 401, message: 'Credenciales no validas' })  
    }

    //guardar sesion con nuxt auth utils
    await setUserSession(event, {
        user: { 
            correo: empleado.correo,
            nombres: empleado.nombres,
            ap_paterno: empleado.ap_paterno,
            ap_materno: empleado.ap_materno,
            rol: empleado.tipo_cuenta,
        }
    });
    return { ok: true };
})