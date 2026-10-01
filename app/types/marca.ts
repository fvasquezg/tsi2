import type { Producto } from '~/types/producto'

export interface Marca {
  cod_marca: number
  nom_marca: string
  
  // Relaciones. ? porque puede ser opcinonal. relacion uno es a muchos
  productos?: Producto[]
}