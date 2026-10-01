import type { Marca } from '~/types/marca'
import type { CategoriaProducto } from '~/types/categoriaProducto'

export interface Producto{
    cod_producto: number
    nom_producto: string
    desc_producto: string
    stock: number
    stock_critico: number
    precio_unitario: number
    cod_marca: number
    activo: boolean
    imagen: string | null

  // Relaciones
     marca?: Marca
    categorias?: CategoriaProducto[]
}