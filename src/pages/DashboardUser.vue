<template>
    <div v-if="user.isLoggedIn" class="bg-white">
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
                    <ExamForm :examId="examId" />
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import useUserStore from '@/stores/user';
import MainHeader from '@/components/shared/MainHeader.vue';

const user = useUserStore();
</script>