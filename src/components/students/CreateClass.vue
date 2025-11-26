<template>
    <UModal
        :close="{ onClick: () => emits('close', null) }"
        title="Criar turma"
        description="Cria uma nova turma"
        :ui="uiModal"
    >
        <template #body>

            <div>
                <label for="in-text-class">Nome da turma:</label>

                <UInput 
                    id="in-text-class"
                    type="text"
                    v-model="className"
                    class="w-full bg-white text-black mt-1"
                    placeholder="Nome da turma"
                    :ui="uiInput"
                />
            </div>

        </template>

        <template #footer>
            <div class="flex justify-end gap-2 w-full">
                <UButton 
                    color="secondary"
                    label="Cancelar"
                    icon="i-lucide-x"
                    class="cursor-pointer"
                    @click="emits('close')"
                />

                <UButton 
                    color="error"
                    label="Criar"
                    icon="i-lucide-plus"
                    class="cursor-pointer"
                    @click="createClass"
                />
            </div>
        </template>
    </UModal>
</template>

<script setup>
import classService from '@/services/class-service';
import { onMounted, ref } from 'vue';

const className = ref("");
const emits = defineEmits(['close'])
const uiModal = {
    header: 'bg-red-600 p-3 text-white',
    close: 'hover:bg-red-400 hover:text-black text-white cursor-pointer',
    content: 'bg-white text-black',
    description: 'text-black'
};
const uiInput = {
    base: ['bg-white text-black py-2']
}

/**
 * Vai criar a classe
 */
const createClass = async () => {
    try {
        const { success, error } = await classService.post({ name: className.value });

        if (!success) {
            throw new Error(error);
        }

        emits("close", { success: true });
    } catch (err) {
        console.error(`Falha criando turma: ${err.message}`);

        emits("close", { success: false });
    }
}
</script>