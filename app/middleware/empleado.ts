export default defineNuxtRouteMiddleware(() => {
    const { user } = useUserSession();

    // si la persona no es empleado o admin no le da acceso
    if (user.value?.tipo_cuenta !== 0 && user.value?.tipo_cuenta !== 1) {
        throw createError({statusCode: 403, message: 'No tienes permiso para acceder a esta página'})
    }
})