<template>
    <div>
        <!-- header -->
        <MainHeader :class="spacingClass"></MainHeader>

        <!-- conteudo principal -->
        <main class="bg-gray-300 h-full" :class="spacingClass">
            
            <div class="flex justify-between items-center pb-2">
                <h2 class="text-red-600 text-center text-2xl justify-self-center">PROVAS</h2>

                <UButton to="/exam" color="error" icon="i-lucide-plus">Criar prova</UButton>
            </div>

            <!-- cards das provas -->
            <Card 
                v-for="(exam, index) in formatedExams" 
                :title="exam.title" 
                :contents="exam.contents"
                :buttons="buttons[index]"
                class="mb-2"
            />
        </main>
    </div>
</template>


<script setup>
import { onMounted, onBeforeMount, ref } from 'vue';
import MainHeader from '@/components/shared/MainHeader.vue';
import Card from '@/components/shared/Card.vue';
import useAxios from '@/composables/useAxios';
import useSpacingClass from '@/composables/useSpacingClass';
import useUserStore from '@/stores/user';
import router from '@/router';

const user = useUserStore();

onBeforeMount(() => {
    // if (user.name === '') {
    //     router.push('/login');
    // }
})

// quando o componente rodar
onMounted(async () => {
    try {
        if (user.name === '') {
            router.push('/login');
            return;
        }

        await getExams(); 
        formatExams();
    } catch (err) {
        // vai botar uma mensagem generica no card
        formatedExams.value.push({
            title: 'Erro',
            contents: [{ icon: 'circle-x', title: 'Sem dados', data: "Aconteceu um erro interno. Se persistir contate desenvolvedor."  }]
        });
        buttons.value = [];

        console.log(buttons.value);

        console.error("Erro na pagina de provas:", err.message);
    }
});

// provas
const exams = ref([]);
// provas formatadas para exibir no card
const formatedExams = ref([]);
// botões que vão ter no card
const buttons = ref([]);
// [
//     {
//         to: '/prova/editar',
//         text: 'Editar',
//         icon: 'square-pen',
//         color: 'error'
//     },
//     {
//         to: '/prova/resposta',
//         text: 'Resultados',
//         icon: 'clipboard',
//         color: 'info'
//     }
// ]]);
const spacingClass = useSpacingClass();

/**
 * Vai pegar as provas e colocar dentro da variavel
 */
const getExams = async () => {
    try {
        const { data } = await useAxios('get', 'exams/');
        
        exams.value = data.result;
    } catch (error) {
        throw new Error(`Erro ao pegar provas: ${error.message}`);
    }
}

// tabela hash dos icones
const iconsHash = {
    'author': 'user',
    'questions': 'clipboard-list',
};
// tabela hash dos titulos
const titleHash = {
    'author': 'Autor',
    'questions': 'Questões'
}
/**
 * Vai formatar as provas para exibir no card
 */
const formatExams = () => {    
    try {

        // se não tiver nenhuma prova
        if (exams.value.length === 0) {            
            formatedExams.value.push({
                title: "Sem provas",
                contents: [{
                    title: "Não há provas",
                    data: "Clique em \"Criar prova\" e crie uma nova."
                }]   
            });

            buttons.value.push([]);
            return;
        }

        // passa por cada prova e vai montar um objeto para passar para o card
        for (const exam of exams.value) {
            let obj = { title: exam.name, contents: [] }    
        
            for (const examData of Object.entries(exam)) {
                const key = examData[0];
                const value = examData[1];
                
                // se não tiver o atributo na tabela hash pula o atributo
                if (!titleHash[key]) {
                    continue;
                }

                let contentObj = { icon: iconsHash[key] || null };
                contentObj.title = titleHash[key];

                // tem alguns atributos que os dados precisam ser processados antes de mostrar
                switch (key) {
                    case 'available':
                        contentObj.data = value ? 'Sim' : 'Não';
                        break;
                    case 'questions':
                        contentObj.data = value.length;
                        break;
                    default:
                        contentObj.data = value;
                }

                obj.contents.push(contentObj);
            }

            formatedExams.value.push(obj);
            // cria os botões com os links de cada prova
            buttons.value.push([{
                to: `/exam/${exam._id}`,
                text: 'Editar',
                icon: 'square-pen',
                color: 'error'
            }])
        }
    } catch (error) {
        throw new Error(`Erro formatando as provas: ${error.message}`);
    }
}
</script>