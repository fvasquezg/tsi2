// server/api/empleados/index.get.ts
export default defineEventHandler(async () => {
    return await prisma.empleado.findMany({
        omit: { contrasena: true },
        orderBy: { id_empleado: 'asc' }
    })
})