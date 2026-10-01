import type { Producto } from '~/types/producto'
import type { Categoria } from '~/types/categoria'

export interface CategoriaProducto {
  cod_producto: number
  cod_categoria: number

  // Relaciones
  producto?: Producto
  categoria?: Categoria
}