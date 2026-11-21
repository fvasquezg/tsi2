<!-- pages/addMarcas.vue -->
<script setup lang="ts">
import type { Marca, MarcasPaginadas } from '~/types/marca';
import { z } from 'zod';

definePageMeta({
    middleware: ['empleado']
})

// validaciones zod (sirven para agregar y para editar)
const validarMarca = z.object({
    nom_marca: z.string().trim().min(1, 'Debe ingresar el nombre de la marca').max(30, 'Máximo 30 caracteres'),
})

const paginaActual = ref(1)
const busqueda = ref('')
const parametrosMarcas = computed(() => ({
    pagina: paginaActual.value,
    busqueda: busqueda.value.trim()
}))

const {
    data: resultadoMarcas,
    pending: cargandoMarcas,
    error: errorMarcas,
    refresh
} = await useFetch<MarcasPaginadas>('/api/marcas/paginado', {
    query: parametrosMarcas
})

const marcasFiltradas = computed(() => resultadoMarcas.value?.marcas ?? [])
const totalMarcas = computed(() => resultadoMarcas.value?.total ?? 0)
const totalPaginas = computed(() => resultadoMarcas.value?.totalPaginas ?? 0)
const marcasPorPagina = computed(() => resultadoMarcas.value?.porPagina ?? 20)

watch(busqueda, () => {
    paginaActual.value = 1
})

watch(() => resultadoMarcas.value?.pagina, (pagina) => {
    if (pagina && pagina !== paginaActual.value) {
        paginaActual.value = pagina
    }
})

// colores de los campos del formulario
const colorTextoFormulario = 'text-texto-formulario';
const colorFondoCamposFormulario = 'bg-fondo-general/90 text-texto-formulario';

// ------------------------------------------------------------
// AGREGAR MARCA
// ------------------------------------------------------------
const mostrarFormularioAgregar = ref(false);
const errorFormularioAgregar = ref('');
const guardandoNuevaMarca = ref(false);

const formularioNuevaMarca = reactive({
    nom_marca: '',
})

// Para la imagen (agregar)
const archivoImagen = ref<File | null>(null)

//función para reiniciar el formularioAgregar
function reiniciarFormularioAgregar() {
    formularioNuevaMarca.nom_marca = '';
    archivoImagen.value = null;
    errorFormularioAgregar.value = '';
}

//función para cerrar el formularioAgregar
function cerrarFormularioAgregar() {
    mostrarFormularioAgregar.value = false;
    reiniciarFormularioAgregar();
}

//función async para guardar nueva marca
async function guardarMarca() {
    guardandoNuevaMarca.value = true;
    errorFormularioAgregar.value = '';

    try {
        let nombreArchivo = '';
        let archivoBase64 = '';
        if (archivoImagen.value) {
            nombreArchivo = archivoImagen.value.name
            archivoBase64 = await leerImagenBase64(archivoImagen.value)
        }

        await $fetch('/api/marcas', {
            method: 'POST',
            body: {
                nom_marca: formularioNuevaMarca.nom_marca,
                nombreArchivo: nombreArchivo,
                archivoBase64: archivoBase64,
            }
        });
        cerrarFormularioAgregar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Agregada correctamente',
            description: 'La marca ha sido agregada correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorFormularioAgregar.value = getApiErrorMessage(err, 'No se pudo agregar la marca.');
    }
    finally {
        guardandoNuevaMarca.value = false;
    }
}

// ------------------------------------------------------------
// EDITAR MARCA
// ------------------------------------------------------------
const mostrarFormularioEditar = ref(false);
const errorFormularioEditar = ref('');
const guardandoMarcaEditada = ref(false);
const marcaEditando = ref<Marca | null>(null);

const formularioEditarMarca = reactive({
    nom_marca: '',
})

// Para la imagen (editar)
const archivoImagenEditar = ref<File | null>(null)

// abre el formulario con los datos de la marca ya cargados
function abrirFormularioEditar(marca: Marca) {
    marcaEditando.value = marca;
    formularioEditarMarca.nom_marca = marca.nom_marca;

    archivoImagenEditar.value = null;
    errorFormularioEditar.value = '';
    mostrarFormularioEditar.value = true;
}

//función para reiniciar el formularioEditar
function reiniciarFormularioEditar() {
    formularioEditarMarca.nom_marca = '';
    archivoImagenEditar.value = null;
    errorFormularioEditar.value = '';
    marcaEditando.value = null;
}

//función para cerrar el formularioEditar
function cerrarFormularioEditar() {
    mostrarFormularioEditar.value = false;
    reiniciarFormularioEditar();
}

