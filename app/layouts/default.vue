<script setup lang="ts">
const route = useRoute();
const { user, clear } = useUserSession();

// Un link está activo si la ruta coincide exactamente,
// o si estamos dentro de una subruta (ej: /productos/5 activa /productos).
// Para '/' solo cuenta la coincidencia exacta, si no siempre estará activo.
function isActive(to: string): boolean {
    if (to === '/') return route.path === '/'
    return route.path === to || route.path.startsWith(`${to}/`)
}

const navegacion = [
    { label: 'Inicio', to: '/' },
    { label: 'Productos', to: '/productos' },
    { label: 'Marcas', to: '/marcas' },
    { label: 'Perros', to: '/perros' },
    { label: 'Gatos', to: '/gatos' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Gestor productos', to: '/addProductos' },
    { label: 'Login', to: '/login' },
]

// Para logout
async function logout() {
    await $fetch('/api/auth/empleado/logout', {
        method: 'POST'
    });
    await clear();
    await navigateTo('/login');
}
</script>

<template>
    <!-- NAV BAR -->
    <div class="w-full z-50 bg-navbar sticky top-0 px-6 py-6 shadow-xl">
        <!-- para que solo use el contenido dentro de esto -->
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-2 sm:justify-between">
            <!-- TEXTO NAVBAR y para poner logo en caso de que haga falta -->
            <div class="flex flex-col sm:flex-row items-center gap-2 sm:justify-between">
                <img src="~/assets/images/logo.webp" alt="Logo de la empresa" class="w-16">
                <h3 class="text-texto font-bold text-lg">PetFood Cartagena</h3>
            </div>
            <div class="flex flex-col gap-5 sm:flex-row items-center">
                <!-- botones para ir a lugares -->
                <nav class="flex flex-wrap items-center justify-center gap-5">
                    <NuxtLink v-for="link in navegacion" :key="link.label" :to="link.to"
                        class="px-3 py-1 rounded-lg text-sm transition-colors" :class="isActive(link.to)
                            ? 'bg-boton text-texto-login-admin font-bold'
                            : 'text-texto font-semibold hover:bg-boton-hover'">
                        {{ link.label }}
                    </NuxtLink>
                </nav>
                <!-- Donde sale el nombre de usuario y boton cerrar sesión -->
                <div class="gap-5 flex items-center">
                    <!-- Nombre y rol: se muestra para cualquiera con sesión iniciada -->
                    <div v-if="user" class="flex flex-col rounded-md border-2 border-boton px-4 py-2">
                        <span class="text-texto text-md">{{ user.nombres }} {{ user.ap_paterno }} {{ user.ap_materno
                        }}</span>
                        <span class="text-texto/70 text-sm">{{ user.tipo_cuenta === 1 ? 'Administrador' : 'Empleado'
                            }}</span>
                    </div>

                    <UButton v-if="user" @click="logout"
                        class="bg-amber-200 text-texto py-2 px-4 rounded-xl hover:bg-amber-300 text-md font-bold transition-colors">
                        Cerrar Sesion
                    </UButton>
                </div>
            </div>
        </div>
    </div>

    <main class="bg-fondo-general/95 min-h-screen">
        <div class="class= max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
            <slot />
        </div>
    </main>

    <footer class="bg-fondo-general py-6 mt-auto bottom-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p class="text-center text-sm text-texto/70">Copyright &copy; 2026 PetFood Cartagena
                <br>Víctor Alfonso Maulen Pávez
                <br>Aconcagua 574, Cartagena, Región de Valparaíso, Chile
                <br>Aviso Legal
            </p>
        </div>
    </footer>

</template>