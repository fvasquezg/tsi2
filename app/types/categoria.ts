import type { CategoriaProducto } from '~/types/categoriaProducto'

export interface Categoria {
  cod_categoria: number
  nom_categoria: string
  
  // Relaciones
  productos?: CategoriaProducto[]
}