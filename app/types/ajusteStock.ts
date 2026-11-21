export interface AjusteStock {
    cod_ajuste: number
    cod_producto: number
    id_empleado: number
    fecha: string
    cantidad: number // positivo suma stock, negativo resta
    motivo: string
    producto: { nom_producto: string }
    empleado: { nombres: string; ap_paterno: string }
}

export interface AjustesStockPaginados {
    ajustes: AjusteStock[]
    total: number
    pagina: number
    porPagina: number
    totalPaginas: number
}