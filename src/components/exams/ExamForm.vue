<template>
    <UForm :schema="valiSchema" :state="state" @submit="onSubmit">

        <!-- informações básicas da prova -->
        <div class="grid grid-cols-1 md:grid-cols-2 space-x-2 space-y-2">
            <!-- nome da prova -->
            <UFormField label="Nome" name="name" :ui="formFieldUi" class="me-0 md:me-2">
                <UInput v-model="state.name" :ui="inputUi" class="w-full" placeholder="Nome da prova" />
            </UFormField>

            <!-- Qual turma realizará a prova -->
            <UFormField label="Turma" :ui="formFieldUi" name="classNum">
                <USelect v-model="state.classNum" :items="classItems" class="py-2 w-full bg-white text-black"></USelect>
            </UFormField>
        </div>

        <QuestionForm 
            :questions="questions" 
            :formFieldUi="formFieldUi" 
            :inputUi="inputUi" 
            @addQuestion="addQuestion"
            @removeQuestion="removeQuestion"
            @addOption="addOption"
            @removeOption="removeOption"
            @saveQuestion="saveQuestion"
            @editQuestion="editQuestion"
        />
 
        <div class="flex justify-end">
            <UButton type="submit" color="error">Criar prova</UButton>
        </div>
    </UForm>
</template>

<script setup>
import * as valibot from 'valibot';
import useAxios from '@/composables/useAxios';
import useUserStore from '@/stores/user';
import QuestionForm from './QuestionForm.vue';
import { onMounted, ref } from 'vue';

const user = useUserStore();

// estilos personalidados no nuxt UI
const formFieldUi = {
    label: 'text-black'
}
const inputUi = {
    base: ['bg-white text-black py-2']
}
// items dos selects
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
];
// cuida da validação
const valiSchema = valibot.object({
    // nome da prova
    name: valibot.pipe(valibot.string(), valibot.minLength(5, "Tem que ter no minímo 5 letras")),
    // turma da prova
    classNum: valibot.pipe(valibot.number(), valibot.minValue(1, "É necessário selecionar uma turma")),
});
// states que usamos para manipular os dados
const state = ref({
    name: '',
    available: false,
    classNum: 0
});

// vai conter as questões da prova
const questions = ref([]);

/**
 * Vai criar a prova
 */
const onSubmit = async () => {
    try {
        const result = await useAxios('post', 'exams/', true, {
            author: user.name,
            name: state.value.name,
            available: state.value.available,
            classNum: state.value.classNum
        });

        if (result.data.error) {
            throw new Error(result.data.message);
        }
    } catch (err) {
        console.error("Erro criando prova:", err.message);
    }
}

/**
 * Vai criar uma pergunta
 */
const addQuestion = () => {

    questions.value.push({
        question: "",
        type: "mul",
        editing: true,
        options: ["", "", "", ""]
    });
}

/**
 * Vai remover a pergunta do array de perguntas
 */
const removeQuestion = (index) => {
    questions.value.splice(index, 1);
}

const saveQuestion = (index) => {
    questions.value[index].editing = false;
}

const editQuestion = (index) => {
    questions.value[index].editing = true;
}

/**
 * Adiciona uma alternativa a uma pergunta
 * @param index index da pergunta que vai ser adicionado alternativas
 */
const addOption = (index) => {
    questions.value[index].options.push("");
}

/**
 * Vai apagar uma alternativa de uma pergunta
 * @param index index da pergunta que a alternativa está
 * @param optIndex index da alternativa a ser apagada
 */
const removeOption = (index, optIndex) => {
    questions.value[index].options.splice(optIndex, 1);
}

</script>
