// IMPORTANTE: esta línea debe apuntar a TU cliente personalizado (ver nota abajo)
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// El seed corre FUERA de Nuxt, por eso no puede usar el `prisma` que Nuxt importa
// automáticamente desde server/utils. Hay que crear el cliente aquí mismo,
// con el mismo adaptador que usa tu proyecto.
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
    // 1) Limpiar las tablas, de la que depende de otras a la que no depende de nadie
    await prisma.categoriaProducto.deleteMany()
    await prisma.producto.deleteMany()
    await prisma.marca.deleteMany()
    await prisma.categoria.deleteMany()

    // 2) Categorías y marcas (no dependen de nada)
    await prisma.categoria.createMany({
        data: [
            { nom_categoria: 'Perros' },
            { nom_categoria: 'Gatos' },
            { nom_categoria: 'Alimento seco' },
            { nom_categoria: 'Alimento húmedo' },
            { nom_categoria: 'Snacks' },
        ]
    })
    await prisma.marca.createMany({
        data: [
            { nom_marca: 'Alaska' },
            { nom_marca: 'Atacama' },
            { nom_marca: 'Master Cat' },
            { nom_marca: 'Pro Plan' },
            { nom_marca: 'Royal Canin' },
        ]
    })

    // 3) Leer lo recién creado para obtener los códigos reales
    const marcas = await prisma.marca.findMany()
    const categorias = await prisma.categoria.findMany()

    // Funciones pequeñas que buscan el código a partir del nombre
    const marca = (nombre: string) => marcas.find(m => m.nom_marca === nombre)!.cod_marca
    const cat = (nombre: string) => categorias.find(c => c.nom_categoria === nombre)!.cod_categoria

    // 4) Productos, con sus categorías en el mismo create
    const productos = [
        { nom_producto: 'Master Cat Salmón Adultos 20 KG', desc_producto: 'Alimento para gatos adultos con fibras naturales y Omega 3.', stock: 140, stock_critico: 20, precio_unitario: 42990, marca: 'Master Cat', cats: ['Gatos', 'Alimento seco'] },
        { nom_producto: 'Pro Plan Cachorro Pollo 15 KG', desc_producto: 'Alimento completo para cachorros con pollo como primer ingrediente.', stock: 80, stock_critico: 15, precio_unitario: 54990, marca: 'Pro Plan', cats: ['Perros', 'Alimento seco'] },
        { nom_producto: 'Royal Canin Mini Adult 8 KG', desc_producto: 'Alimento para perros adultos de razas pequeñas.', stock: 60, stock_critico: 10, precio_unitario: 49990, marca: 'Royal Canin', cats: ['Perros', 'Alimento seco'] },
        { nom_producto: 'Alaska Snack Dental Perro 500 G', desc_producto: 'Snack para perros que ayuda a la limpieza dental.', stock: 200, stock_critico: 30, precio_unitario: 6990, marca: 'Alaska', cats: ['Perros', 'Snacks'] },
        { nom_producto: 'Atacama Alimento Húmedo Gato 85 G', desc_producto: 'Alimento húmedo en sachet para gatos adultos.', stock: 300, stock_critico: 50, precio_unitario: 1290, marca: 'Atacama', cats: ['Gatos', 'Alimento húmedo'] },
    ]

    for (const p of productos) {
        await prisma.producto.create({
            data: {
                nom_producto: p.nom_producto,
                desc_producto: p.desc_producto,
                stock: p.stock,
                stock_critico: p.stock_critico,
                precio_unitario: p.precio_unitario,
                cod_marca: marca(p.marca),
                imagen: '/img/default.jpg',
                categorias: {
                    create: p.cats.map(nombre => ({ cod_categoria: cat(nombre) }))
                }
            }
        })
    }

    console.log('Seed terminado correctamente')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })