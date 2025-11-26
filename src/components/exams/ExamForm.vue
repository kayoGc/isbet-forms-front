<template v-if="user.isLoggedIn">
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
let editingFlag = false;
// guarda os ids de questões removidas
let removedQuestions = [];
// guarda os ids das questões editadas
let editedQuestions = [];
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
const exam = ref({});
let questionsCopy = [];
let examCopy = {};

// quando o componente for montado
onMounted(async () => {
    if (props.examId) {
        await fetchExamData();
        editingFlag = true;
        makeCopies();
    }
})

/**
 * Vai pegar os dados da prova para edição
 */
const fetchExamData = async () => {
    try {
        // pega os dados da prova
        const { data } = await useAxios('get', `exams/${props.examId}`, true);

        // se deu erro ao pegar a prova
        if (data.error) {
            throw new Error(data.message);
        }

        exam.value = data.result;
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

// faz copias para analizarmos se algo mudou nos dados
const makeCopies = () => {
    questionsCopy = JSON.parse(JSON.stringify(questions.value));
    examCopy = JSON.parse(JSON.stringify(exam.value));

    examCopy.questions = examCopy.questions.map((question) => question._id);
}

/**
 * vai rodar quando apertar no botão salvar / atualizar
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

        if (editingFlag) {
            await handleEdit();
            alert("Edição");
        } else {
            await handleSave();
            alert("Prova criada com sucesso!")
        }

        // manda para a dashboard
        // router.go('/');
    } catch (err) {
        // se é um erro que o usuário pode concertar
        if (err.message.includes("OKERRO")) {
            alert(err.message.replace("OKERRO - ", ""));
            return;
        }
        
        // se for um erro especifico do codigo ou do servidor
        alert("Erro interno ao criar prova, tente novamente mais tarde. Persistindo contate desenvolvedor.");
        console.error("Erro criando prova:", err);
    }
}

/**
 * Vai criar a prova e as questões
 */
const handleSave = async () => {
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
    
    prepareQuestions(examId);
    
    // tenta criar as questões
    const { data: questionsData } = await useAxios('post', 'questions/batch', true, {
        questions: questions.value
    });
    
    // se deu erro ao criar as questões
    if (questionsData.error) {
        throw new Error(questionsData.message);
    }
}

/**
 * vai lidar com a edição da prova
 */
const handleEdit = async () => {
    prepareQuestions(props.examId);
    
    // prepara o exame para mandar para o banco
    let examData = JSON.parse(JSON.stringify(exam.value));
    examData.questions = examData.questions.map((question) => question._id);
    examData.name = state.value.name;
    
    // vai tentar salvar primeiro as questões editadas
    let updateQ = questions.value.filter((question) => editedQuestions.includes(question._id));
    if (updateQ.length > 0) {
        // faz requisição
        const { data: updateData } = await useAxios('put', 'questions/', true, {
            questions: updateQ
        });
        // lida com erro
        if (updateData.error) {
            throw new Error("Erro atualizando questões:", updateData.message);
        }
    }
    
    // vai remover as questões apagadas
    if (removedQuestions.length > 0) {
        // faz requisição
        const { data: deleteData } = await useAxios('delete', 'questions/', true, {
            ids: removedQuestions,
            examId: exam.value._id
        });

        // lida com erro
        if (deleteData.error) {
            throw new Error("Erro deletando questões:", deleteData.message);
        }

        // vai remover os ids do objeto prova
        examData.questions = examData.questions.filter((question) => !removedQuestions.includes(question));
    }
    
    // vai atualizar o objeto da prova se necessário
    if (isExamDiferent(examData)) {
        const { data: putExamData } = await useAxios("put", `exams/${examData._id}`, true, examData);

        if (putExamData.error) {
            throw new Error("Erro atualizando prova:", putExamData.message);
        }
    }

    // vai adicionar novas questões
    let addedQ = questions.value.filter((question) => !question._id);
    if (addedQ.length > 0) {

        const { data: addData } = await useAxios('post', 'questions/batch', true, {
            questions: addedQ
        });

        if (addData.error) {
            throw new Error("Erro adicionando questões:", addData.message);
        }
    }
}

// prepara as questões para serem mandadas para o banco
const prepareQuestions = (examId) => {
    // bota o id da prova nas questões
    questions.value.forEach((question) => {
        // tira o parametro de edição
        delete question.editing;
    
        // se for dissertativa
        if (question.type === "dis") {
            // manda um array sem nada nas alternativas, só para poupar espaço mesmo
            question.options = [];
        }
    
        if (!question.exam) {
            question.exam = examId;
        }
    });
}

// analisa se o exame passado é diferente da copia guardada
const isExamDiferent = (examData) => {
    // analisa os parametros comuns
    for (const [key, value] of Object.entries(examCopy)) {
        if (key === "questions") {
            continue;
        }

        if (value !== examData[key]) {
            return true;
        }
    }

    // analisa as perguntas
    // se o array estiver de tamanho diferente
    if (examCopy.questions > examData.questions || examCopy.questions < examData.questions) {
        return true;
    }

    for (const i in examCopy.questions) {
        // se o id da pergunta for diferente
        if (examCopy.questions[i] !== examData.questions[i]) {
            return true;
        }
    }

    return false;
}

// ---------------------------------------------------
// metodos relacionados as questões

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

/**
 * vai mudar a pergunta para o estado 
 */
const saveQuestion = (index) => {
    questions.value[index].editing = false;

    // se não estiver editando ou a pergunta não tiver o atributo _id
    if (!editingFlag || !questions.value[index]._id) {
        return;
    }

    analyzeIfQuestionIsDiferent(index);
}

const editQuestion = (index) => {
    questions.value[index].editing = true;
}

/**
 * Vai analisar se a pergunta está diferente da sua contraparte presente no banco de dados
 */
const analyzeIfQuestionIsDiferent = (index) => {
    let questionId = questions.value[index]._id;
    // pega a copia feita de como está no banco
    let copy = questionsCopy.find((question) => question._id === questionId);
    let originalQuestion = questions.value[index];
    let changed = false;
    
    // analisa se mudou algum campo
    if (copy.question !== originalQuestion.question) {
        changed = true;
    }
    
    if (copy.options.length > originalQuestion.options.length || copy.options.length < originalQuestion.options.length) {
        changed = true;
    }
    
    if (!changed) {
        // vai analisar cada texto das alternativas
        for (const opt in copy.options) {
            if (copy.options[opt] !== originalQuestion.options[opt]) {
                changed = true;
                break;
            }
        }
    }
    
    if (copy.correct.length > originalQuestion.correct.length || copy.correct.length < originalQuestion.correct.length) {
        changed = true;
    }
    
    if (!changed) {
        // analisa se as respostas corretas são as mesmas que estão no banco
        for (const i of originalQuestion.correct) {
            if (!copy.correct.includes(i)) {
                changed = true;
                break;
            }
        }
    }
    
    if (changed) {
        editedQuestions.push(copy._id);
        return;
    }
    
    // se não mudou e está dita como editada retira desse estado
    if (editedQuestions.includes(copy._id)) {
        let i = editedQuestions.findIndex((id) => id === copy._id);
        editedQuestions.splice(i, 1);
    }
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