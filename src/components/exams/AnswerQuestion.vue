<template>
    <div class="space-y-4">
        <div v-for="(question, index) in questions" :key="index" class="bg-white rounded-lg pb-4">
            <!-- Número e enunciado da questão -->
            <div class="mb-4">
                <h4 class="text-lg font-bold text-black mb-2">Questão {{ index + 1 }}</h4>
                <p class="text-gray-700 select-none">{{ question.question }}</p>
            </div>
            
            <!-- Alternativas (múltipla escolha) -->
            <div v-if="question.type === 'mul'" class="space-y-2">
                
                <URadioGroup 
                    v-if="question.correct.length === 1"
                    v-model="answers[index].selected"
                    color="error" 
                    variant="card" 
                    :items="questionToItems(question)" 
                    class="text-black"
                    :ui="radioGroupUi"
                />

                
                <UCheckboxGroup
                    v-else
                    v-model="answers[index].selected"
                    color="error" 
                    variant="card" 
                    :items="questionToItems(question)" 
                    class="text-black"
                    :ui="radioGroupUi"
                />            
            </div>


            <!-- Resposta aberta (texto) -->
            <div v-else-if="question.type === 'dis'" class="space-y-2">
                
                <UTextarea
                    v-model="answers[index].text"
                    color="error"
                    autoresize
                    :ui="textAreaUi"
                    placeholder="Coloque sua resposta aqui!"
                    class="w-full"
                />
                <!-- <textarea 
                    v-model="answers[index].text"
                    placeholder="Digite sua resposta aqui..."
                    class="w-full p-3 border border-gray-300 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                ></textarea> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    questions: {
        type: Array,
        required: true,
        default: () => []
    }
});
const emit = defineEmits(['update-answers']);
// Estrutura: answers[index] = { selected: null/número, text: '' }
const answers = ref([]);
const radioGroupUi ={
    label: 'text-black select-none'
}
const textAreaUi ={
    base: 'bg-white text-black',
}

const questionToItems = (question) => {
    return question.options.map((option, optIndex) => ({
        label: option,
        value: optIndex
    }));
}

// Inicializa respostas baseado nas questões
watch(
    () => props.questions,
    (newQuestions) => {
        answers.value = newQuestions.map((question) => {
            if (question.type === 'mul' && question.correct.length > 1) {
                return { selected: [], text: '' }; // múltipla escolha com múltiplas respostas
            }

            return {
                selected: null,
                text: ''
            }
        }
        );
    },
    { immediate: true }
);

// Emite as respostas sempre que mudarem
watch(
    answers,
    (newAnswers) => {
        emit('update-answers', newAnswers);
    },
    { deep: true }
);

// Expõe as respostas para o componente pai
defineExpose({
    answers
});
</script>