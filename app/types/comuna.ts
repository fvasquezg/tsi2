export interface Comuna {
    cod_comuna: number
    nom_comuna: string
    costo_envio: number
    dia_desde: number | null
    dia_hasta: number | null
    activa: boolean
}
