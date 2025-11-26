<template>
    <div class="min-h-screen bg-gray-300 flex items-center justify-center" :class="spacingClass">
        <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
            <div v-if="route.params.answerExists === 'true'">
                <h2 class="text-2xl font-bold text-black mb-2">Você já respondeu essa prova!</h2>
                <p class="text-lg mb-4 text-black">Prova: <strong>{{ examName }}</strong></p>
                <p class="text-sm text-gray-600 mb-6">{{ formattedDate }}</p>
            </div>
            
            <div v-else>
                <h2 class="text-2xl font-bold text-green-600 mb-2">Você respondeu a prova com sucesso!</h2>
                <p class="text-lg mb-4 text-black">Prova: <strong>{{ examName }}</strong></p>
                <p class="text-sm text-gray-600 mb-6">Concluído em: {{ formattedDate }}</p>
            </div>

            <div class="flex justify-center">
                <UButton color="error" @click="goDashboard" class="cursor-pointer">Voltar para a tela principal</UButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useLocalCache from '@/composables/useLocalCache';
import useSpacingClass from '@/composables/useSpacingClass';

const route = useRoute();
const router = useRouter();
const cache = useLocalCache();
const spacingClass = useSpacingClass();

const examName = ref('Prova');
const completedAt = ref(new Date());

onMounted(() => {
    const id = route.params.id;
    if (id) {
        const key = `exam-${id}`;
        const exam = cache.get(key);
        if (exam && exam.name) examName.value = exam.name;
    }
    completedAt.value = new Date();
});

const formattedDate = computed(() => {
    return completedAt.value.toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

const goDashboard = () => {
    router.push('/dashboard_user');
};
</script>