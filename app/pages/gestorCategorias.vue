<!-- pages/addCategorias.vue -->
<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Categoria } from '~/types/categoria';
import { z } from 'zod';

definePageMeta({
    middleware: ['empleado']
})

// validaciones zod (sirven para agregar y para editar)
const validarCategoria = z.object({
    nom_categoria: z.string().trim().min(1, 'Debe ingresar el nombre de la categoría').max(30, 'Máximo 30 caracteres'),
})

// para tomar la informacion de las categorias
const { data: categorias, pending: cargandoCategorias, error: errorCategorias, refresh } = await useFetch<Categoria[]>('/api/categorias')

// colores de los campos del formulario
const colorTextoFormulario = 'text-texto-formulario';
const colorFondoCamposFormulario = 'bg-fondo-general/90 text-texto-formulario';

// ------------------------------------------------------------
// AGREGAR CATEGORÍA
// ------------------------------------------------------------
const mostrarFormularioAgregar = ref(false);
const errorFormularioAgregar = ref('');
const guardandoNuevaCategoria = ref(false);

const formularioNuevaCategoria = reactive({
    nom_categoria: '',
})

//función para reiniciar el formularioAgregar
function reiniciarFormularioAgregar() {
    formularioNuevaCategoria.nom_categoria = '';
    errorFormularioAgregar.value = '';
}

//función para cerrar el formularioAgregar
function cerrarFormularioAgregar() {
    mostrarFormularioAgregar.value = false;
    reiniciarFormularioAgregar();
}

//función async para guardar nueva categoria
async function guardarCategoria() {
    guardandoNuevaCategoria.value = true;
    errorFormularioAgregar.value = '';

    try {
        await $fetch('/api/categorias', {
            method: 'POST',
            body: {
                nom_categoria: formularioNuevaCategoria.nom_categoria,
            }
        });
        cerrarFormularioAgregar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Agregada correctamente',
            description: 'La categoría ha sido agregada correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorFormularioAgregar.value = getApiErrorMessage(err, 'No se pudo agregar la categoría.');
    }
    finally {
        guardandoNuevaCategoria.value = false;
    }
}

// ------------------------------------------------------------
// EDITAR CATEGORÍA
// ------------------------------------------------------------
const mostrarFormularioEditar = ref(false);
const errorFormularioEditar = ref('');
const guardandoCategoriaEditada = ref(false);
const categoriaEditando = ref<Categoria | null>(null);

const formularioEditarCategoria = reactive({
    nom_categoria: '',
})

// abre el formulario con los datos de la categoria ya cargados
function abrirFormularioEditar(categoria: Categoria) {
    categoriaEditando.value = categoria;
    formularioEditarCategoria.nom_categoria = categoria.nom_categoria;

    errorFormularioEditar.value = '';
    mostrarFormularioEditar.value = true;
}

//función para reiniciar el formularioEditar
function reiniciarFormularioEditar() {
    formularioEditarCategoria.nom_categoria = '';
    errorFormularioEditar.value = '';
    categoriaEditando.value = null;
}

//función para cerrar el formularioEditar
function cerrarFormularioEditar() {
    mostrarFormularioEditar.value = false;
    reiniciarFormularioEditar();
}

//función async para guardar la edición de la categoria
async function guardarEdicionCategoria() {
    if (!categoriaEditando.value) return;

    guardandoCategoriaEditada.value = true;
    errorFormularioEditar.value = '';

    try {
        await $fetch(`/api/categorias/${categoriaEditando.value.cod_categoria}`, {
            method: 'PUT',
            body: {
                nom_categoria: formularioEditarCategoria.nom_categoria,
            }
        });
        cerrarFormularioEditar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Actualizada correctamente',
            description: 'La categoría ha sido actualizada correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorFormularioEditar.value = getApiErrorMessage(err, 'No se pudo actualizar la categoría.');
    }
    finally {
        guardandoCategoriaEditada.value = false;
    }
}

