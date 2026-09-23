<script setup lang="ts">
//Para ver página actual y las disponibles
const route = useRoute();
const isActive = (to: String) => route.path === to;
const { user, clear } = useUserSession();


const navegacion = [
    { label: 'Inicio', to: '/' },
    { label: 'Login', to: '/Login' },
]

</script>

<template>
    <!-- NAV BAR -->
    <div class="w-full z-50 bg-fondo-general sticky top-0 px-6 py-6 shadow-xl">
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
                    <NuxtLink v-for="link in navegacion" :key="link.to" :to="link.to"
                        :class="isActive(link.to) ? 'bg-boton text-texto font-bold' : 'text-texto/70 hover:bg-boton font-semibold'"
                        class="text-sm py-1 px-2 rounded-xl">
                        {{ link.label }}
                    </NuxtLink>
                </nav>
                <!-- Donde sale el nombre de usuario y boton cerrar sesión -->
                <div class="gap-5 flex items-center">
                    <!-- Nombre y rol -->
                    <div></div>

                    <!-- uboton cerrar sesion-->
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