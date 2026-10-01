<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Producto } from '~/types/producto';

//imports

//definPageMeta // Para solo darle acceso al administrador/empleadss a esta pagina

//constValidarCrearProducto = z.object

// para tomar la informacion de los productos en la tabla producto
const { data: productos, pending, error, refresh } = await useFetch<Producto[]>('/api/productos')

// Agregar usuario
const mostrarFormularioAgregar = ref(false);
const errorFormularioAgregar = ref('');
const guardandoNuevoProducto = ref(false);

//formulario nuevoProducto
const formularioNuevoProducto = reactive({})

//función para reiniciar el formularioAgregar
function reiniciarFormularioAgregar() { }

//función para cerrar el formularioAgregar
function cerrarFormularioAgregar() {
    mostrarFormularioAgregar.value = false;
    reiniciarFormularioAgregar();
}

//función async para guardar nuevo producto
async function guardarProducto() { }

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
}

//para confirmar la elimincación del producto
function confirmarBorrarProducto(producto: Producto) {
    productoBorrar.value = producto;
    mostrarConfirmacionBorrar.value = true;
}
//para cerrar confirmación
function cerrarConfirmacionBorrar() {
    mostrarConfirmacionBorrar.value = false;
    productoBorrar.value = null;
}

//PARA LA TABLA
const columns: TableColumn<Producto>[] = []

const tableMeta = createTableMeta<Producto>()
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
        <!-- tabla de usuarios/mantenedor con sus botones en una columna -->
        <section>
            <UTable :data="productos" :columns="columns" :meta="tableMeta"
                class="rounded-2xl border border-fondo-login bg-fondo-card" :ui="{
                    th: 'text-texto font-bold',
                    td: 'text-texto'
                }">

                <!-- columna extra -->
                <template #eliminar-cell="{ row }">
                    <UButton icon="i-lucide-trash-2" size="md" color="neutral" variant="solid"
                        class="bg-boton-eliminar hover:bg-boton-eliminar-hover focus:outline-none focus:ring-0 text-white"
                        @click="confirmarBorrarProducto(row.original)" />
                </template>
            </UTable>
        </section>
        <!-- FORMULARIO PARA AGREGAR PRODUCTOS -->




        <!-- MODAL PARA ELIMINAR PRODUCTOS -->
        <!-- CONFIRMAR BORRAR PRODUCTO -->
        <Popups v-model:open="mostrarConfirmacionBorrar" title="Borrar administrador"
            :description="productoBorrar ? `¿Estas seguro que deseas borrar a ${productoBorrar.nom_producto} ${productoBorrar.cod_producto}? Esta decisión es permanente` : ''">
            <!-- div con los 2 botones para cancelar o confirmar -->
            <div class="flex justify-between items-center gap-6">
                <!-- cancelar -->
                <UButton @click="cerrarConfirmacionBorrar"
                    class="w-full bg-boton text-texto text-center justify-center py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors"
                    type="button">Cancelar</UButton>
                <!-- confirmar -->
                <UButton @click="productoBorrar"
                    class="w-full bg-boton-eliminar text-white text-center justify-center py-2 px-4 rounded-md hover:bg-boton-eliminar-hover font-bold transition-colors"
                    type="button" :loading="borrandoProducto">Confirmar</UButton>
            </div>
        </Popups>
    </div>
</template>