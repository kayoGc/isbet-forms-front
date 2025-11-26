<template>
    <div v-if="user.isLoggedIn">
        <MainHeader :class="spacingClass" />

        <!-- conteudo principal -->
        <main class="bg-gray-300 h-full" :class="spacingClass">

            <!-- card das informações gerais -->
            <div class="w-full rounded-xl overflow-hidden shadow-lg mb-4">
                <!-- header do card -->
                <div class="p-3 bg-red-600">
                    <h3 class="text-white text-2xl font-bold">{{ exam?.name }}</h3>
                </div>
                
                <div class="p-3 bg-white text-black">                    
                    <!-- Questões para responder -->
                    <AnswerQuestion 
                        v-if="exam?.questions"
                        ref="questionComponent"
                        :questions="exam.questions"
                        @update-answers="handleAnswerUpdate"
                    />

                    <!-- Botões de ação -->
                    <div class="flex justify-end gap-2 mt-4 mb-4">
                        <UButton color="error" @click="handleSubmit" :loading="submitting" class="cursor-pointer">Enviar Respostas</UButton>
                    </div>
                </div>
                
            </div>


        </main>
    </div>
    
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import useUserStore from '@/stores/user';
import useSpacingClass from '@/composables/useSpacingClass';
import examService from '@/services/exam-service';
import { useRoute, useRouter } from 'vue-router';
import useLocalCache from '@/composables/useLocalCache';
import AnswerQuestion from '@/components/exams/AnswerQuestion.vue';
import answersService from '@/services/answer-service';

const spacingClass = useSpacingClass();
const user = useUserStore();
const loading = ref(false);
const submitting = ref(false);
const exam = ref(null);
const cache = useLocalCache();
const route = useRoute();
const router = useRouter();
const questionComponent = ref(null);
const userAnswers = ref([]);

onBeforeMount(async () => {
    try {
        loading.value = true;

        await loadData();
    } catch (error) {
        console.error(`:( - Erro carregando página: ${error}`);
    } finally {
        loading.value = false;
    }
}) 

/**
 * Carrega os dados iniciais
 */
const loadData = async () => {
    loading.value = true;
    
    exam.value = await getExam();
    console.log(":) - Provas ok!");

    if (await answerExists()) {
        router.replace(`/confirmation/${route.params.id}/true`)
    }
}

/**
 * Retorna se o usuário já respondeu a prova
 */
const answerExists = async () => {
    const cacheExists = cache.get(`${route.params.id}-answerExists`);

    if (cacheExists) {
        return cacheExists;
    }

    const params = [
        {
            key: "exam",
            value: route.params.id
        },
        {
            key: "userUid",
            value: user.uid
        },
        {
            key: "exists",
            value: true
        },
    ]

    const { data, success, error } = await answersService.get(params);

    if (!success) {
        throw new Error(error);
    }

    if (data.exists) {
        cache.set(`${route.params.id}-answerExists`, true);
    }

    return data.exists;
}

/**
 * Pega os dados da prova
 */
const getExam = async () => {
    let examCache = cache.get(`exam-${route.params.id}`);
    
    if (examCache) {
        console.log(":D - Prova vinda do cache");
        return examCache;
    }

    const { data, success, error} = await examService.getById(route.params.id);
    
    if (success) {
        cache.set(`exam-${route.params.id}`, data);
        return data;
    }

    throw new Error(`Pegando provas: ${error}`);
}

/**
 * Atualiza as respostas do usuário
 */
const handleAnswerUpdate = (answers) => {
    userAnswers.value = answers;
    console.log("Respostas atualizadas:", userAnswers.value);
}

/**
 * Envia as respostas para o servidor
 */
const handleSubmit = async () => {
    try {
        submitting.value = true;

        // Validar se todas as questões foram respondidas
        const allAnswered = userAnswers.value.every(answer => 
            answer.selected !== null || answer.text.trim() !== ''
        );

        if (!allAnswered) {
            alert('Por favor, responda todas as questões antes de enviar.');
            return;
        }

        // transforma todas as respostas em strings
        const formatedAnswers = userAnswers.value.map((answer) => {
            // se for array é multipla escolha
            if (answer.selected !== null && typeof answer.selected === 'object') {
                return {
                    selected: answer.selected.join('')
                }
            }

            // se é escolha normal
            if (answer.selected !== null) {
                return {
                    selected: answer.selected.toString()
                }
            }
            
            // objetiva
            return answer;
        })

        // Preparar dados para envio
        const submission = {
            exam: route.params.id,
            userUid: user.uid,
            answers: formatedAnswers.map((answer, index) => ({
                question: exam.value.questions[index]._id,
                answer: answer.selected !== null ? answer.selected : answer.text,
            }))
        };

        const { success, error } = await answersService.post(submission);
        if (!success) throw new Error(error);

        cache.set(`${route.params.id}-answerExists`, true);        
        router.replace(`/confirmation/${route.params.id}/false`);
    } catch (error) {
        console.error("Erro ao enviar respostas:", error);
        alert('Erro ao enviar respostas. Tente novamente.');
    } finally {
        submitting.value = false;
    }
}

/**
 * Cancela a resposta e volta
 */
const handleCancel = () => {
    if (confirm('Tem certeza que deseja cancelar? Suas respostas não serão salvas.')) {
        router.back();
    }
}
</script>