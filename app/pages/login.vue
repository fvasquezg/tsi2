<script setup lang="ts">
import { z } from 'zod'
import { getApiErrorMessage } from '~/utils/getApiErrorMessage';
definePageMeta({
    layout: 'auth'
})

const validarLogin = z.object({
    correo: z.email({ message: 'Debe ingresar un email válido.' }),
})

const iniciandoSesion = ref(false);
const errorFormulario = ref('');

const formularioLogin = reactive({
    correo: '',
    contrasena: ''
});

async function login() {
    iniciandoSesion.value = true;
    errorFormulario.value = '';
    try {
        //revisar credenciales usuario
        await $fetch('/api/auth/empleado/login', {
            method: 'POST',
            body: {
                correo: formularioLogin.correo,
                contrasena: formularioLogin.contrasena
            }
        })
        await fetchSession();
        //redireccionar a la pagina de cuentas
        navigateTo('/index');
    } catch (err: any) {
        errorFormulario.value = getApiErrorMessage(err, "No se pudo iniciar sesión");
    }
    finally {
        iniciandoSesion.value = false;
    }
}

const { fetch: fetchSession } = useUserSession()

const colorFondoCamposFormulario = 'bg-fondo-login-admin/10 text-texto-login-admin/70 ring-2 ring-boton';

</script>

<template>
    <div class="flex min-h-screen items-center justify-center">
        <!-- div donde salen todas las cosas del login -->
        <div
            class="rounded-2xl bg-white flex flex-col items-center px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-8 border-2 border-borde-login-admin shadow-2xl max-w-sm">
            <img src="~/assets/images/logo.webp" alt="Logo de la empresa" class="w-16">
            <h2 class="font-bold text-3xl py-2 text-texto-login-admin">Iniciar Sesión</h2>
            <h2 class="font-bold text-lg py-2 text-texto-login-admin">Acceso exclusivo para empleados</h2>
            <p class="mb-4 text-subtexto-login-admin">Ingrese su correo y contraseña</p>
            <UForm class="space-y-5" :state="formularioLogin" :schema="validarLogin" @submit="login">
                <!-- Ingreso de correo -->
                <UFormField label="Correo Electrónico" name="correo" :ui="{ label: 'text-texto-login-admin' }">
                    <UInput v-model="formularioLogin.correo" class="w-full" placeholder="Ej: correo@gmail.com"
                        :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Ingreso de contraseña -->
                <UFormField label="Contraseña" name="contrasena" :ui="{ label: 'text-texto-login-admin' }">
                    <UInput v-model="formularioLogin.contrasena" type="password" class="w-full"
                        placeholder="Ej: ********" :ui="{ base: colorFondoCamposFormulario }" />
                </UFormField>

                <!-- Mensaje de error  -->
                <p v-if="errorFormulario" class="text-red-500 text-sm text-center">
                    Error, no se ha podido iniciar sesión. Por favor, verifique sus credenciales e intente nuevamente.
                </p>

                <!-- Boton de iniciar sesion -->
                <UButton type="submit" :loading="iniciandoSesion"
                    class="w-full bg-boton text-texto-login-admin text-center justify-center py-2 px-4 rounded-md hover:bg-boton-hover font-bold transition-colors">
                    Iniciar
                    Sesion</UButton>
            </UForm>
        </div>
    </div>
</template>