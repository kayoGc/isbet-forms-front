<template>
    <div v-if="user.isLoggedIn">
        <MainHeader :class="spacingClass" />

        <!-- conteudo principal -->
        <main class="bg-gray-300" :class="spacingClass">

            <!-- titulo -->
            <div class="flex items-center pb-2">
                <h2 class="text-red-600 text-center text-2xl justify-self-center">PROVAS</h2>
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
import { onBeforeMount, ref } from 'vue';
import useUserStore from '@/stores/user';
import useLocalCache from '@/composables/useLocalCache';
import MainHeader from '@/components/shared/MainHeader.vue';
import activeService from '@/services/active-service';
import userService from '@/services/user-service';
import useSpacingClass from '@/composables/useSpacingClass';
import router from '@/router';
import Card from '@/components/shared/Card.vue';

const spacingClass = useSpacingClass();
const user = useUserStore();
const isLoading = ref(true);
const userData = ref(null);
const exams = ref([]);
const formatedExams = ref([]);
const buttons = ref([]);
// tabela hash dos icones
const iconsHash = {
    'questions': 'clipboard-list',
};
// tabela hash dos titulos
const titleHash = {
    'questions': 'Questões'
}
const cache = useLocalCache();

onBeforeMount(async () => {
    try {
        isLoading.value = true;

        if (!user.isLoggedIn) {
            router.push('/login');
            return;
        }

        const { success, data, error } = await userService.getByUid(user.uid);
        
        if (!success) {
            throw new Error(error);
        }

        if (data === undefined) {
            throw new Error("Usuário não encontrado");
        }

        userData.value = data;
        console.log("usuário ok");

        // tenta pegar provas só se o aluno já estiver em uma turma
        if (userData.value.class) {
            // let data = cache.get("activeExams");
            let data = null;

            const { success: successAct, error: errorAct, data: dataAct } = await activeService.get([
                { key: 'examData', value: true },
                { key: 'classId', value: userData.value.class },
            ]);
    
            if (!successAct) {
                throw new Error(errorAct);
            }
            data = dataAct;

            // if (!data) {
    
            //     cache.set("activeExams", dataAct, 1000 * 60 * 60 * 24);
            // }

    
            for (const active of data) {
                exams.value.push(active.examId);
            }
        }

        console.log("Provas ok");

        formatExams();
    } catch (err) {
         // vai botar uma mensagem generica no card
        formatedExams.value.push({
            title: 'Erro',
            contents: [{ icon: 'circle-x', title: 'Sem dados', data: "Aconteceu um erro interno. Se persistir contate desenvolvedor."  }]
        });
        buttons.value = [];

        console.log(buttons.value);

        console.error("Pagina de provas:", err.message);
    } finally {
        isLoading.value = false;
    }
});

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
                    title: "Não há provas para responder.",
                    data: "Espere seu professor(a) liberar uma prova."
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
                    // case 'available':
                    //     contentObj.data = value ? 'Sim' : 'Não';
                    //     break;
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
            buttons.value.push([
                {
                    text: 'Começar prova',
                    color: 'info',
                    onClick: () => startAnswer(exam._id),
                    // to: `/answer/${exam._id}`,
                    'icon': 'play',
                }
            ])
        }
    } catch (error) {
        throw new Error(`Erro formatando as provas: ${error.message}`);
    }
}

const startAnswer = (id) => {
    router.replace(`/answer/${id}`)
}
</script>