//función async para guardar la edición de la marca
async function guardarEdicionMarca() {
    if (!marcaEditando.value) return;

    guardandoMarcaEditada.value = true;
    errorFormularioEditar.value = '';

    try {
        let nombreArchivo = '';
        let archivoBase64 = '';
        if (archivoImagenEditar.value) {
            nombreArchivo = archivoImagenEditar.value.name
            archivoBase64 = await leerImagenBase64(archivoImagenEditar.value)
        }

        await $fetch(`/api/marcas/${marcaEditando.value.cod_marca}`, {
            method: 'PUT',
            body: {
                nom_marca: formularioEditarMarca.nom_marca,
                nombreArchivo: nombreArchivo,
                archivoBase64: archivoBase64,
            }
        });
        cerrarFormularioEditar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Actualizada correctamente',
            description: 'La marca ha sido actualizada correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorFormularioEditar.value = getApiErrorMessage(err, 'No se pudo actualizar la marca.');
    }
    finally {
        guardandoMarcaEditada.value = false;
    }
}

// ------------------------------------------------------------
// BORRAR MARCA
// ------------------------------------------------------------
const marcaBorrar = ref<Marca | null>(null);
const mostrarConfirmacionBorrar = ref(false);
const borrandoMarca = ref(false);
const errorBorrar = ref('');

//para confirmar la eliminación de la marca
function confirmarBorrarMarca(marca: Marca) {
    marcaBorrar.value = marca;
    errorBorrar.value = '';
    mostrarConfirmacionBorrar.value = true;
}

//para cerrar confirmación
function cerrarConfirmacionBorrar() {
    mostrarConfirmacionBorrar.value = false;
    marcaBorrar.value = null;
}

//función async para borrar marca
async function borrarMarca() {
    borrandoMarca.value = true;
    const nombreMarcaBorrar = marcaBorrar.value?.nom_marca;
    try {
        await $fetch(`/api/marcas/${marcaBorrar.value?.cod_marca}`, {
            method: 'DELETE'
        })
        cerrarConfirmacionBorrar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Eliminada correctamente',
            description: `Se eliminó correctamente la marca ${nombreMarcaBorrar}.`,
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorBorrar.value = getApiErrorMessage(err, 'No se pudo borrar la marca.');
    }
    finally {
        borrandoMarca.value = false;
    }
}

// ------------------------------------------------------------
// FILTRO PARA CONSULTAS
// ------------------------------------------------------------
function limpiarFiltros() {
    busqueda.value = ''
}
</script>

