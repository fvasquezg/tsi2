<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Producto } from '~/types/producto';
import type { Marca } from '~/types/marca';
import type { Categoria } from '~/types/categoria';
import { z } from 'zod';

//definPageMeta -->   definePageMeta({middleware: ['RELLENAR']})
definePageMeta({
    middleware: ['empleado']
})

//constValidarCrearProducto = z.object
const validarCrearProducto = z.object({
    nom_producto: z.string().min(3, 'Debe ingresar nombre del producto'),
    desc_producto: z.string().min(6, 'Debe ingresar una descripción'),
    stock: z.coerce.number({ message: 'Debe ser un número' }).int().min(0, 'No puede ser negativo'),
    stock_critico: z.coerce.number({ message: 'Debe ser un número' }).int().min(0),
    precio_unitario: z.coerce.number({ message: 'Debe ser un número' }).min(1, 'Debe ser mayor a 0'),
    //PENDIENTES DE REVISAR CÓMO DEBEN SER
    cod_marca: z.number({ message: 'Debe seleccionar una marca' }),
    categorias: z.array(z.number()).min(1, 'Debe seleccionar al menos una categoría'),
})

// para tomar la informacion de los productos en la tabla producto
const { data: productos, pending: cargandoProductos, error: errorProductos, refresh } = await useFetch<Producto[]>('/api/productos')

//const { data: productos, pending, error, refresh } = await useFetch<Producto[]>('/api/productos')
const { data: marcas } = await useFetch<Marca[]>('/api/marcas')
const { data: categorias } = await useFetch<Categoria[]>('/api/categorias')

// Agregar usuario
const mostrarFormularioAgregar = ref(false);
const errorFormularioAgregar = ref('');
const guardandoNuevoProducto = ref(false);

//formulario nuevoProducto
const formularioNuevoProducto = reactive({
    nom_producto: '',
    desc_producto: '',
    stock: undefined as number | undefined,
    stock_critico: undefined as number | undefined,
    precio_unitario: undefined as number | undefined,
    cod_marca: undefined as number | undefined,
    categorias: [] as number[],
})

//función para reiniciar el formularioAgregar
function reiniciarFormularioAgregar() {
    formularioNuevoProducto.nom_producto = '';
    formularioNuevoProducto.desc_producto = '';
    formularioNuevoProducto.stock = undefined;
    formularioNuevoProducto.stock_critico = undefined;
    formularioNuevoProducto.precio_unitario = undefined;
    //PENDIENTES DE REVISAR CÓMO DEBEN SER
    formularioNuevoProducto.cod_marca = undefined;
    formularioNuevoProducto.categorias = [];

    archivoImagen.value = null;
    errorFormularioAgregar.value = '';
}

//función para cerrar el formularioAgregar
function cerrarFormularioAgregar() {
    mostrarFormularioAgregar.value = false;
    reiniciarFormularioAgregar();
}

// Para la imagen
const archivoImagen = ref<File | null>(null)

//función async para guardar nuevo producto
async function guardarProducto() {
    guardandoNuevoProducto.value = true;
    errorFormularioAgregar.value = '';

    try {
        let nombreArchivo = '';
        let archivoBase64 = '';
        if (archivoImagen.value) {
            nombreArchivo = archivoImagen.value.name
            archivoBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
                reader.readAsDataURL(archivoImagen.value!)
            })
        }

        await $fetch('/api/productos', {
            method: 'POST',
            body: {
                nom_producto: formularioNuevoProducto.nom_producto,
                desc_producto: formularioNuevoProducto.desc_producto,
                stock: formularioNuevoProducto.stock,
                stock_critico: formularioNuevoProducto.stock_critico,
                precio_unitario: formularioNuevoProducto.precio_unitario,
                cod_marca: formularioNuevoProducto.cod_marca,
                categorias: formularioNuevoProducto.categorias,

                nombreArchivo: nombreArchivo,
                archivoBase64: archivoBase64,
            }
        });
        cerrarFormularioAgregar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Agregado correctamente',
            description: 'El producto ha sido agregado correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorFormularioAgregar.value = getApiErrorMessage(err, 'No se pudo agregar el producto.');
    }
    finally {
        guardandoNuevoProducto.value = false;
    }
}

