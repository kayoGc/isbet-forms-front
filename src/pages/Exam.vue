<template>
    <div v-if="user.isLoggedIn">
        <MainHeader :class="spacingClass" />

        <!-- conteudo principal -->
        <main class="bg-gray-300 h-full" :class="spacingClass">

            <!-- titulo -->
            <div class="flex justify-end items-center pb-2">
                <UButton to="/" color="error" icon="i-lucide-arrow-big-left-dash">Voltar</UButton>
            </div>

            <!-- card das informações gerais -->
            <div class="w-full rounded-xl overflow-hidden shadow-lg">
                <!-- header do card -->
                <div class="p-3 bg-red-600">
                    <h3 class="text-white text-2xl font-bold">Criar prova</h3>
                </div>
                
                <div class="p-3 bg-white">
                    <ExamForm 
                        :examId="examId"
                    />
                </div>
            </div>
        </main>
    </div>
    
</template>

<script setup>
/**
 * pagina para criar e editar provas
 */
import MainHeader from '@/components/shared/MainHeader.vue';
import ExamForm from '@/components/exams/ExamForm.vue';
import useSpacingClass from '@/composables/useSpacingClass';
import useUserStore from '@/stores/user';
import router from '@/router';
import { useRoute } from 'vue-router';
import { onBeforeMount, ref } from 'vue';

const spacingClass = useSpacingClass();
const user = useUserStore();
const route = useRoute();
const examId = ref(null);

onBeforeMount(() => {
    console.log("== DEBUG Exam ==");

    // verifica se o usuário não está logado
    if (!user.isLoggedIn) {
        console.log("Usuário não está logado");
        console.log("Mandando para login...");
        router.push('/login');
    }

    console.log("Usuário logado");

    if (route.params.id) {
        examId.value = route.params.id;
    }

    console.log("== componente iniciado com sucessso ==");
});
</script>