<template>
    <div class="space-y-8">
        <!-- título página + botón agregar marca -->
        <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
                    MARCAS
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-7 text-texto/70">
                    Gestor de marcas.
                </p>
            </div>

            <UButton @click="mostrarFormularioAgregar = true"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Agregar marca
            </UButton>
        </section>

        <!-- Buscador -->
        <UInput v-model="busqueda" icon="i-lucide-search" class="w-full" placeholder="Buscar por nombre..."
            :ui="{ base: 'bg-fondo-general/90 text-texto-formulario focus-visible:ring-boton' }" />

        <!-- Error al cargar -->
        <UAlert v-if="errorMarcas" color="error" variant="subtle" title="No se pudieron cargar las marcas"
            description="Revise que el servidor y MySQL estén encendidos e intente recargar la página." />

        <!-- Cargando -->
        <p v-else-if="cargandoMarcas" class="text-center text-texto/70">Cargando marcas...</p>

        <!-- Sin resultados -->
        <div v-else-if="marcasFiltradas.length === 0"
            class="rounded-2xl border border-fondo-login bg-fondo-card p-10 text-center space-y-4">
            <p class="text-lg font-semibold text-texto">No hay marcas que coincidan con tu búsqueda.</p>
            <UButton @click="limpiarFiltros"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Limpiar filtros
            </UButton>
        </div>

        <!-- Marcas en tarjetas cuadradas, todas del mismo tamaño -->
        <section v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <div v-for="marca in marcasFiltradas" :key="marca.cod_marca"
                class="relative aspect-square overflow-hidden rounded-2xl border border-fondo-login bg-fondo-card">

                <!-- imagen de la marca (o un ícono si no tiene) -->
                <img v-if="marca.imagen" :src="marca.imagen" :alt="marca.nom_marca"
                    class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center text-texto/40">
                    <UIcon name="i-lucide-image-off" class="size-12" />
                </div>

                <!-- botones editar y eliminar arriba a la derecha -->
                <div class="absolute right-2 top-2 flex gap-2">
                    <UButton icon="i-lucide-pencil" size="sm" color="neutral" variant="solid"
                        class="bg-boton hover:bg-boton-hover focus:outline-none focus:ring-0 text-texto"
                        @click="abrirFormularioEditar(marca)" />
                    <UButton icon="i-lucide-trash-2" size="sm" color="neutral" variant="solid"
                        class="bg-boton-eliminar hover:bg-boton-eliminar-hover focus:outline-none focus:ring-0 text-white"
                        @click="confirmarBorrarMarca(marca)" />
                </div>

                <!-- nombre de la marca sobre una franja de color, abajo -->
                <div class="absolute inset-x-0 bottom-0 bg-boton/90 px-3 py-2">
                    <p class="truncate text-center font-bold text-texto-login-admin">
                        {{ marca.nom_marca }}
                    </p>
                </div>
            </div>
        </section>

        <div v-if="marcasFiltradas.length > 0 && !cargandoMarcas"
            class="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p class="text-sm text-texto/70">
                Mostrando {{ (paginaActual - 1) * marcasPorPagina + 1 }}–{{ (paginaActual - 1) * marcasPorPagina + marcasFiltradas.length }}
                de {{ totalMarcas }} marcas
            </p>
            <div class="flex items-center gap-3">
                <UButton :disabled="paginaActual <= 1 || cargandoMarcas" @click="paginaActual--"
                    class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors disabled:opacity-50">
                    Anterior
                </UButton>
                <span class="text-sm text-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
                <UButton :disabled="paginaActual >= totalPaginas || cargandoMarcas" @click="paginaActual++"
                    class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors disabled:opacity-50">
                    Siguiente
                </UButton>
            </div>
        </div>

        <!-- FORMULARIO PARA AGREGAR MARCAS -->
        <Popups v-model:open="mostrarFormularioAgregar" title="Agregar marca">
            <UForm class="space-y-4" :state="formularioNuevaMarca" :schema="validarMarca"
                @submit.prevent="guardarMarca">
                <!-- Nombre marca -->
                <UFormField label="Nombre" name="nom_marca" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevaMarca.nom_marca" class="w-full" placeholder="Ej: Master Cat"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Imagen (opcional) -->
                <UFormField label="Imagen (opcional)" name="imagen" :ui="{ label: colorTextoFormulario }">
                    <UFileUpload v-model="archivoImagen" accept="image/*" label="Agregue la imagen de la marca"
                        class="w-full" :ui="{
                            base: 'bg-fondo-general/90 hover:bg-fondo-general/70 transition-colors',
                            label: 'text-texto'
                        }" />
                </UFormField>

                <UAlert v-if="errorFormularioAgregar" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormularioAgregar" />

                <!-- botones cancelar y agregar -->
                <div class="flex items-center justify-between gap-4 p-2">
                    <UButton type="button" @click="cerrarFormularioAgregar"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Cancelar
                    </UButton>
                    <UButton type="submit" :loading="guardandoNuevaMarca"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Agregar Marca
                    </UButton>
                </div>
            </UForm>
        </Popups>

        <!-- FORMULARIO PARA EDITAR MARCAS -->
        <Popups v-model:open="mostrarFormularioEditar" title="Editar marca">
            <UForm class="space-y-4" :state="formularioEditarMarca" :schema="validarMarca"
                @submit.prevent="guardarEdicionMarca">
                <!-- Código (no se puede modificar, es la clave primaria) -->
                <UFormField label="Código" :ui="{ label: colorTextoFormulario }">
                    <UInput :model-value="marcaEditando?.cod_marca" disabled class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Nombre marca -->
                <UFormField label="Nombre" name="nom_marca" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarMarca.nom_marca" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Imagen nueva (opcional) -->
                <UFormField label="Imagen nueva (opcional)" name="imagen" :ui="{ label: colorTextoFormulario }">
                    <UFileUpload v-model="archivoImagenEditar" accept="image/*"
                        label="Deje vacío para mantener la imagen actual" class="w-full" :ui="{
                            base: 'bg-fondo-general/90 hover:bg-fondo-general/70 transition-colors',
                            label: 'text-texto'
                        }" />
                </UFormField>

                <UAlert v-if="errorFormularioEditar" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormularioEditar" />

                <!-- botones cancelar y guardar -->
                <div class="flex items-center justify-between gap-4 p-2">
                    <UButton type="button" @click="cerrarFormularioEditar"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Cancelar
                    </UButton>
                    <UButton type="submit" :loading="guardandoMarcaEditada"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Guardar Cambios
                    </UButton>
                </div>
            </UForm>
        </Popups>

        <!-- CONFIRMAR BORRAR MARCA -->
        <Popups v-model:open="mostrarConfirmacionBorrar" title="Borrar marca"
            :description="marcaBorrar ? `¿Está seguro que desea borrar la marca ${marcaBorrar.nom_marca}? Esta decisión es permanente` : ''">

            <UAlert v-if="errorBorrar" color="error" variant="subtle" title="No se pudo eliminar"
                :description="errorBorrar" class="mb-4" />

            <div class="flex justify-between items-center gap-6">
                <UButton @click="cerrarConfirmacionBorrar"
                    class="w-full bg-boton text-texto text-center justify-center py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors"
                    type="button">Cancelar</UButton>
                <UButton @click="borrarMarca"
                    class="w-full bg-boton-eliminar text-white text-center justify-center py-2 px-4 rounded-md hover:bg-boton-eliminar-hover font-bold transition-colors"
                    type="button" :loading="borrandoMarca">Confirmar</UButton>
            </div>
        </Popups>
    </div>
</template>