//para los colores de los campos del formulario PENDIENTE CAMBIAR COLORES
const colorTextoFormulario = 'text-texto-formulario';
const colorFondoCamposFormulario = 'bg-fondo-general/90 text-texto-formulario';

//lo necesario para borrar un producto
const productoBorrar = ref<Producto | null>(null);
const mostrarConfirmacionBorrar = ref(false);
const borrandoProducto = ref(false);
const errorBorrar = ref('');

//función async para borrar producto
async function borrarProducto() {
    borrandoProducto.value = true;
    const nombreProductoBorrar = productoBorrar.value?.nom_producto;
    try {
        await $fetch(`/api/productos/${productoBorrar.value?.cod_producto}`, {
            //PENDIENTE
            method: 'DELETE'
        })
        cerrarConfirmacionBorrar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Eliminado correctamente',
            description: `Se elimino correctamente el producto ${nombreProductoBorrar}.`,
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })

    } catch (err: any) {
        errorBorrar.value = getApiErrorMessage(err, 'No se pudo borrar el producto.');
    }
    finally {
        borrandoProducto.value = false;
    }
}

//para confirmar la elimincación del producto
function confirmarBorrarProducto(producto: Producto) {
    productoBorrar.value = producto;
    mostrarConfirmacionBorrar.value = true;
    errorBorrar.value = '';
}
//para cerrar confirmación
function cerrarConfirmacionBorrar() {
    mostrarConfirmacionBorrar.value = false;
    productoBorrar.value = null;
}

