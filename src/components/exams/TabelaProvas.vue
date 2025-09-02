<template>

    <table class="border-collapse rounded-lg bg-white table-auto text-sm  w-full">
        <!-- table head -->
        <thead>
            <tr class="py-2 hover:bg-gray-100 transition-colors duration-200 ease-in text-neutral-500 text-xs">
                <!-- rounded-ss-lg torna apenas a ponta superior esquerda redonda -->
                <th class="px-2 py-2 text-start rounded-ss-lg border-gray-200">Nome</th>
                <th class="px-2 py-2 text-start">Autor</th>
                <th class="px-2 py-2 text-start">Número da sala</th>
                <th class="px-2 py-2 text-start">Disponivel</th>
                <!-- rounded-se-lg torna só a ponta superior direita redonda -->
                <th class="px-2 py-2 text-start">Número de questões</th>
                <th class="px-2 py-2 text-start rounded-se-lg">Ação</th>
            </tr>
        </thead>

        <tbody>
            <!-- se os dados estiverem carregando -->
            <tr v-if="isLoading"
                class="border-t-1 text-black border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in">
                <td colspan="6" class="text-center py-4">Carregando</td>
            </tr>

            <tr v-if="error"
                class="border-t-1 text-black border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in">
                <td colspan="5" class="px-2 text-red-600 py-4 rounded-s-lg">Aconteceu um erro interno ao carregar
                    as provas, tente novamente mais tarde.</td>
                <td class="px-2 text-red-600 py-4 rounded-ee-lg">
                    <!-- vai para resultados -->
                    <UTooltip text="Recarregar página" arrow>
                        <u-icon 
                            name="i-lucide-rotate-ccw"
                            class="text-blue-600 hover:text-blue-800 transition duration-100 cursor-pointer"
                            @click="reloadPage"
                            ></u-icon>
                    </UTooltip>
                </td>
            </tr>

            <!-- se tiver dados -->
            <tr v-for="(row, index) in data"
                class="border-t-1 text-black border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in"
                :key="row._id">
                <td class="px-2 py-4 border-gray-200" :class="index === data.length - 1 ? 'rounded-es-lg' : ''">{{
                    row.nome }}</td>
                <td class="px-2 py-4">{{ row.autor }}</td>
                <td class="px-2 py-4">{{ row.sala }}</td>
                <td class="px-2 py-4">{{ row.disponivel }}</td>
                <td class="px-2 py-4">{{ row.questoes }}</td>
                <td class="px-2 py-4" :class="index === data.length - 1 ? 'rounded-ee-lg' : ''">
                    <div class="flex gap-2 items-center">
                        <!-- vai para editar -->
                        <router-link to="/" class="flex items-center">
                            <UTooltip text="Editar prova" arrow>
                                <u-icon name="i-lucide-edit"
                                    class="text-blue-600 hover:text-blue-800 transition duration-100"></u-icon>
                            </UTooltip>
                        </router-link>
                        <!-- vai para resultados -->
                        <router-link to="/" class="flex items-center">
                            <UTooltip text="Ver resultados" arrow>
                                <u-icon name="i-lucide-clipboard"
                                    class="text-blue-600 hover:text-blue-800 transition duration-100"></u-icon>
                            </UTooltip>
                        </router-link>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import useAxios from '@/composables/useAxios';
import router from '@/router';

// dados da tabela
const data = ref([]);
// vai registrar se a tabela está carregando os dados
const isLoading = ref(false);
const error = ref(false);

onMounted(async () => {
    try {
        isLoading.value = true;

        data.value = await getExams();
    } catch (err) {
        console.error("Erro ao carregar provas:", err.message);
        error.value = true;
    } finally {
        isLoading.value = false;
    }
})


/**
 * Vai pegar as provas
 */
const getExams = async () => {
    // pega as provas
    const { data } = await useAxios("get", "exams/");

    if (data.error) {
        throw new Error(`erro no axios: ${data.message}`);
    }

    let tableData = [];

    // percorre o array de provas
    data.result.forEach(exam => {
        // configura os dados da linha
        let row = {
            id: exam._id,
            nome: exam.name,
            autor: exam.author,
            sala: exam.classNum,
            disponivel: exam.available ? "Sim" : "Não",
            questoes: exam.questions.length,
        };

        tableData.push(row);
    });

    return tableData;
}

// vai recarregar a página
const reloadPage = () => {
    router.go(0);
}
</script>