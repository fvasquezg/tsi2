//Este archivo indica a la app de que tipo es el objeto que viene dentro de la sesion
import type { Empleado } from "./empleado";

declare module "#auth-utils" {
    interface User extends Empleado { }
}