// ------------------------------------------------------------
// BORRAR CATEGORÍA
// ------------------------------------------------------------
const categoriaBorrar = ref<Categoria | null>(null);
const mostrarConfirmacionBorrar = ref(false);
const borrandoCategoria = ref(false);
const errorBorrar = ref('');

//para confirmar la eliminación de la categoria
function confirmarBorrarCategoria(categoria: Categoria) {
    categoriaBorrar.value = categoria;
    errorBorrar.value = '';
    mostrarConfirmacionBorrar.value = true;
}

//para cerrar confirmación
function cerrarConfirmacionBorrar() {
    mostrarConfirmacionBorrar.value = false;
    categoriaBorrar.value = null;
}

//función async para borrar categoria
async function borrarCategoria() {
    borrandoCategoria.value = true;
    const nombreCategoriaBorrar = categoriaBorrar.value?.nom_categoria;
    try {
        await $fetch(`/api/categorias/${categoriaBorrar.value?.cod_categoria}`, {
            method: 'DELETE'
        })
        cerrarConfirmacionBorrar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Eliminada correctamente',
            description: `Se eliminó correctamente la categoría ${nombreCategoriaBorrar}.`,
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorBorrar.value = getApiErrorMessage(err, 'No se pudo borrar la categoría.');
    }
    finally {
        borrandoCategoria.value = false;
    }
}

// ------------------------------------------------------------
// FILTRO PARA CONSULTAS
// ------------------------------------------------------------
const busqueda = ref('')

// categorias que se muestran, filtradas por el texto del buscador
const categoriasFiltradas = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()
    return (categorias.value ?? []).filter(c =>
        !texto || c.nom_categoria.toLowerCase().includes(texto)
    )
})

function limpiarFiltros() {
    busqueda.value = ''
}

