<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { AjusteStock, AjustesStockPaginados } from '~/types/ajusteStock';
import type { Producto } from '~/types/producto';
import { z } from 'zod';

// empleados y administradores pueden hacer ajustes
definePageMeta({
    middleware: ['empleado']
})

// validaciones zod
const validarAjuste = z.object({
    cod_producto: z.number({ message: 'Debe seleccionar un producto' }),
    tipo: z.enum(['aumento', 'disminucion'], { message: 'Debe seleccionar el tipo de ajuste' }),
    cantidad: z.coerce.number({ message: 'Debe ser un número' }).int('Debe ser un número entero').min(1, 'Debe ser mayor a 0').max(32767, 'Cantidad demasiado grande'),
    motivo: z.string().trim().min(3, 'Debe ingresar el motivo').max(50, 'Máximo 50 caracteres'),
})

const paginaActual = ref(1)
const busqueda = ref('')
const tipoSeleccionado = ref<'aumento' | 'disminucion' | null>(null) // null = todos
const fechaDesde = ref('')
const fechaHasta = ref('')

const parametrosAjustes = computed(() => ({
    pagina: paginaActual.value,
    busqueda: busqueda.value.trim(),
    tipo: tipoSeleccionado.value ?? undefined,
    fechaDesde: fechaDesde.value || undefined,
    fechaHasta: fechaHasta.value || undefined
}))

const {
    data: resultadoAjustes,
    pending: cargandoAjustes,
    error: errorAjustes,
    refresh
} = await useFetch<AjustesStockPaginados>('/api/ajustesstock/paginado', {
    query: parametrosAjustes
})
const { data: productos, refresh: refreshProductos } = await useFetch<Producto[]>('/api/productos')

const ajustesFiltrados = computed(() => resultadoAjustes.value?.ajustes ?? [])
const totalAjustes = computed(() => resultadoAjustes.value?.total ?? 0)
const totalPaginas = computed(() => resultadoAjustes.value?.totalPaginas ?? 0)
const ajustesPorPagina = computed(() => resultadoAjustes.value?.porPagina ?? 20)

watch([busqueda, tipoSeleccionado, fechaDesde, fechaHasta], () => {
    paginaActual.value = 1
})

watch(() => resultadoAjustes.value?.pagina, (pagina) => {
    if (pagina && pagina !== paginaActual.value) {
        paginaActual.value = pagina
    }
})

// colores de los campos del formulario
const colorTextoFormulario = 'text-texto-formulario';
const colorFondoCamposFormulario = 'bg-fondo-general/90 text-texto-formulario';

const estiloSelector = {
    base: colorFondoCamposFormulario + ' hover:bg-fondo-general hover:ring-boton transition-colors',
    content: 'bg-fondo-card border border-fondo-login',
    item: 'text-texto data-highlighted:before:bg-boton/30'
}

// opciones del selector de tipo de ajuste
const opcionesTipo = [
    { value: 'aumento', label: 'Aumento (suma stock)' },
    { value: 'disminucion', label: 'Disminución (resta stock)' },
]

// opciones del selector de producto: nombre + stock actual
const opcionesProducto = computed(() =>
    (productos.value ?? []).map(p => ({
        cod_producto: p.cod_producto,
        label: `${p.nom_producto} (stock: ${p.stock})`
    }))
)

// ------------------------------------------------------------
// REGISTRAR AJUSTE
// ------------------------------------------------------------
const mostrarFormularioAgregar = ref(false);
const errorFormularioAgregar = ref('');
const guardandoNuevoAjuste = ref(false);

const formularioNuevoAjuste = reactive({
    cod_producto: undefined as number | undefined,
    tipo: undefined as 'aumento' | 'disminucion' | undefined,
    cantidad: undefined as number | undefined,
    motivo: '',
})

// producto elegido y cómo quedaría su stock (ayuda para no pasarse)
const productoSeleccionado = computed(() =>
    (productos.value ?? []).find(p => p.cod_producto === formularioNuevoAjuste.cod_producto)
)

const stockResultante = computed(() => {
    const producto = productoSeleccionado.value
    const cantidad = Number(formularioNuevoAjuste.cantidad)
    if (!producto || !formularioNuevoAjuste.tipo || !cantidad) return null
    return formularioNuevoAjuste.tipo === 'aumento' ? producto.stock + cantidad : producto.stock - cantidad
})

//función para reiniciar el formularioAgregar
function reiniciarFormularioAgregar() {
    formularioNuevoAjuste.cod_producto = undefined;
    formularioNuevoAjuste.tipo = undefined;
    formularioNuevoAjuste.cantidad = undefined;
    formularioNuevoAjuste.motivo = '';
    errorFormularioAgregar.value = '';
}

