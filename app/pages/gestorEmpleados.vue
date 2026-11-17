<!-- pages/addEmpleados.vue -->
<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Empleado } from '#shared/types/empleado'
import { z } from 'zod';

// Para solo darle acceso al administrador a esta pagina
definePageMeta({
    middleware: ['admin']
})

// para saber quién tiene la sesión iniciada (no puede borrarse ni desactivarse a sí mismo)
const { user } = useUserSession()

function esCuentaPropia(empleado: Empleado) {
    return empleado.id_empleado === user.value?.id_empleado
}

// opciones del selector de tipo de cuenta
const opcionesTipoCuenta = [
    { value: 0, label: 'Empleado' },
    { value: 1, label: 'Administrador' },
]

// validaciones zod: campos comunes a agregar y editar
const camposComunes = {
    nombres: z.string().trim().min(2, 'Debe ingresar los nombres').max(50, 'Máximo 50 caracteres'),
    ap_paterno: z.string().trim().min(2, 'Debe ingresar el apellido paterno').max(30, 'Máximo 30 caracteres'),
    ap_materno: z.string().trim().min(2, 'Debe ingresar el apellido materno').max(30, 'Máximo 30 caracteres'),
    correo: z.email({ message: 'Debe ingresar un correo válido.' }).max(50, 'Máximo 50 caracteres'),
    tipo_cuenta: z.number({ message: 'Debe seleccionar un tipo de cuenta' }),
}

