<template>
    <div>
        <MainHeader :class="spacingClass" />

        <!-- conteudo principal -->
        <main class="bg-gray-300 h-full" :class="spacingClass">

            <!-- titulo -->
            <div class="flex justify-between items-center pb-2">
                <h2 class="text-red-600 text-center text-2xl justify-self-center">CRIAR PROVA</h2>

                <UButton to="/" color="error" icon="i-lucide-arrow-big-left-dash">Voltar</UButton>
            </div>

            <!-- conteudo principal -->
             <!-- card com o formulario -->
            <div class="w-full bg-white rounded-xl overflow-hidden shadow-lg">
                
                <div class="p-4">
                    <ExamForm />
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

const spacingClass = useSpacingClass();
</script>