//función para cerrar el formularioAgregar
function cerrarFormularioAgregar() {
    mostrarFormularioAgregar.value = false;
    reiniciarFormularioAgregar();
}

//función async para guardar el ajuste
async function guardarAjuste() {
    guardandoNuevoAjuste.value = true;
    errorFormularioAgregar.value = '';

    try {
        await $fetch('/api/ajustesstock', {
            method: 'POST',
            body: {
                cod_producto: formularioNuevoAjuste.cod_producto,
                tipo: formularioNuevoAjuste.tipo,
                cantidad: formularioNuevoAjuste.cantidad,
                motivo: formularioNuevoAjuste.motivo,
            }
        });
        cerrarFormularioAgregar();
        paginaActual.value = 1;
        // se actualizan el historial y los productos, porque el stock cambió
        await Promise.all([refresh(), refreshProductos()]);

        useToast().add({
            duration: 3000,
            title: 'Ajuste registrado',
            description: 'El stock del producto fue actualizado correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorFormularioAgregar.value = getApiErrorMessage(err, 'No se pudo registrar el ajuste.');
    }
    finally {
        guardandoNuevoAjuste.value = false;
    }
}

// ------------------------------------------------------------
// FILTROS PARA CONSULTAS
// ------------------------------------------------------------
function limpiarFiltros() {
    busqueda.value = ''
    tipoSeleccionado.value = null
    fechaDesde.value = ''
    fechaHasta.value = ''
}

// ------------------------------------------------------------
// PARA LA TABLA
// ------------------------------------------------------------
// la fecha viene de la base como día sin hora, por eso se muestra en UTC
function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-CL', { timeZone: 'UTC' })
}

const columns: TableColumn<AjusteStock>[] = [
    { accessorKey: 'cod_ajuste', header: 'Código', meta: { class: { th: 'text-center', td: 'text-center' } } },
    {
        id: 'fecha',
        header: 'Fecha',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => formatearFecha(row.original.fecha)
    },
    {
        id: 'producto',
        header: 'Producto',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => row.original.producto.nom_producto
    },
    {
        id: 'tipo',
        header: 'Tipo',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => row.original.cantidad > 0 ? 'Aumento' : 'Disminución'
    },
    {
        id: 'cantidad',
        header: 'Cantidad',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => h('span', {
            class: row.original.cantidad > 0 ? 'font-bold text-green-600' : 'font-bold text-red-600'
        }, row.original.cantidad > 0 ? `+${row.original.cantidad}` : `${row.original.cantidad}`)
    },
    { accessorKey: 'motivo', header: 'Motivo', meta: { class: { th: 'text-center', td: 'text-center' } } },
    {
        id: 'empleado',
        header: 'Registrado por',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) => `${row.original.empleado.nombres} ${row.original.empleado.ap_paterno}`
    },
]

const tableMeta = createTableMeta<AjusteStock>()
</script>

