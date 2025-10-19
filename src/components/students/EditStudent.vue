<template>
    <UModal
        :close="{ onClick: () => emits('close') }"
        :title="`Editar ${userData.name ? userData.name.split(' ').slice(0, 2).join(' ') : 'aluno'}`"
        description="Edite os dados do aluno"
        :ui="uiModal"
    >
        <template #body>
            Turma: {{ userData.class ? userData.class : 'Sem turma' }}
        </template>
    </UModal>
</template>

<script setup>
const props = defineProps(['userData']);
const emits = defineEmits(["close"]);
const uiModal = {
    header: 'bg-red-600 p-3 text-white',
    close: 'hover:bg-red-400 hover:text-black text-white cursor-pointer',
    content: 'bg-white text-black',
    description: 'text-black'

}
</script>