//PARA LA TABLA
const columns: TableColumn<Producto>[] = [
    { accessorKey: 'cod_producto', header: 'Código', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { accessorKey: 'nom_producto', header: 'Nombre', meta: { class: { th: 'text-center', td: 'text-center' } } },
    {
        accessorKey: 'desc_producto',
        header: 'Descripción',
        meta: { class: { th: 'text-center', td: 'text-center max-w-48 truncate' } },
        cell: ({ row }) => h('span', { title: row.original.desc_producto }, row.original.desc_producto)
    },
    { accessorKey: 'stock', header: 'Stock', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { accessorKey: 'stock_critico', header: 'Stock Crítico', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { accessorKey: 'precio_unitario', header: 'Precio Unitario', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { accessorKey: 'marca.nom_marca', header: 'Marca', meta: { class: { th: 'text-center', td: 'text-center' } } },
    {
        accessorKey: 'categorias',
        header: 'Categorías',
        meta: { class: { th: 'text-center', td: 'text-center' } },
        cell: ({ row }) =>
            row.original.categorias?.map(c => c.categoria?.nom_categoria).join(', ') || 'Sin categorías'
    },
    // columnas extras
    { id: 'editar', header: 'Editar', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { id: 'eliminar', header: 'Eliminar', meta: { class: { th: 'text-center', td: 'text-center' } } },
    { id: 'activo', header: 'Estado', meta: { class: { th: 'text-center', td: 'text-center' } } },
]

const tableMeta = createTableMeta<Producto>()



// TODO LO QUE ES EDITAR COMO TAL
const mostrarFormularioEditar = ref(false);
const errorFormularioEditar = ref('');
const guardandoProductoEditado = ref(false);
const productoEditando = ref<Producto | null>(null);

//formulario editarProducto
const formularioEditarProducto = reactive({
    nom_producto: '',
    desc_producto: '',
    stock: undefined as number | undefined,
    stock_critico: undefined as number | undefined,
    precio_unitario: undefined as number | undefined,
    cod_marca: undefined as number | undefined,
    categorias: [] as number[],
})

// Para la imagen (editar)
const archivoImagenEditar = ref<File | null>(null)

// Validacione s zod para editar el produtco
const validarEditarProducto = z.object({
    nom_producto: z.string().min(3, 'Debe ingresar nombre del producto'),
    desc_producto: z.string().min(6, 'Debe ingresar una descripción'),
    stock: z.coerce.number({ message: 'Debe ser un número' }).int().min(0, 'No puede ser negativo'),
    stock_critico: z.coerce.number({ message: 'Debe ser un número' }).int().min(0),
    precio_unitario: z.coerce.number({ message: 'Debe ser un número' }).min(1, 'Debe ser mayor a 0'),
    cod_marca: z.number({ message: 'Debe seleccionar una marca' }),
    categorias: z.array(z.number()).min(1, 'Debe seleccionar al menos una categoría'),
})

// Esto es para que cuando se abra un producto se abra con las cosas cargadas
function abrirFormularioEditar(producto: Producto) {
    productoEditando.value = producto;
    formularioEditarProducto.nom_producto = producto.nom_producto;
    formularioEditarProducto.desc_producto = producto.desc_producto;
    formularioEditarProducto.stock = producto.stock;
    formularioEditarProducto.stock_critico = producto.stock_critico;
    formularioEditarProducto.precio_unitario = producto.precio_unitario;
    formularioEditarProducto.cod_marca = producto.cod_marca;
    formularioEditarProducto.categorias = producto.categorias?.map(c => c.cod_categoria) ?? [];

    archivoImagenEditar.value = null;
    errorFormularioEditar.value = '';
    mostrarFormularioEditar.value = true;
}

//función para reiniciar el formularioEditar
function reiniciarFormularioEditar() {
    formularioEditarProducto.nom_producto = '';
    formularioEditarProducto.desc_producto = '';
    formularioEditarProducto.stock = undefined;
    formularioEditarProducto.stock_critico = undefined;
    formularioEditarProducto.precio_unitario = undefined;
    formularioEditarProducto.cod_marca = undefined;
    formularioEditarProducto.categorias = [];

    archivoImagenEditar.value = null;
    errorFormularioEditar.value = '';
    productoEditando.value = null;
}

//función para cerrar el formularioEditar
function cerrarFormularioEditar() {
    mostrarFormularioEditar.value = false;
    reiniciarFormularioEditar();
}

//función async para guardar la edición del producto
async function guardarEdicionProducto() {
    if (!productoEditando.value) return;

    guardandoProductoEditado.value = true;
    errorFormularioEditar.value = '';

    try {
        let nombreArchivo = '';
        let archivoBase64 = '';
        if (archivoImagenEditar.value) {
            nombreArchivo = archivoImagenEditar.value.name
            archivoBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
                reader.readAsDataURL(archivoImagenEditar.value!)
            })
        }

        await $fetch(`/api/productos/${productoEditando.value.cod_producto}`, {
            method: 'PUT',
            body: {
                nom_producto: formularioEditarProducto.nom_producto,
                desc_producto: formularioEditarProducto.desc_producto,
                stock: formularioEditarProducto.stock,
                stock_critico: formularioEditarProducto.stock_critico,
                precio_unitario: formularioEditarProducto.precio_unitario,
                cod_marca: formularioEditarProducto.cod_marca,
                categorias: formularioEditarProducto.categorias,

                nombreArchivo: nombreArchivo,
                archivoBase64: archivoBase64,
            }
        });
        cerrarFormularioEditar();
        await refresh();

        useToast().add({
            duration: 3000,
            title: 'Actualizado correctamente',
            description: 'El producto ha sido actualizado correctamente.',
            ui: {
                root: 'bg-fondo-card border border-fondo-login',
                title: 'text-texto font-bold',
                description: 'text-texto-formulario'
            }
        })
    } catch (err: any) {
        errorFormularioEditar.value = getApiErrorMessage(err, 'No se pudo actualizar el producto.');
    }
    finally {
        guardandoProductoEditado.value = false;
    }
}

// Ahora todo lo que es cambiar el estado de un producto
// para controlar el estado de guardado mientras se cambia el switch de una fila
const cambiandoEstado = ref<number | null>(null);

//función async para activar o desactivar un producto
async function cambiarEstadoProducto(producto: Producto, nuevoEstado: boolean) {
    cambiandoEstado.value = producto.cod_producto;

    try {
        await $fetch(`/api/productos/${producto.cod_producto}/activo`, {
            method: 'PATCH',
            body: { activo: nuevoEstado }
        });
        await refresh();

        useToast().add({
            duration: 3000,
            title: nuevoEstado ? 'Producto activado' : 'Producto desactivado',
            description: `El producto ${producto.nom_producto} se ${nuevoEstado ? 'activó' : 'desactivó'}.`,
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

//FILTRO PARA CONSULTAS
// Filtros
const busqueda = ref('')
const categoriaSeleccionada = ref<number | null>(null)

// Productos que se muestran: filtrados por texto y por categoría (incluye inactivos)
const productosFiltrados = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()
    return (productos.value ?? []).filter((p) => {
        const coincideTexto = !texto
            || p.nom_producto.toLowerCase().includes(texto)
            || p.desc_producto.toLowerCase().includes(texto)
        const coincideCategoria = categoriaSeleccionada.value === null
            || p.categorias?.some(c => c.cod_categoria === categoriaSeleccionada.value)
        return coincideTexto && coincideCategoria
    })
})

function limpiarFiltros() {
    busqueda.value = ''
    categoriaSeleccionada.value = null
}

</script>
<template>
    <div class="space-y-8">
        <!-- título página + botón agregar producto -->
        <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <!-- TEXTOS A LA IZQUIERDA -->
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
                    PRODUCTOS
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-7 text-texto/70">
                    Gestor de productos.
                </p>
            </div>

            <!-- BOTON -->
            <UButton @click="mostrarFormularioAgregar = true"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Agregar
                producto</UButton>
        </section>

        <!-- Buscador -->
        <UInput v-model="busqueda" icon="i-lucide-search" class="w-full"
            placeholder="Buscar por nombre o descripción..."
            :ui="{ base: 'bg-fondo-general/90 text-texto-formulario focus-visible:ring-boton' }" />

        <!-- Botones de categorías -->
        <div class="flex flex-wrap gap-2">
            <button type="button" @click="categoriaSeleccionada = null"
                class="px-4 py-1.5 rounded-lg text-sm transition-colors" :class="categoriaSeleccionada === null
                    ? 'bg-boton text-texto-login-admin font-bold'
                    : 'bg-fondo-card border border-fondo-login text-texto font-semibold hover:bg-boton-hover'">
                Todos
            </button>
            <button v-for="cat in categorias ?? []" :key="cat.cod_categoria" type="button"
                @click="categoriaSeleccionada = cat.cod_categoria"
                class="px-4 py-1.5 rounded-lg text-sm transition-colors" :class="categoriaSeleccionada === cat.cod_categoria
                    ? 'bg-boton text-texto-login-admin font-bold'
                    : 'bg-fondo-card border border-fondo-login text-texto font-semibold hover:bg-boton-hover'">
                {{ cat.nom_categoria }}
            </button>
        </div>

        <!-- Error al cargar -->
        <UAlert v-if="errorProductos" color="error" variant="subtle" title="No se pudieron cargar los productos"
            description="Revise que el servidor y MySQL estén encendidos e intente recargar la página." />

        <!-- Cargando -->
        <p v-else-if="cargandoProductos" class="text-center text-texto/70">Cargando productos...</p>

        <!-- Sin resultados -->
        <div v-else-if="productosFiltrados.length === 0"
            class="rounded-2xl border border-fondo-login bg-fondo-card p-10 text-center space-y-4">
            <p class="text-lg font-semibold text-texto">No hay productos que coincidan con tu búsqueda.</p>
            <UButton @click="limpiarFiltros"
                class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                Limpiar filtros
            </UButton>
        </div>

        <!-- tabla de usuarios/mantenedor con sus botones en una columna -->
        <section v-else>
            <UTable :data="productosFiltrados" :columns="columns" :meta="tableMeta"
                class="rounded-2xl border border-fondo-login bg-fondo-card" :ui="{
                    th: 'text-texto font-bold px-2 py-3 text-xs',
                    td: 'text-texto px-2 py-3 text-sm'
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
                        @click="confirmarBorrarProducto(row.original)" />
                </template>

                <!-- columna extra activar desactivar -->
                <template #activo-cell="{ row }">
                    <USwitch :model-value="row.original.activo" :loading="cambiandoEstado === row.original.cod_producto"
                        :disabled="cambiandoEstado === row.original.cod_producto"
                        @update:model-value="(valor) => cambiarEstadoProducto(row.original, valor)" color="primary" />
                </template>

            </UTable>
        </section>
        <!-- FORMULARIO PARA AGREGAR PRODUCTOS -->
        <Popups v-model:open="mostrarFormularioAgregar" title="Agregar producto">
            <UForm class="space-y-4" :state="formularioNuevoProducto" :schema="validarCrearProducto"
                @submit.prevent="guardarProducto">
                <!-- Nombre producto -->
                <UFormField label="Nombre" name="nom_producto" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoProducto.nom_producto" class="w-full"
                        placeholder="Ej: Master Cat Salmón Adultos 20 KG" :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Descripción -->
                <UFormField label="Descripción producto" name="desc_producto" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoProducto.desc_producto" class="w-full"
                        placeholder="Ej: Contiene fibras naturales que promueven una digestión sana y estimulan el desplazamiento de las bolas de pelo a través del sistema digestivo, previniendo el estreñimiento en tu gato. Además contiene Omega 3 que permite mantener una piel sana y un pelaje brillante."
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Stock -->
                <UFormField label="Stock" name="stock" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoProducto.stock" class="w-full" placeholder="Ej: 140"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Stock crítico -->
                <UFormField label="Stock crítico" name="stock_critico" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoProducto.stock_critico" class="w-full" placeholder="Ej: 20"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Precio unitario -->
                <UFormField label="Precio unitario" name="precio_unitario" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioNuevoProducto.precio_unitario" class="w-full" placeholder="Ej: 42990"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Cod marca -->
                <UFormField label="Marca" name="cod_marca" :ui="{ label: colorTextoFormulario }">
                    <USelectMenu v-model="formularioNuevoProducto.cod_marca" :items="marcas ?? []" value-key="cod_marca"
                        label-key="nom_marca" placeholder="Seleccione una marca" class="w-full" :ui="{
                            base: colorFondoCamposFormulario + ' hover:bg-fondo-general hover:ring-boton transition-colors',
                            content: 'bg-fondo-card border border-fondo-login',
                            item: 'text-texto data-highlighted:before:bg-boton/30'
                        }" />
                </UFormField>
                <!-- Categorías (selección múltiple) -->
                <UFormField label="Categorías" name="categorias" :ui="{ label: colorTextoFormulario }">
                    <USelectMenu v-model="formularioNuevoProducto.categorias" :items="categorias ?? []" multiple
                        value-key="cod_categoria" label-key="nom_categoria"
                        placeholder="Seleccione una o más categorías" class="w-full" :ui="{
                            base: colorFondoCamposFormulario + ' hover:bg-fondo-general hover:ring-boton transition-colors',
                            content: 'bg-fondo-card border border-fondo-login',
                            item: 'text-texto data-highlighted:before:bg-boton/30'
                        }" />
                </UFormField>

                <!-- COSITO PARA AGREGAR IMAGEN -->
                <UFormField label="Imagen" name="imagen" :ui="{ label: colorTextoFormulario }">
                    <UFileUpload v-model="archivoImagen" accept="image/*" label="Agregue su imagen" class="w-full" :ui="{
                        base: 'bg-fondo-general/90 hover:bg-fondo-general/70 transition-colors',
                        label: 'text-texto'
                    }" />
                </UFormField>
                <UAlert v-if="errorFormularioAgregar" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormularioAgregar" />

                <!-- div de botones cancelar y agregar -->
                <div class="flex items-center justify-between gap-4 p-2">
                    <!-- Boton cancelar -->
                    <UButton type="button" @click="cerrarFormularioAgregar"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Cancelar
                    </UButton>

                    <!-- Boton agregar -->
                    <UButton type="submit" :loading="guardandoNuevoProducto"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Agregar Producto
                    </UButton>
                </div>
            </UForm>
        </Popups>



        <!-- MODAL PARA ELIMINAR PRODUCTOS -->
        <!-- CONFIRMAR BORRAR PRODUCTO -->
        <Popups v-model:open="mostrarConfirmacionBorrar" title="Borrar producto"
            :description="productoBorrar ? `¿Está seguro que desea borrar el producto ${productoBorrar.nom_producto}? Esta decisión es permanente` : ''">

            <!-- Ualert por si falla algo al borrar -->
            <UAlert v-if="errorBorrar" color="error" variant="subtle" title="No se pudo eliminar"
                :description="errorBorrar" class="mb-4" />


            <!-- div con los 2 botones para cancelar o confirmar -->
            <div class="flex justify-between items-center gap-6">
                <!-- cancelar -->
                <UButton @click="cerrarConfirmacionBorrar"
                    class="w-full bg-boton text-texto text-center justify-center py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors"
                    type="button">Cancelar</UButton>
                <!-- confirmar -->
                <UButton @click="borrarProducto"
                    class="w-full bg-boton-eliminar text-white text-center justify-center py-2 px-4 rounded-md hover:bg-boton-eliminar-hover font-bold transition-colors"
                    type="button" :loading="borrandoProducto">Confirmar</UButton>
            </div>
        </Popups>

        <!-- MODAL PARA ACTUALIZAR PRODUCTOS -->
        <Popups v-model:open="mostrarFormularioEditar" title="Editar producto">
            <UForm class="space-y-4" :state="formularioEditarProducto" :schema="validarEditarProducto"
                @submit.prevent="guardarEdicionProducto">
                <!-- Nombre producto -->
                <UFormField label="Nombre" name="nom_producto" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarProducto.nom_producto" class="w-full"
                        placeholder="Ej: Master Cat Salmón Adultos 20 KG" :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Descripción -->
                <UFormField label="Descripción producto" name="desc_producto" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarProducto.desc_producto" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Stock -->
                <UFormField label="Stock" name="stock" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarProducto.stock" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Stock crítico -->
                <UFormField label="Stock crítico" name="stock_critico" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarProducto.stock_critico" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Precio unitario -->
                <UFormField label="Precio unitario" name="precio_unitario" :ui="{ label: colorTextoFormulario }">
                    <UInput v-model="formularioEditarProducto.precio_unitario" class="w-full"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>
                <!-- Cod marca -->
                <UFormField label="Marca" name="cod_marca" :ui="{ label: colorTextoFormulario }">
                    <USelectMenu v-model="formularioEditarProducto.cod_marca" :items="marcas ?? []"
                        value-key="cod_marca" label-key="nom_marca" placeholder="Seleccione una marca" class="w-full"
                        :ui="{
                            base: colorFondoCamposFormulario + ' hover:bg-fondo-general hover:ring-boton transition-colors',
                            content: 'bg-fondo-card border border-fondo-login',
                            item: 'text-texto data-highlighted:before:bg-boton/30'
                        }" />
                </UFormField>
                <!-- Categorías (selección múltiple) -->
                <UFormField label="Categorías" name="categorias" :ui="{ label: colorTextoFormulario }">
                    <USelectMenu v-model="formularioEditarProducto.categorias" :items="categorias ?? []" multiple
                        value-key="cod_categoria" label-key="nom_categoria"
                        placeholder="Seleccione una o más categorías" class="w-full" :ui="{
                            base: colorFondoCamposFormulario + ' hover:bg-fondo-general hover:ring-boton transition-colors',
                            content: 'bg-fondo-card border border-fondo-login',
                            item: 'text-texto data-highlighted:before:bg-boton/30'
                        }" />
                </UFormField>

                <!-- COSITO PARA AGREGAR IMAGEN -->
                <UFormField label="Imagen nueva (opcional)" name="imagen" :ui="{ label: colorTextoFormulario }">
                    <UFileUpload v-model="archivoImagenEditar" accept="image/*"
                        label="Deje vacío para mantener la imagen actual" class="w-full" :ui="{
                            base: 'bg-fondo-general/90 hover:bg-fondo-general/70 transition-colors',
                            label: 'text-texto'
                        }" />
                </UFormField>
                <UAlert v-if="errorFormularioEditar" color="error" variant="subtle" title="No se pudo guardar"
                    :description="errorFormularioEditar" />

                <!-- div de botones cancelar y guardar -->
                <div class="flex items-center justify-between gap-4 p-2">
                    <!-- Boton cancelar -->
                    <UButton type="button" @click="cerrarFormularioEditar"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Cancelar
                    </UButton>

                    <!-- Boton guardar -->
                    <UButton type="submit" :loading="guardandoProductoEditado"
                        class="bg-boton text-texto py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                        Guardar Cambios
                    </UButton>
                </div>
            </UForm>
        </Popups>
    </div>
</template>