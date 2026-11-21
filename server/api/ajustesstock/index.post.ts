export default defineEventHandler(async (event) => {
    // el empleado que hace el ajuste sale de la sesión, no del formulario
    const { user } = await requireUserSession(event)

    // extraer los datos del formulario del ajuste
    const { cod_producto, tipo, cantidad, motivo } = await readBody(event)

    const codProductoNumero = Number(cod_producto)
    const cantidadNumero = Number(cantidad)
    const motivoNormalizado = typeof motivo === 'string' ? motivo.trim() : '';

    // validar los datos obligatorios
    if (!codProductoNumero || !motivoNormalizado) {
        throw createError({ statusCode: 400, message: 'Debe completar todos los campos obligatorios' })
    }

    // validar si en la pagina se ingresa algo que no sea aumento o disminucion (tipo seguridad)
    if (tipo !== 'aumento' && tipo !== 'disminucion') {
        throw createError({ statusCode: 400, message: 'El tipo de ajuste no es válido' })
    }

    // la cantidad siempre llega positiva; el tipo define si suma o resta
    if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
        throw createError({ statusCode: 400, message: 'La cantidad debe ser un número entero mayor a 0' })
    }

    // aumento = positivo, disminución = negativo
    const cantidadConSigno = tipo === 'aumento' ? cantidadNumero : -cantidadNumero

    // todo en una transacción: si algo falla, no queda el stock modificado a medias
    const ajuste = await prisma.$transaction(async (tx) => {
        const producto = await tx.producto.findUnique({
            where: { cod_producto: codProductoNumero }
        })

        if (!producto) {
            throw createError({ statusCode: 404, message: 'El producto no existe' })
        }

        // el stock no puede quedar negativo
        if (producto.stock + cantidadConSigno < 0) {
            throw createError({
                statusCode: 400,
                message: `Stock insuficiente: el producto tiene ${producto.stock} unidades y se intenta restar ${cantidadNumero}.`
            })
        }

        // actualizar el stock del producto
        await tx.producto.update({
            where: { cod_producto: codProductoNumero },
            data: { stock: { increment: cantidadConSigno } }
        })

        // guardar el ajuste en el historial
        return await tx.ajusteStock.create({
            data: {
                cod_producto: codProductoNumero,
                id_empleado: user.id_empleado,
                cantidad: cantidadConSigno,
                motivo: motivoNormalizado
            },
            include: {
                producto: { select: { nom_producto: true } },
                empleado: { select: { nombres: true, ap_paterno: true } }
            }
        })
    })

    return {
        ok: true,
        ajuste
    }
})