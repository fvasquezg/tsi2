import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// Mismo cliente que usas en seed.ts (el seed corre fuera de Nuxt)
const url = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

async function main() {
    const empleados = [
        {
            correo: 'admin@petfood.cl',
            nombres: 'Víctor Alfonso',
            ap_paterno: 'Maulen',
            ap_materno: 'Pávez',
            contrasena: 'Admin1234',
            tipo_cuenta: 1,
        },
        {
            correo: 'vendedor@petfood.cl',
            nombres: 'Camila Andrea',
            ap_paterno: 'Rojas',
            ap_materno: 'Soto',
            contrasena: 'Vendedor1234',
            tipo_cuenta: 2,
        },
        {
            correo: 'bodega@petfood.cl',
            nombres: 'Diego Ignacio',
            ap_paterno: 'Fuentes',
            ap_materno: 'Lagos',
            contrasena: 'Bodega1234',
            tipo_cuenta: 2,
        },
    ]

    // 1) Primero hashear TODAS las contraseñas (esto es lo lento)
    const empleadosConHash = []
    for (const e of empleados) {
        empleadosConHash.push({
            ...e,
            contrasena: await bcrypt.hash(e.contrasena, 12),
        })
    }

    // 2) Recién ahora hablar con la base de datos, todo seguido
    for (const e of empleadosConHash) {
        await prisma.empleado.upsert({
            where: { correo: e.correo },
            update: {},
            create: {
                correo: e.correo,
                nombres: e.nombres,
                ap_paterno: e.ap_paterno,
                ap_materno: e.ap_materno,
                contrasena: e.contrasena,
                tipo_cuenta: e.tipo_cuenta,
            },
        })
    }

    console.log('Empleados creados correctamente')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })