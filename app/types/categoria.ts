import type { CategoriaProducto } from '~/types/categoriaProducto'

export interface Categoria {
  cod_categoria: number
  nom_categoria: string
  
  // Relaciones
  productos?: CategoriaProducto[]
}

export interface CategoriasPaginadas {
  categorias: Categoria[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}