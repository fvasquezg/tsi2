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

    for (const e of empleados) {
        // La contraseña se guarda hasheada con 12 saltos, igual que en tu login
        const hash = await bcrypt.hash(e.contrasena, 12)

        await prisma.empleado.upsert({
            where: { correo: e.correo },
            update: {},
            create: {
                correo: e.correo,
                nombres: e.nombres,
                ap_paterno: e.ap_paterno,
                ap_materno: e.ap_materno,
                contrasena: hash,
                tipo_cuenta: e.tipo_cuenta,
                // activa no se escribe: usa su valor por defecto (true)
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