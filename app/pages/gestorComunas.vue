<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Comuna } from '~/types/comuna'
import { z } from 'zod'

definePageMeta({
    middleware: ['empleado']
})

const validarComuna = z.object({
    nom_comuna: z.string().trim().min(1, 'Debe ingresar el nombre de la comuna').max(50, 'Máximo 50 caracteres'),
    costo_envio: z.preprocess(
        value => value === '' || value === null || value === undefined ? undefined : value,
        z.coerce.number().int('El costo de envío debe ser un número entero').min(0, 'El costo no puede ser negativo').max(32767, 'El costo supera el máximo permitido')
    ),
    todosLosDias: z.boolean(),
    dia_desde: z.number().int().min(1).max(7),
    dia_hasta: z.number().int().min(1).max(7)
})

const { data: comunas, pending: cargandoComunas, error: errorComunas, refresh } = await useFetch<Comuna[]>('/api/comunas')

const busqueda = ref('')
const comunasFiltradas = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()
    return (comunas.value ?? []).filter(comuna =>
        !texto || comuna.nom_comuna.toLowerCase().includes(texto)
    )
})

const colorTextoFormulario = 'text-texto-formulario'
const colorFondoCamposFormulario = 'bg-fondo-general/90 text-texto-formulario'
const estiloSelector = {
    base: colorFondoCamposFormulario + ' hover:bg-fondo-general hover:ring-boton transition-colors',
    content: 'bg-fondo-card border border-fondo-login',
    item: 'text-texto data-highlighted:before:bg-boton/30'
}

const diasSemana = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' }
]

const mostrarFormularioComuna = ref(false)
const comunaEditando = ref<Comuna | null>(null)
const guardandoComuna = ref(false)
const errorFormulario = ref('')
const formularioComuna = reactive({
    nom_comuna: '',
    costo_envio: undefined as number | undefined,
    todosLosDias: true,
    dia_desde: 1,
    dia_hasta: 7
})

function reiniciarFormulario() {
    formularioComuna.nom_comuna = ''
    formularioComuna.costo_envio = undefined
    formularioComuna.todosLosDias = true
    formularioComuna.dia_desde = 1
    formularioComuna.dia_hasta = 7
    errorFormulario.value = ''
    comunaEditando.value = null
}

function abrirFormularioAgregar() {
    reiniciarFormulario()
    mostrarFormularioComuna.value = true
}

function abrirFormularioEditar(comuna: Comuna) {
    comunaEditando.value = comuna
    formularioComuna.nom_comuna = comuna.nom_comuna
    formularioComuna.costo_envio = comuna.costo_envio
    formularioComuna.todosLosDias = comuna.dia_desde === null && comuna.dia_hasta === null
    formularioComuna.dia_desde = comuna.dia_desde ?? 1
    formularioComuna.dia_hasta = comuna.dia_hasta ?? 7
    errorFormulario.value = ''
    mostrarFormularioComuna.value = true
}

function cerrarFormulario() {
    mostrarFormularioComuna.value = false
    reiniciarFormulario()
}

