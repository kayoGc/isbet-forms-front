<template>
    <UForm :schema="valiSchema" :state="state" @submit="onSubmit">
        
        <div class="grid grid-cols-2 space-x-2 space-y-2">
            <!-- nome da prova -->
            <UFormField label="Nome" name="name" :ui="formFieldUi">
                <UInput v-model="state.name" :ui="inputUi" class="w-full" placeholder="Nome da prova"></UInput>
            </UFormField>
            
            <!-- Qual turma realizará a prova -->
            <UFormField label="Turma" :ui="formFieldUi" class="me-0">
                <USelect v-model="state.classNum" :items="classItems" name="classNum" class="py-2 w-full bg-white text-black"></USelect>
            </UFormField>

            <!-- se está disponivel -->
            <div>
                <UCheckbox v-model="state.available" name="available" label="Disponivel para realização" :ui="formFieldUi"/>
            </div>

        </div>
        <div class="flex justify-end">
            <UButton type="submit" color="error">Criar prova</UButton>
        </div>
    </UForm>
</template>

<script setup>
import * as valibot from 'valibot';
import useAxios from '@/composables/useAxios';
import useUserStore from '@/stores/user';
import { ref } from 'vue';

const formFieldUi = {
    label: 'text-black'
}

const inputUi = {
    base: ['bg-white text-black py-2']
}

const user = useUserStore();
const classItems = [
    {
        label: "Selecione uma turma",
        value: 0
    },
    {
        label: "Santo Amaro sala 2",
        value: 1
    },
    {
        label: "Santo Amaro sala 1",
        value: 2
    }
]

// cuida da validação
const valiSchema = valibot.object({
    name: valibot.pipe(valibot.string(), valibot.minLength(5, "tem que ter no minímo 5 letras")),
    available: valibot.pipe(valibot.boolean()),
    classNum: valibot.pipe(valibot.number(), valibot.minValue(1, "É necessário selecionar uma turma"))
});

const state = ref({
    name: '',
    available: false,
    classNum: 0
});

const onSubmit = async () => {
    try {
        const result = await useAxios('post', 'exams/', {
            author: user.name,
            name: state.value.name,
            available: state.value.available,
            classNum: state.value.classNum
        });

        console.log(result);
    } catch (err) {
        console.error("Erro criando prova:", err.message);
    }
}
</script>