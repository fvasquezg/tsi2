            <!-- PENDIENTE PARA PERSONALIZAR -->
<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

defineProps<{
    title: string
    description?: string
}>()
</script>

<template>
    <UModal v-model:open="open" :title="title" :description="description" :ui="{
        content: 'bg-fondo-formulario border-2 border-boton-hover text-texto/70',
        header: 'bg-fondo-formulario',
        title: 'text-texto-formulario font-bold text-lg',
        description: 'text-texto-formulario',
        body: 'bg-fondo-formulario',
        footer: 'bg-fondo-formulario'
    }">
        <template #body>
            <slot />
        </template>
    </UModal>
</template>