<template>
    <UForm :schema="valiSchema" :state="state" @submit="onSubmit">

        <!-- informações básicas da prova -->
        <div class="grid grid-cols-1 space-x-2 space-y-2">
            <!-- nome da prova -->
            <UFormField label="Nome" name="name" :ui="formFieldUi">
                <UInput v-model="state.name" :ui="inputUi" class="w-full" placeholder="Nome da prova" />
            </UFormField>

            <!-- Qual turma realizará a prova -->
            <!-- <UFormField label="Turma" :ui="formFieldUi" name="classNum">
                <USelect v-model="state.classNum" :items="classItems" class="py-2 w-full bg-white text-black"></USelect>
            </UFormField> -->
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
            @changeCorrect="changeCorrect"
        />
 
        <div class="flex justify-end">
            <UButton type="submit" color="error">Criar prova</UButton>
        </div>
    </UForm>
</template>

<script setup>
/**
 * Componete que vai lidar com a criação e edição de provas
 */
import * as valibot from 'valibot';
import useAxios from '@/composables/useAxios';
import useUserStore from '@/stores/user';
import QuestionForm from './QuestionForm.vue';
import { onMounted, ref } from 'vue';
import router from '@/router';

const user = useUserStore();
const props = defineProps({
    examId: {
        type: String,
        default: null
    }
});
let questionsCopy = [];
let editingFlag = false;
// guarda os ids de questões removidas
let removedQuestions = [];
let editedQuestions = [];

// quando o componente for montado
onMounted(async () => {
    if (props.examId) {
        await fetchExamData();
        editingFlag = true;
    }
})

/**
 * Vai pegar os dados da prova para edição
 */
const fetchExamData = async () => {
    try {
        // pega os dados da prova
        const { data } = await useAxios('get', `exams/${props.examId}`, true);
        console.log(data);

        // se deu erro ao pegar a prova
        if (data.error) {
            throw new Error(data.message);
        }

        // bota os dados da prova nos states
        state.value.name = data.result.name;
        state.value.available = data.result.available;

        // bota as questões no array de questões
        questions.value = data.result.questions.map((question) => {
            if (question.type === "dis") {
                return {
                    ...question,
                    editing: false,
                    options: ["", "", "", ""]
                }
            }
            return {
                ...question,
                editing: false
            }
        });
    } catch (err) {
        alert("Erro ao carregar dados da prova, tente novamente mais tarde. Persistindo contate desenvolvedor.");
        console.error("Erro carregando dados da prova:", err.message);
    }
}

// estilos personalidados no nuxt UI
const formFieldUi = {
    label: 'text-black'
}
const inputUi = {
    base: ['bg-white text-black py-2']
}
// cuida da validação
const valiSchema = valibot.object({
    // nome da prova
    name: valibot.pipe(valibot.string(), valibot.minLength(5, "Tem que ter no minímo 5 letras")),
    // turma da prova
    // classNum: valibot.pipe(valibot.number(), valibot.minValue(1, "É necessário selecionar uma turma")),
});
// states que usamos para manipular os dados
const state = ref({
    name: '',
    available: false,
    // classNum: 0
});

// vai conter as questões da prova
const questions = ref([]);

/**
 * Vai criar a prova
 */
const onSubmit = async () => {
    try {
        // verifica se tem alguma questão vazia --- solução temporária
        for (let i = 0; i < questions.value.length; i++) {
            if (questions.value[i].question.trim() === "") {
                throw new Error(`OKERRO - A questão ${i + 1} está vazia`);
            }
            
            if (questions.value[i].type === "mul") {
                for (let j = 0; j < questions.value[i].options.length; j++) {
                    if (questions.value[i].options[j].trim() === "") {
                        throw new Error(`OKERRO - A alternativa ${j + 1} da questão ${i + 1} está vazia`);
                    }
                }
            }
        }

        // cria a prova
        const { data } = await useAxios('post', 'exams/', true, {
            author: user.name,
            name: state.value.name,
            available: state.value.available,
        });

        // se deu erro ao criar a prova
        if (data.error) {
            throw new Error(data.message);
        }

        // pega o id da prova criada
        const examId = data.result._id;

        // bota o id da prova nas questões
        questions.value.forEach((question) => {
            // tira o parametro de edição
            delete question.editing;

            // se for dissertativa
            if (question.type === "dis") {
                // manda um array sem nada nas alternativas, só para poupar espaço mesmo
                question.options = [];
            }

            question.exam = examId;
        });

        // tenta criar as questões
        const { data: questionsData } = await useAxios('post', 'questions/many', true, {
            questions: questions.value
        });

        // se deu erro ao criar as questões
        if (questionsData.error) {
            throw new Error(questionsData.message);
        }

        console.log(questionsData);
    } catch (err) {
        // se é um erro que o usuário pode concertar
        if (err.message.includes("OKERRO")) {
            alert(err.message.replace("OKERRO - ", ""));
            return;
        }

        // se for um erro especifico do codigo ou do servidor
        alert("Erro interno ao criar prova, tente novamente mais tarde. Persistindo contate desenvolvedor.");
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
        options: ["", "", "", ""],
        correct: [],
        exam: null
    });
}

/**
 * Vai remover a pergunta do array de perguntas
 */
const removeQuestion = (index) => {
    // se estiver editando e a pergunta já conter um id (esta no banco)
    if (editingFlag && questions.value[index]._id)  {
        removedQuestions.push(questions.value[index]._id);
    }

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

const changeCorrect = (index, optIndex) => {
    const question = questions.value[index];

    // se a alternativa já estiver marcada como correta
    if (question.correct.includes(optIndex)) {
        // tira ela do array de corretas
        question.correct = question.correct.filter((val) => val !== optIndex);
    } else {
        // se não estiver marcada, marca ela
        question.correct.push(optIndex);
    }    
}
</script>