// al agregar, la contraseña es obligatoria
const validarCrearEmpleado = z.object({
    ...camposComunes,
    contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

// al editar, la contraseña es opcional (vacía = se mantiene la actual)
const validarEditarEmpleado = z.object({
    ...camposComunes,
    contrasena: z.string().refine(v => v === '' || v.length >= 8, 'Debe tener al menos 8 caracteres, o dejarse vacía'),
})

// para tomar la informacion de los empleados
const { data: empleados, pending: cargandoEmpleados, error: errorEmpleados, refresh } = await useFetch<Empleado[]>('/api/empleados')

// colores de los campos del formulario
const colorTextoFormulario = 'text-texto-formulario';
const colorFondoCamposFormulario = 'bg-fondo-general/90 text-texto-formulario';

// estilo del selector de tipo de cuenta
const estiloSelector = {
    base: colorFondoCamposFormulario + ' hover:bg-fondo-general hover:ring-boton transition-colors',
    content: 'bg-fondo-card border border-fondo-login',
    item: 'text-texto data-highlighted:before:bg-boton/30'
}

// ------------------------------------------------------------
// AGREGAR EMPLEADO
// ------------------------------------------------------------
const mostrarFormularioAgregar = ref(false);
const errorFormularioAgregar = ref('');
const guardandoNuevoEmpleado = ref(false);

const formularioNuevoEmpleado = reactive({
    nombres: '',
    ap_paterno: '',
    ap_materno: '',
    correo: '',
    contrasena: '',
    tipo_cuenta: 0 as number | undefined, // por defecto Empleado (el rol con menos permisos)
})

//función para reiniciar el formularioAgregar
function reiniciarFormularioAgregar() {
    formularioNuevoEmpleado.nombres = '';
    formularioNuevoEmpleado.ap_paterno = '';
    formularioNuevoEmpleado.ap_materno = '';
    formularioNuevoEmpleado.correo = '';
    formularioNuevoEmpleado.contrasena = '';
    formularioNuevoEmpleado.tipo_cuenta = 0;
    errorFormularioAgregar.value = '';
}

//función para cerrar el formularioAgregar
function cerrarFormularioAgregar() {
    mostrarFormularioAgregar.value = false;
    reiniciarFormularioAgregar();
}

//función async para guardar nuevo empleado
async function guardarEmpleado() {
    guardandoNuevoEmpleado.value = true;
    errorFormularioAgregar.value = '';

    try {
        await $fetch('/api/empleados', {
            method: 'POST',
            body: {
                nombres: formularioNuevoEmpleado.nombres,
                ap_paterno: formularioNuevoEmpleado.ap_paterno,
                ap_materno: formularioNuevoEmpleado.ap_materno,
                correo: formularioNuevoEmpleado.correo,
                contrasena: formularioNuevoEmpleado.contrasena,
                tipo_cuenta: formularioNuevoEmpleado.tipo_cuenta,
            }
        });
        cerrarFormularioAgregar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Agregado correctamente',
            description: 'La cuenta ha sido agregada correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorFormularioAgregar.value = getApiErrorMessage(err, 'No se pudo agregar la cuenta.');
    }
    finally {
        guardandoNuevoEmpleado.value = false;
    }
}

// ------------------------------------------------------------
// EDITAR EMPLEADO
// ------------------------------------------------------------
const mostrarFormularioEditar = ref(false);
const errorFormularioEditar = ref('');
const guardandoEmpleadoEditado = ref(false);
const empleadoEditando = ref<Empleado | null>(null);

const formularioEditarEmpleado = reactive({
    nombres: '',
    ap_paterno: '',
    ap_materno: '',
    correo: '',
    contrasena: '',
    tipo_cuenta: undefined as number | undefined,
})

// abre el formulario con los datos del empleado ya cargados
function abrirFormularioEditar(empleado: Empleado) {
    empleadoEditando.value = empleado;
    formularioEditarEmpleado.nombres = empleado.nombres;
    formularioEditarEmpleado.ap_paterno = empleado.ap_paterno;
    formularioEditarEmpleado.ap_materno = empleado.ap_materno;
    formularioEditarEmpleado.correo = empleado.correo;
    formularioEditarEmpleado.contrasena = '';
    formularioEditarEmpleado.tipo_cuenta = empleado.tipo_cuenta;

    errorFormularioEditar.value = '';
    mostrarFormularioEditar.value = true;
}

//función para reiniciar el formularioEditar
function reiniciarFormularioEditar() {
    formularioEditarEmpleado.nombres = '';
    formularioEditarEmpleado.ap_paterno = '';
    formularioEditarEmpleado.ap_materno = '';
    formularioEditarEmpleado.correo = '';
    formularioEditarEmpleado.contrasena = '';
    formularioEditarEmpleado.tipo_cuenta = undefined;
    errorFormularioEditar.value = '';
    empleadoEditando.value = null;
}

//función para cerrar el formularioEditar
function cerrarFormularioEditar() {
    mostrarFormularioEditar.value = false;
    reiniciarFormularioEditar();
}

//función async para guardar la edición del empleado
async function guardarEdicionEmpleado() {
    if (!empleadoEditando.value) return;

    guardandoEmpleadoEditado.value = true;
    errorFormularioEditar.value = '';

    try {
        await $fetch(`/api/empleados/${empleadoEditando.value.id_empleado}`, {
            method: 'PUT',
            body: {
                nombres: formularioEditarEmpleado.nombres,
                ap_paterno: formularioEditarEmpleado.ap_paterno,
                ap_materno: formularioEditarEmpleado.ap_materno,
                correo: formularioEditarEmpleado.correo,
                contrasena: formularioEditarEmpleado.contrasena,
                tipo_cuenta: formularioEditarEmpleado.tipo_cuenta,
            }
        });
        cerrarFormularioEditar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Actualizado correctamente',
            description: 'La cuenta ha sido actualizada correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorFormularioEditar.value = getApiErrorMessage(err, 'No se pudo actualizar la cuenta.');
    }
    finally {
        guardandoEmpleadoEditado.value = false;
    }
}

// ------------------------------------------------------------
// ACTIVAR O DESACTIVAR CUENTA
// ------------------------------------------------------------
// para controlar el estado de guardado mientras se cambia el switch de una fila
const cambiandoEstado = ref<number | null>(null);

//función async para activar o desactivar una cuenta
async function cambiarEstadoEmpleado(empleado: Empleado, nuevoEstado: boolean) {
    cambiandoEstado.value = empleado.id_empleado;

    try {
        await $fetch(`/api/empleados/${empleado.id_empleado}/activo`, {
            method: 'PATCH',
            body: { activa: nuevoEstado }
        });
        await refresh();

        useToast().add({
            duration: 3000,
            title: nuevoEstado ? 'Cuenta activada' : 'Cuenta desactivada',
            description: `La cuenta de ${empleado.nombres} ${empleado.ap_paterno} se ${nuevoEstado ? 'activó' : 'desactivó'}.`,
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        useToast().add({
            duration: 3000,
            color: 'error',
            title: 'No se pudo cambiar el estado',
            description: getApiErrorMessage(err, 'Ocurrió un error al actualizar el estado.'),
        })
    }
    finally {
        cambiandoEstado.value = null;
    }
}

// ------------------------------------------------------------
// BORRAR EMPLEADO
// ------------------------------------------------------------
const empleadoBorrar = ref<Empleado | null>(null);
const mostrarConfirmacionBorrar = ref(false);
const borrandoEmpleado = ref(false);
const errorBorrar = ref('');

//para confirmar la eliminación de la cuenta
function confirmarBorrarEmpleado(empleado: Empleado) {
    empleadoBorrar.value = empleado;
    errorBorrar.value = '';
    mostrarConfirmacionBorrar.value = true;
}

//para cerrar confirmación
function cerrarConfirmacionBorrar() {
    mostrarConfirmacionBorrar.value = false;
    empleadoBorrar.value = null;
}

//función async para borrar empleado
async function borrarEmpleado() {
    borrandoEmpleado.value = true;
    const nombreEmpleadoBorrar = `${empleadoBorrar.value?.nombres} ${empleadoBorrar.value?.ap_paterno}`;
    try {
        await $fetch(`/api/empleados/${empleadoBorrar.value?.id_empleado}`, {
            method: 'DELETE'
        })
        cerrarConfirmacionBorrar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Eliminado correctamente',
            description: `Se eliminó correctamente la cuenta de ${nombreEmpleadoBorrar}.`,
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorBorrar.value = getApiErrorMessage(err, 'No se pudo borrar la cuenta.');
    }
    finally {
        borrandoEmpleado.value = false;
    }
}

// ------------------------------------------------------------
// FILTROS PARA CONSULTAS
// ------------------------------------------------------------
const busqueda = ref('')
const tipoSeleccionado = ref<number | null>(null) // null = todos

// empleados que se muestran: filtrados por texto (nombre o correo) y por tipo de cuenta
const empleadosFiltrados = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()
    return (empleados.value ?? []).filter((e) => {
        const coincideTexto = !texto
            || `${e.nombres} ${e.ap_paterno} ${e.ap_materno}`.toLowerCase().includes(texto)
            || e.correo.toLowerCase().includes(texto)
        const coincideTipo = tipoSeleccionado.value === null
            || e.tipo_cuenta === tipoSeleccionado.value
        return coincideTexto && coincideTipo
    })
})

function limpiarFiltros() {
    busqueda.value = ''
    tipoSeleccionado.value = null
}

// ------------------------------------------------------------
// PARA LA TABLA
// ------------------------------------------------------------
const columns: TableColumn<Empleado>[] = [
    { accessorKey: 'id_empleado', header: 'Código', meta: { class: { th: 'text-center', td: 'text-center' } } },
    {
        id: 'nombre_completo',
        header: 'Nombre',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => `${row.original.nombres} ${row.original.ap_paterno} ${row.original.ap_materno}`
    },
    { accessorKey: 'correo', header: 'Correo', meta: { class: { th: 'text-center', td: 'text-center' } } },
    {
        id: 'tipo',
        header: 'Tipo de cuenta',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => row.original.tipo_cuenta === 1 ? 'Administrador' : 'Empleado'
    },
    // columnas extras
    { id: 'activa', header: 'Estado', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { id: 'editar', header: 'Editar', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { id: 'eliminar', header: 'Eliminar', meta: { class: { th: 'text-center', td: 'text-center' } } },
]

const tableMeta = createTableMeta<Empleado>()
</script>

<template>
    <div class="space-y-8">
        <!-- título página + botón agregar -->
        <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
                    STAFF
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-7 text-texto/70">
                    Gestor de cuentas de empleados y administradores.
                </p>
            </div>

            <UButton @click="mostrarFormularioAgregar = true"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Agregar cuenta
            </UButton>
        </section>

        <!-- Buscador -->
        <UInput v-model="busqueda" icon="i-lucide-search" class="w-full" placeholder="Buscar por nombre o correo..."
            :ui="{ base: 'bg-fondo-general/90 text-texto-formulario focus-visible:ring-boton' }" />

        <!-- Botones de tipo de cuenta -->
        <div class="flex flex-wrap gap-2">
            <button type="button" @click="tipoSeleccionado = null"
                class="px-4 py-1.5 rounded-lg text-sm transition-colors" :class="tipoSeleccionado === null
                    ? 'bg-boton text-texto-login-admin font-bold'
                    : 'bg-fondo-card border border-fondo-login text-texto font-semibold hover:bg-boton-hover'">
                Todos
            </button>
            <button v-for="opcion in opcionesTipoCuenta" :key="opcion.value" type="button"
                @click="tipoSeleccionado = opcion.value" class="px-4 py-1.5 rounded-lg text-sm transition-colors"
                :class="tipoSeleccionado === opcion.value
                    ? 'bg-boton text-texto-login-admin font-bold'
                    : 'bg-fondo-card border border-fondo-login text-texto font-semibold hover:bg-boton-hover'">
                {{ opcion.label }}s
            </button>
        </div>

        <!-- Error al cargar -->
        <UAlert v-if="errorEmpleados" color="error" variant="subtle" title="No se pudieron cargar las cuentas"
            description="Revise que el servidor y MySQL estén encendidos e intente recargar la página." />

        <!-- Cargando -->
        <p v-else-if="cargandoEmpleados" class="text-center text-texto/70">Cargando cuentas...</p>

        <!-- Sin resultados -->
        <div v-else-if="empleadosFiltrados.length === 0"
            class="rounded-2xl border border-fondo-login bg-fondo-card p-10 text-center space-y-4">
            <p class="text-lg font-semibold text-texto">No hay cuentas que coincidan con tu búsqueda.</p>
            <UButton @click="limpiarFiltros"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Limpiar filtros
            </UButton>
        </div>

        <!-- tabla del mantenedor -->
        <section v-else>
            <UTable :data="empleadosFiltrados" :columns="columns" :meta="tableMeta"
                class="rounded-2xl border border-fondo-login bg-fondo-card" :ui="{
                    th: 'text-texto font-bold',
                    td: 'text-texto'
                }">

                <!-- columna extra activar / desactivar -->
                <template #activa-cell="{ row }">
                    <USwitch :model-value="row.original.activa" :loading="cambiandoEstado === row.original.id_empleado"
                        :disabled="cambiandoEstado === row.original.id_empleado || esCuentaPropia(row.original)"
                        @update:model-value="(valor) => cambiarEstadoEmpleado(row.original, valor)" color="primary" />
                </template>

                <!-- columna extra editar -->
                <template #editar-cell="{ row }">
                    <UButton icon="i-lucide-pencil" size="md" color="neutral" variant="solid"
                        class="bg-boton hover:bg-boton-hover focus:outline-none focus:ring-0 text-texto"
                        @click="abrirFormularioEditar(row.original)" />
                </template>

                <!-- columna extra eliminar (deshabilitada en la cuenta propia) -->
                <template #eliminar-cell="{ row }">
                    <UButton icon="i-lucide-trash-2" size="md" color="neutral" variant="solid"
                        :disabled="esCuentaPropia(row.original)"
                        class="bg-boton-eliminar hover:bg-boton-eliminar-hover focus:outline-none focus:ring-0 text-white disabled:text-black"
                        @click="confirmarBorrarEmpleado(row.original)" />
                </template>
            </UTable>
        </section>

        <!-- FORMULARIO PARA AGREGAR CUENTAS -->
        <Popups v-model:open="mostrarFormularioAgregar" title="Agregar cuenta">
            <UForm class="space-y-4" :state="formularioNuevoEmpleado" :schema="validarCrearEmpleado"
                @submit.prevent="guardarEmpleado">
                <!-- Nombres -->
                <UFormField label="Nombres" name="nombres" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoEmpleado.nombres" class="w-full" placeholder="Ej: Juan Andrés"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Apellido paterno -->
                <UFormField label="Apellido paterno" name="ap_paterno" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoEmpleado.ap_paterno" class="w-full" placeholder="Ej: Pérez"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Apellido materno -->
                <UFormField label="Apellido materno" name="ap_materno" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoEmpleado.ap_materno" class="w-full" placeholder="Ej: González"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Correo -->
                <UFormField label="Correo" name="correo" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoEmpleado.correo" class="w-full" placeholder="Ej: jperez@correo.cl"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Contraseña -->
                <UFormField label="Contraseña" name="contrasena" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoEmpleado.contrasena" type="password" class="w-full"
                        placeholder="Al menos 8 caracteres" :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Tipo de cuenta -->
                <UFormField label="Tipo de cuenta" name="tipo_cuenta" required :ui="{ label: colorTextoFormulario }">
                    <USelectMenu v-model="formularioNuevoEmpleado.tipo_cuenta" :items="opcionesTipoCuenta"
                        value-key="value" label-key="label" placeholder="Seleccione un tipo de cuenta" class="w-full"
                        :ui="estiloSelector" />
                </UFormField>

                <UAlert v-if="errorFormularioAgregar" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormularioAgregar" />

                <!-- botones cancelar y agregar -->
                <div class="flex items-center justify-between gap-4 p-2">
                    <UButton type="button" @click="cerrarFormularioAgregar"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Cancelar
                    </UButton>
                    <UButton type="submit" :loading="guardandoNuevoEmpleado"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Agregar Cuenta
                    </UButton>
                </div>
            </UForm>
        </Popups>

        <!-- FORMULARIO PARA EDITAR CUENTAS -->
        <Popups v-model:open="mostrarFormularioEditar" title="Editar cuenta">
            <UForm class="space-y-4" :state="formularioEditarEmpleado" :schema="validarEditarEmpleado"
                @submit.prevent="guardarEdicionEmpleado">
                <!-- Código (no se puede modificar, es la clave primaria) -->
                <UFormField label="Código" :ui="{ label: colorTextoFormulario }">
                    <UInput :model-value="empleadoEditando?.id_empleado" disabled class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Nombres -->
                <UFormField label="Nombres" name="nombres" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarEmpleado.nombres" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Apellido paterno -->
                <UFormField label="Apellido paterno" name="ap_paterno" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarEmpleado.ap_paterno" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Apellido materno -->
                <UFormField label="Apellido materno" name="ap_materno" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarEmpleado.ap_materno" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Correo -->
                <UFormField label="Correo" name="correo" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarEmpleado.correo" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Contraseña nueva (opcional) -->
                <UFormField label="Contraseña nueva (opcional)" name="contrasena"
                    help="Déjela vacía para mantener la contraseña actual." :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarEmpleado.contrasena" type="password" class="w-full"
                        placeholder="Al menos 8 caracteres" :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Tipo de cuenta (no se puede cambiar el rol de la cuenta propia) -->
                <UFormField label="Tipo de cuenta" name="tipo_cuenta" required
                    :help="empleadoEditando && esCuentaPropia(empleadoEditando) ? 'No puede cambiar el rol de su propia cuenta.' : undefined"
                    :ui="{ label: colorTextoFormulario }">
                    <USelectMenu v-model="formularioEditarEmpleado.tipo_cuenta" :items="opcionesTipoCuenta"
                        value-key="value" label-key="label" placeholder="Seleccione un tipo de cuenta" class="w-full"
                        :disabled="!!empleadoEditando && esCuentaPropia(empleadoEditando)" :ui="estiloSelector" />
                </UFormField>

                <UAlert v-if="errorFormularioEditar" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormularioEditar" />

                <!-- botones cancelar y guardar -->
                <div class="flex items-center justify-between gap-4 p-2">
                    <UButton type="button" @click="cerrarFormularioEditar"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Cancelar
                    </UButton>
                    <UButton type="submit" :loading="guardandoEmpleadoEditado"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Guardar Cambios
                    </UButton>
                </div>
            </UForm>
        </Popups>

        <!-- CONFIRMAR BORRAR CUENTA -->
        <Popups v-model:open="mostrarConfirmacionBorrar" title="Borrar cuenta"
            :description="empleadoBorrar ? `¿Está seguro que desea borrar la cuenta de ${empleadoBorrar.nombres} ${empleadoBorrar.ap_paterno}? Esta decisión es permanente` : ''">

            <UAlert v-if="errorBorrar" color="warning" variant="subtle" title="No se puede eliminar"
                :description="errorBorrar" icon="i-lucide-triangle-alert" class="mb-4" />

            <div class="flex justify-between items-center gap-6">
                <UButton @click="cerrarConfirmacionBorrar"
                    class="w-full bg-boton text-texto text-center justify-center py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors"
                    type="button">Cancelar</UButton>
                <UButton @click="borrarEmpleado"
                    class="w-full bg-boton-eliminar text-white text-center justify-center py-2 px-4 rounded-md hover:bg-boton-eliminar-hover font-bold transition-colors"
                    type="button" :loading="borrandoEmpleado">Confirmar</UButton>
            </div>
        </Popups>
    </div>
</template>