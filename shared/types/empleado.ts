export interface Empleado {
    id_empleado: number
    correo: string
    nombres: string
    ap_paterno: string
    ap_materno: string
    tipo_cuenta: number // 0 = Empleado, 1 = Administrador
    activa: boolean
}

export interface EmpleadosPaginados {
    empleados: Empleado[]
    total: number
    pagina: number
    porPagina: number
    totalPaginas: number
}