async function guardarComuna() {
    guardandoComuna.value = true
    errorFormulario.value = ''
    const editando = comunaEditando.value !== null

    const body = {
        nom_comuna: formularioComuna.nom_comuna,
        costo_envio: formularioComuna.costo_envio,
        dia_desde: formularioComuna.todosLosDias ? null : formularioComuna.dia_desde,
        dia_hasta: formularioComuna.todosLosDias ? null : formularioComuna.dia_hasta
    }

    try {
        if (comunaEditando.value) {
            await $fetch(`/api/comunas/${comunaEditando.value.cod_comuna}`, {
                method: 'PUT',
                body
            })
        } else {
            await $fetch('/api/comunas', {
                method: 'POST',
                body
            })
        }

        cerrarFormulario()
        await refresh()
        useToast().add({
            duration: 3000,
            title: editando ? 'Comuna actualizada' : 'Comuna agregada',
            description: editando
                ? 'Los datos de la comuna se actualizaron correctamente.'
                : 'La comuna se agregó correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: unknown) {
        errorFormulario.value = getApiErrorMessage(err, 'No se pudo guardar la comuna.')
    } finally {
        guardandoComuna.value = false
    }
}

const cambiandoEstado = ref<number | null>(null)

async function cambiarEstadoComuna(comuna: Comuna, activa: boolean) {
    cambiandoEstado.value = comuna.cod_comuna
    try {
        await $fetch(`/api/comunas/${comuna.cod_comuna}/activo`, {
            method: 'PATCH',
            body: { activa }
        })
        await refresh()
        useToast().add({
            duration: 3000,
            title: activa ? 'Comuna activada' : 'Comuna desactivada',
            description: `La comuna ${comuna.nom_comuna} se ${activa ? 'activó' : 'desactivó'}.`,
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: unknown) {
        useToast().add({
            duration: 3000,
            color: 'error',
            title: 'No se pudo cambiar el estado',
            description: getApiErrorMessage(err, 'Ocurrió un error al actualizar el estado.')
        })
    } finally {
        cambiandoEstado.value = null
    }
}

const comunaBorrar = ref<Comuna | null>(null)
const mostrarConfirmacionBorrar = ref(false)
const borrandoComuna = ref(false)
const errorBorrar = ref('')

function confirmarBorrarComuna(comuna: Comuna) {
    comunaBorrar.value = comuna
    errorBorrar.value = ''
    mostrarConfirmacionBorrar.value = true
}

function cerrarConfirmacionBorrar() {
    mostrarConfirmacionBorrar.value = false
    comunaBorrar.value = null
    errorBorrar.value = ''
}

async function borrarComuna() {
    if (!comunaBorrar.value) return

    borrandoComuna.value = true
    try {
        await $fetch(`/api/comunas/${comunaBorrar.value.cod_comuna}`, {
            method: 'DELETE'
        })
        cerrarConfirmacionBorrar()
        await refresh()
        useToast().add({
            duration: 3000,
            title: 'Comuna eliminada',
            description: 'La comuna se eliminó correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: unknown) {
        errorBorrar.value = getApiErrorMessage(err, 'No se pudo eliminar la comuna.')
    } finally {
        borrandoComuna.value = false
    }
}

function mostrarDias(comuna: Comuna) {
    if (comuna.dia_desde === null || comuna.dia_hasta === null) return 'Todos los días'
    const desde = diasSemana.find(dia => dia.value === comuna.dia_desde)?.label
    const hasta = diasSemana.find(dia => dia.value === comuna.dia_hasta)?.label
    return `${desde} a ${hasta}`
}

const formatoMoneda = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
})

const columns: TableColumn<Comuna>[] = [
    { accessorKey: 'cod_comuna', header: 'Código', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { accessorKey: 'nom_comuna', header: 'Comuna', meta: { class: { th: 'text-center', td: 'text-center' } } },
    {
        id: 'costo_envio',
        header: 'Costo de envío',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => formatoMoneda.format(row.original.costo_envio)
    },
    {
        id: 'dias',
        header: 'Días disponibles',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => mostrarDias(row.original)
    },
    { id: 'activa', header: 'Activa', meta: { class: { th: '', td: 'text-center' } } },
    { id: 'editar', header: 'Editar', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { id: 'eliminar', header: 'Eliminar', meta: { class: { th: 'text-center', td: 'text-center' } } }
]

const tableMeta = createTableMeta<Comuna>()
</script>

<template>
    <div class="space-y-8">
        <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
                    COMUNAS
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-7 text-texto/70">
                    Administra cobertura, costo de envío y días disponibles por comuna.
                </p>
            </div>

            <UButton @click="abrirFormularioAgregar"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Agregar comuna
            </UButton>
        </section>

        <UInput v-model="busqueda" icon="i-lucide-search" class="w-full" placeholder="Buscar por nombre de comuna..."
            :ui="{ base: 'bg-fondo-general/90 text-texto-formulario focus-visible:ring-boton' }" />

        <UAlert v-if="errorComunas" color="error" variant="subtle" title="No se pudieron cargar las comunas"
            description="Revise que el servidor y MySQL estén encendidos e intente recargar la página." />

        <p v-else-if="cargandoComunas" class="text-center text-texto/70">Cargando comunas...</p>

        <div v-else-if="comunasFiltradas.length === 0"
            class="rounded-2xl border border-fondo-login bg-fondo-card p-10 text-center space-y-4">
            <p class="text-lg font-semibold text-texto">
                {{ busqueda ? 'No hay comunas que coincidan con la búsqueda.' : 'Todavía no hay comunas registradas.' }}
            </p>
            <UButton v-if="busqueda" @click="busqueda = ''"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Limpiar búsqueda
            </UButton>
        </div>

        <section v-else>
            <UTable :data="comunasFiltradas" :columns="columns" :meta="tableMeta"
                class="rounded-2xl border border-fondo-login bg-fondo-card" :ui="{
                    th: 'text-texto font-bold px-2 py-3 text-xs',
                    td: 'text-texto px-2 py-3 text-sm'
                }">
                <template #activa-cell="{ row }">
                    <USwitch :model-value="row.original.activa" :loading="cambiandoEstado === row.original.cod_comuna"
                        :disabled="cambiandoEstado === row.original.cod_comuna"
                        @update:model-value="(activa) => cambiarEstadoComuna(row.original, activa)" color="primary" />
                </template>

                <template #editar-cell="{ row }">
                    <UButton icon="i-lucide-pencil" size="md" color="neutral" variant="solid"
                        class="bg-boton hover:bg-boton-hover focus:outline-none focus:ring-0 text-texto"
                        @click="abrirFormularioEditar(row.original)" />
                </template>

                <template #eliminar-cell="{ row }">
                    <UButton icon="i-lucide-trash-2" size="md" color="neutral" variant="solid"
                        class="bg-boton-eliminar hover:bg-boton-eliminar-hover focus:outline-none focus:ring-0 text-white"
                        @click="confirmarBorrarComuna(row.original)" />
                </template>
            </UTable>
        </section>

        <Popups v-model:open="mostrarFormularioComuna" :title="comunaEditando ? 'Editar comuna' : 'Agregar comuna'"
            :description="comunaEditando ? 'Actualice los datos de cobertura y envío.' : 'Ingrese los datos de la comuna.'">
            <UForm class="space-y-4" :state="formularioComuna" :schema="validarComuna" @submit.prevent="guardarComuna">
                <UFormField label="Nombre de la comuna" name="nom_comuna" required
                    :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioComuna.nom_comuna" class="w-full" placeholder="Ej: Cartagena"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <UFormField label="Costo de envío (CLP)" name="costo_envio" required
                    :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioComuna.costo_envio" type="number" min="0" step="1" class="w-full"
                        placeholder="Ej: 2500" :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <div
                    class="flex items-center justify-between rounded-lg border border-fondo-login bg-fondo-card px-4 py-3">
                    <span class="text-sm font-semibold text-texto">Disponible todos los días</span>
                    <USwitch v-model="formularioComuna.todosLosDias" color="primary" />
                </div>

                <template v-if="!formularioComuna.todosLosDias">
                    <UFormField label="Desde" name="dia_desde" required :ui="{ label: colorTextoFormulario }">
                        <USelectMenu v-model="formularioComuna.dia_desde" :items="diasSemana" value-key="value"
                            label-key="label" placeholder="Seleccione el día inicial" class="w-full"
                            :ui="estiloSelector" />
                    </UFormField>

                    <UFormField label="Hasta" name="dia_hasta" required :ui="{ label: colorTextoFormulario }">
                        <USelectMenu v-model="formularioComuna.dia_hasta" :items="diasSemana" value-key="value"
                            label-key="label" placeholder="Seleccione el día final" class="w-full"
                            :ui="estiloSelector" />
                    </UFormField>
                </template>

                <UAlert v-if="errorFormulario" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormulario" />

                <div class="flex justify-end gap-3 pt-2">
                    <UButton type="button" color="neutral" variant="outline" @click="cerrarFormulario"
                        class="border-fondo-login text-texto">
                        Cancelar
                    </UButton>
                    <UButton type="submit" :loading="guardandoComuna" :disabled="guardandoComuna"
                        class="bg-boton hover:bg-boton-hover text-texto font-bold">
                        {{ comunaEditando ? 'Guardar cambios' : 'Agregar comuna' }}
                    </UButton>
                </div>
            </UForm>
        </Popups>

        <Popups v-model:open="mostrarConfirmacionBorrar" title="Eliminar comuna"
            :description="comunaBorrar ? `¿Seguro que desea eliminar ${comunaBorrar.nom_comuna}? No se podrá eliminar si tiene clientes o envíos asociados.` : ''">
            <UAlert v-if="errorBorrar" color="error" variant="subtle" title="No se pudo eliminar"
                :description="errorBorrar" class="mb-4" />
            <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="outline" @click="cerrarConfirmacionBorrar"
                    class="border-fondo-login text-texto">
                    Cancelar
                </UButton>
                <UButton :loading="borrandoComuna" :disabled="borrandoComuna" @click="borrarComuna"
                    class="bg-boton-eliminar hover:bg-boton-eliminar-hover text-white font-bold">
                    Eliminar comuna
                </UButton>
            </div>
        </Popups>
    </div>
</template>