// ------------------------------------------------------------
// PARA LA TABLA
// ------------------------------------------------------------
const columns: TableColumn<Categoria>[] = [
    { accessorKey: 'cod_categoria', header: 'Código', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { accessorKey: 'nom_categoria', header: 'Nombre', meta: { class: { th: 'text-center', td: 'text-center' } } },
    // columnas extras
    { id: 'editar', header: 'Editar', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { id: 'eliminar', header: 'Eliminar', meta: { class: { th: 'text-center', td: 'text-center' } } },
]

const tableMeta = createTableMeta<Categoria>()
</script>

<template>
    <div class="space-y-8">
        <!-- título página + botón agregar categoria -->
        <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
                    CATEGORÍAS
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-7 text-texto/70">
                    Gestor de categorías.
                </p>
            </div>

            <UButton @click="mostrarFormularioAgregar = true"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Agregar categoría
            </UButton>
        </section>

        <!-- Buscador -->
        <UInput v-model="busqueda" icon="i-lucide-search" class="w-full" placeholder="Buscar por nombre..."
            :ui="{ base: 'bg-fondo-general/90 text-texto-formulario focus-visible:ring-boton' }" />

        <!-- Error al cargar -->
        <UAlert v-if="errorCategorias" color="error" variant="subtle" title="No se pudieron cargar las categorías"
            description="Revise que el servidor y MySQL estén encendidos e intente recargar la página." />

        <!-- Cargando -->
        <p v-else-if="cargandoCategorias" class="text-center text-texto/70">Cargando categorías...</p>

        <!-- Sin resultados -->
        <div v-else-if="categoriasFiltradas.length === 0"
            class="rounded-2xl border border-fondo-login bg-fondo-card p-10 text-center space-y-4">
            <p class="text-lg font-semibold text-texto">No hay categorías que coincidan con tu búsqueda.</p>
            <UButton @click="limpiarFiltros"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Limpiar filtros
            </UButton>
        </div>

        <!-- tabla del mantenedor -->
        <section v-else>
            <UTable :data="categoriasFiltradas" :columns="columns" :meta="tableMeta"
                class="rounded-2xl border border-fondo-login bg-fondo-card" :ui="{
                    th: 'text-texto font-bold',
                    td: 'text-texto'
                }">

                <!-- columna extra editar -->
                <template #editar-cell="{ row }">
                    <UButton icon="i-lucide-pencil" size="md" color="neutral" variant="solid"
                        class="bg-boton hover:bg-boton-hover focus:outline-none focus:ring-0 text-texto"
                        @click="abrirFormularioEditar(row.original)" />
                </template>

                <!-- columna extra eliminar -->
                <template #eliminar-cell="{ row }">
                    <UButton icon="i-lucide-trash-2" size="md" color="neutral" variant="solid"
                        class="bg-boton-eliminar hover:bg-boton-eliminar-hover focus:outline-none focus:ring-0 text-white"
                        @click="confirmarBorrarCategoria(row.original)" />
                </template>
            </UTable>
        </section>

        <!-- FORMULARIO PARA AGREGAR CATEGORÍAS -->
        <Popups v-model:open="mostrarFormularioAgregar" title="Agregar categoría">
            <UForm class="space-y-4" :state="formularioNuevaCategoria" :schema="validarCategoria"
                @submit.prevent="guardarCategoria">
                <!-- Nombre categoria -->
                <UFormField label="Nombre" name="nom_categoria" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevaCategoria.nom_categoria" class="w-full" placeholder="Ej: Perros"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <UAlert v-if="errorFormularioAgregar" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormularioAgregar" />

                <!-- botones cancelar y agregar -->
                <div class="flex items-center justify-between gap-4 p-2">
                    <UButton type="button" @click="cerrarFormularioAgregar"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Cancelar
                    </UButton>
                    <UButton type="submit" :loading="guardandoNuevaCategoria"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Agregar Categoría
                    </UButton>
                </div>
            </UForm>
        </Popups>

        <!-- FORMULARIO PARA EDITAR CATEGORÍAS -->
        <Popups v-model:open="mostrarFormularioEditar" title="Editar categoría">
            <UForm class="space-y-4" :state="formularioEditarCategoria" :schema="validarCategoria"
                @submit.prevent="guardarEdicionCategoria">
                <!-- Código (no se puede modificar, es la clave primaria) -->
                <UFormField label="Código" :ui="{ label: colorTextoFormulario }">
                    <UInput :model-value="categoriaEditando?.cod_categoria" disabled class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Nombre categoria -->
                <UFormField label="Nombre" name="nom_categoria" required :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarCategoria.nom_categoria" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <UAlert v-if="errorFormularioEditar" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormularioEditar" />

                <!-- botones cancelar y guardar -->
                <div class="flex items-center justify-between gap-4 p-2">
                    <UButton type="button" @click="cerrarFormularioEditar"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Cancelar
                    </UButton>
                    <UButton type="submit" :loading="guardandoCategoriaEditada"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Guardar Cambios
                    </UButton>
                </div>
            </UForm>
        </Popups>

        <!-- CONFIRMAR BORRAR CATEGORÍA -->
        <Popups v-model:open="mostrarConfirmacionBorrar" title="Borrar categoría"
            :description="categoriaBorrar ? `¿Está seguro que desea borrar la categoría ${categoriaBorrar.nom_categoria}? Esta decisión es permanente` : ''">

            <UAlert v-if="errorBorrar" color="error" variant="subtle" title="No se pudo eliminar"
                :description="errorBorrar" class="mb-4" />

            <div class="flex justify-between items-center gap-6">
                <UButton @click="cerrarConfirmacionBorrar"
                    class="w-full bg-boton text-texto text-center justify-center py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors"
                    type="button">Cancelar</UButton>
                <UButton @click="borrarCategoria"
                    class="w-full bg-boton-eliminar text-white text-center justify-center py-2 px-4 rounded-md hover:bg-boton-eliminar-hover font-bold transition-colors"
                    type="button" :loading="borrandoCategoria">Confirmar</UButton>
            </div>
        </Popups>
    </div>
</template>