<template>
    <div class="space-y-8">
        <!-- título página + botón registrar ajuste -->
        <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
                    AJUSTE DE STOCK
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-7 text-texto/70">
                    Registro e historial de ajustes manuales de stock.
                </p>
            </div>

            <UButton @click="mostrarFormularioAgregar = true"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Registrar ajuste
            </UButton>
        </section>

        <!-- Buscador -->
        <UInput v-model="busqueda" icon="i-lucide-search" class="w-full" placeholder="Buscar por producto o motivo..."
            :ui="{ base: 'bg-fondo-general/90 text-texto-formulario focus-visible:ring-boton' }" />

        <!-- Filtro por rango de fechas -->
        <div class="flex flex-col gap-4 sm:flex-row">
            <UFormField label="Desde" :ui="{ label: 'text-texto' }">
                <UInput v-model="fechaDesde" type="date" :ui="{ base: colorFondoCamposFormulario }" />
            </UFormField>
            <UFormField label="Hasta" :ui="{ label: 'text-texto' }">
                <UInput v-model="fechaHasta" type="date" :ui="{ base: colorFondoCamposFormulario }" />
            </UFormField>
        </div>

        <!-- Botones de tipo de ajuste -->
        <div class="flex flex-wrap gap-2">
            <button type="button" @click="tipoSeleccionado = null"
                class="px-4 py-1.5 rounded-lg text-sm transition-colors" :class="tipoSeleccionado === null
                    ? 'bg-boton text-texto-login-admin font-bold'
                    : 'bg-fondo-card border border-fondo-login text-texto font-semibold hover:bg-boton-hover'">
                Todos
            </button>
            <button type="button" @click="tipoSeleccionado = 'aumento'"
                class="px-4 py-1.5 rounded-lg text-sm transition-colors" :class="tipoSeleccionado === 'aumento'
                    ? 'bg-boton text-texto-login-admin font-bold'
                    : 'bg-fondo-card border border-fondo-login text-texto font-semibold hover:bg-boton-hover'">
                Aumentos
            </button>
            <button type="button" @click="tipoSeleccionado = 'disminucion'"
                class="px-4 py-1.5 rounded-lg text-sm transition-colors" :class="tipoSeleccionado === 'disminucion'
                    ? 'bg-boton text-texto-login-admin font-bold'
                    : 'bg-fondo-card border border-fondo-login text-texto font-semibold hover:bg-boton-hover'">
                Disminuciones
            </button>
        </div>

        <!-- Error al cargar -->
        <UAlert v-if="errorAjustes" color="error" variant="subtle" title="No se pudo cargar el historial"
            description="Revise que el servidor y MySQL estén encendidos e intente recargar la página." />

        <!-- Cargando -->
        <p v-else-if="cargandoAjustes" class="text-center text-texto/70">Cargando historial...</p>

        <!-- Sin resultados -->
        <div v-else-if="ajustesFiltrados.length === 0"
            class="rounded-2xl border border-fondo-login bg-fondo-card p-10 text-center space-y-4">
            <p class="text-lg font-semibold text-texto">No hay ajustes que coincidan con tu búsqueda.</p>
            <UButton @click="limpiarFiltros"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Limpiar filtros
            </UButton>
        </div>

        <!-- tabla del historial -->
        <section v-else>
            <UTable :data="ajustesFiltrados" :columns="columns" :meta="tableMeta"
                class="rounded-2xl border border-fondo-login bg-fondo-card" :ui="{
                    th: 'text-texto font-bold',
                    td: 'text-texto'
                }" />
        </section>

        <div v-if="ajustesFiltrados.length > 0" class="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p class="text-sm text-texto/70">
                Mostrando {{ (paginaActual - 1) * ajustesPorPagina + 1 }}–{{ (paginaActual - 1) * ajustesPorPagina + ajustesFiltrados.length }}
                de {{ totalAjustes }} ajustes
            </p>
            <div class="flex items-center gap-3">
                <UButton
                    :disabled="paginaActual <= 1 || cargandoAjustes"
                    @click="paginaActual--"
                    class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors disabled:opacity-50"
                >
                    Anterior
                </UButton>
                <span class="text-sm text-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
                <UButton
                    :disabled="paginaActual >= totalPaginas || cargandoAjustes"
                    @click="paginaActual++"
                    class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors disabled:opacity-50"
                >
                    Siguiente
                </UButton>
            </div>
        </div>

        <!-- FORMULARIO PARA REGISTRAR AJUSTES -->
        <Popups v-model:open="mostrarFormularioAgregar" title="Registrar ajuste de stock">
            <UForm class="space-y-4" :state="formularioNuevoAjuste" :schema="validarAjuste"
                @submit.prevent="guardarAjuste">
                <!-- Producto -->
                <UFormField label="Producto" name="cod_producto" required :ui="{ label: colorTextoFormulario }">
                    <USelectMenu v-model="formularioNuevoAjuste.cod_producto" :items="opcionesProducto"
                        value-key="cod_producto" label-key="label" placeholder="Seleccione un producto" class="w-full"
                        :ui="estiloSelector" />
                </UFormField>

                <!-- Tipo de ajuste -->
                <UFormField label="Tipo de ajuste" name="tipo" required :ui="{ label: colorTextoFormulario }">
                    <USelectMenu v-model="formularioNuevoAjuste.tipo" :items="opcionesTipo" value-key="value"
                        label-key="label" placeholder="Seleccione el tipo de ajuste" class="w-full"
                        :ui="estiloSelector" />
                </UFormField>

                <!-- Cantidad -->
                <UFormField label="Cantidad" name="cantidad" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoAjuste.cantidad" class="w-full" placeholder="Ej: 5"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Stock actual y cómo quedaría -->
                <p v-if="productoSeleccionado" class="text-sm text-texto-formulario">
                    Stock actual: <b>{{ productoSeleccionado.stock }}</b>
                    <template v-if="stockResultante !== null">
                        &rarr; quedaría en:
                        <b :class="stockResultante < 0 ? 'text-red-600' : ''">{{ stockResultante }}</b>
                    </template>
                </p>

                <!-- Motivo -->
                <UFormField label="Motivo" name="motivo" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoAjuste.motivo" class="w-full"
                        placeholder="Ej: Merma por vencimiento" :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <UAlert v-if="errorFormularioAgregar" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormularioAgregar" />

                <!-- botones cancelar y registrar -->
                <div class="flex items-center justify-between gap-4 p-2">
                    <UButton type="button" @click="cerrarFormularioAgregar"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Cancelar
                    </UButton>
                    <UButton type="submit" :loading="guardandoNuevoAjuste"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Registrar Ajuste
                    </UButton>
                </div>
            </UForm>
        </Popups>
    </div>
</template>