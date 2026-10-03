<script setup lang="ts">
import type { Producto } from '~/types/producto'
import type { Marca } from '~/types/marca'
import type { Categoria } from '~/types/categoria'

// Datos de lectura inicial (GET) con useFetch, como indican las reglas de la clase
const { data: productos, pending: cargandoProductos, error: errorProductos } = await useFetch<Producto[]>('/api/productos')
const { data: marcas } = await useFetch<Marca[]>('/api/marcas')
const { data: categorias } = await useFetch<Categoria[]>('/api/categorias')

// Filtros
const busqueda = ref('')
const categoriaSeleccionada = ref<number | null>(null)

// Productos que se muestran: solo activos, filtrados por texto y por categoría
const productosFiltrados = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()
    return (productos.value ?? []).filter((p) => {
        const estaActivo = p.activo !== false
        const coincideTexto = !texto
            || p.nom_producto.toLowerCase().includes(texto)
            || p.desc_producto.toLowerCase().includes(texto)
        const coincideCategoria = categoriaSeleccionada.value === null
            || p.categorias?.some(c => c.cod_categoria === categoriaSeleccionada.value)
        return estaActivo && coincideTexto && coincideCategoria
    })
})

// Números para la sección de estadísticas
const totalProductos = computed(() => (productos.value ?? []).filter(p => p.activo !== false).length)
const totalMarcas = computed(() => marcas.value?.length ?? 0)
const totalCategorias = computed(() => categorias.value?.length ?? 0)

// Formatea 42990 como $42.990 (formato chileno)
function formatearPrecio(valor: number | string): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(valor))
}

// Texto y color según el stock
function estadoStock(p: Producto) {
    if (p.stock <= 0) return { texto: 'Agotado', clase: 'bg-boton-eliminar text-white' }
    if (p.stock <= p.stock_critico) return { texto: 'Últimas unidades', clase: 'bg-boton text-texto' }
    return { texto: 'Disponible', clase: 'bg-fondo-general text-texto' }
}

function limpiarFiltros() {
    busqueda.value = ''
    categoriaSeleccionada.value = null
}

// Para bajar al catálogo desde el botón del hero
function irACatalogo() {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
    <div class="space-y-16">

        <!-- HERO -->
        <section class="mx-auto max-w-3xl text-center space-y-6">
            <h1 class="text-4xl font-extrabold tracking-tight text-texto sm:text-6xl">
                Bienvenid@ a PetFood Cartagena
            </h1>
            <p class="text-lg leading-8 text-texto/70">
                Alimento y snacks de calidad para perros y gatos, con las mejores marcas y atención cercana en el
                corazón de Cartagena.
            </p>
            <UButton @click="irACatalogo"
                class="bg-boton hover:bg-boton-hover text-texto py-3 px-6 rounded-md font-bold transition-colors">
                Explorar catálogo
            </UButton>
        </section>

        <!-- ESTADÍSTICAS -->
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-fondo-login bg-fondo-card p-6 text-center">
                <p class="text-4xl font-extrabold text-texto">{{ totalProductos }}</p>
                <p class="mt-1 text-sm font-semibold text-texto/70">Productos disponibles</p>
            </div>
            <div class="rounded-2xl border border-fondo-login bg-fondo-card p-6 text-center">
                <p class="text-4xl font-extrabold text-texto">{{ totalMarcas }}</p>
                <p class="mt-1 text-sm font-semibold text-texto/70">Marcas</p>
            </div>
            <div class="rounded-2xl border border-fondo-login bg-fondo-card p-6 text-center">
                <p class="text-4xl font-extrabold text-texto">{{ totalCategorias }}</p>
                <p class="mt-1 text-sm font-semibold text-texto/70">Categorías</p>
            </div>
        </section>

        <!-- CATÁLOGO -->
        <section id="catalogo" class="space-y-6 scroll-mt-32">
            <div>
                <h2 class="text-3xl font-extrabold tracking-tight text-texto">Nuestro catálogo</h2>
                <p class="mt-2 text-texto/70">Busque un producto o filtre por categoría..</p>
            </div>

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
                <p class="text-lg font-semibold text-texto">No encontramos productos con esos filtros.</p>
                <UButton @click="limpiarFiltros"
                    class="bg-boton hover:bg-boton-hover text-texto py-2 px-4 rounded-md font-bold transition-colors">
                    Limpiar filtros
                </UButton>
            </div>

            <!-- Grilla de productos -->
            <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <article v-for="p in productosFiltrados" :key="p.cod_producto"
                    class="flex flex-col overflow-hidden rounded-2xl border border-fondo-login bg-fondo-card shadow-sm">

                    <!-- Imagen -->
                    <img :src="p.imagen || '/img/default.jpg'" :alt="p.nom_producto"
                        class="h-48 w-full object-cover bg-fondo-general" />

                    <div class="flex flex-1 flex-col gap-3 p-5">
                        <!-- Marca -->
                        <p class="text-xs font-bold uppercase tracking-wide text-texto/70">
                            {{ p.marca?.nom_marca ?? 'Sin marca' }}
                        </p>

                        <h3 class="text-lg font-bold text-texto">{{ p.nom_producto }}</h3>

                        <p class="text-sm text-texto/70 line-clamp-3">{{ p.desc_producto }}</p>

                        <!-- Categorías -->
                        <div class="flex flex-wrap gap-1.5">
                            <span v-for="c in p.categorias ?? []" :key="c.cod_categoria"
                                class="rounded-md bg-fondo-general px-2 py-0.5 text-xs font-semibold text-texto">
                                {{ c.categoria?.nom_categoria }}
                            </span>
                        </div>

                        <!-- Precio y estado de stock (mt-auto lo empuja al fondo de la tarjeta) -->
                        <div class="mt-auto flex items-center justify-between pt-3">
                            <p class="text-2xl font-extrabold text-texto">{{ formatearPrecio(p.precio_unitario) }}</p>
                            <span class="rounded-md px-2 py-1 text-xs font-bold" :class="estadoStock(p).clase">
                                {{ estadoStock(p).texto }}
                            </span>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    </div>
</template>