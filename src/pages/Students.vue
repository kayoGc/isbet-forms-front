<template v-if="user.isLoggedIn">
    <div>
        <!-- header -->
        <MainHeader :class="spacingClass"></MainHeader>

        <!-- conteudo principal -->
        <main class="bg-gray-300 h-full" :class="spacingClass">
            
            <div class="flex justify-between items-center pb-2">
                <h2 class="text-red-600 text-center text-2xl justify-self-center">Alunos</h2>
            </div>

            <UTable 
                v-if="users" 
                :data="users" 
                class="bg-white rounded-sm border border-gray-400 shadow-xs" 
                :columns="columns" 
                :ui="uiTable"
            />
        </main>
    </div>
</template>


<script setup>
import { onMounted, ref, h } from 'vue';
import MainHeader from '@/components/shared/MainHeader.vue';
import useSpacingClass from '@/composables/useSpacingClass';
import useUserStore from '@/stores/user';
import router from '@/router';
import userService from '@/services/user-service';
import UButton from '@nuxt/ui/components/Button.vue'
import EditStudent from '@/components/students/EditStudent.vue';

const spacingClass = useSpacingClass();
const user = useUserStore();
const users = ref(null);
const userModaldata = ref(null);
const overlay = useOverlay();
const modal = overlay.create(EditStudent);
// configuração da tabela
const columns = [
    {
        // nome da chave que vai pegar o dado
        accessorKey: 'name',
        // o que vai aparecer no header da tabela
        header: 'Nome do aluno',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'uid',
        header: 'Ações',
        // cell é o que vai ter na celula da tabela
        cell: (({ row }) => {
            // <div>
            return h('div', { class: 'flex align-center' }, [
                // <UButton>
                h(UButton, { 
                    color: 'info',  
                    size: 'sm', 
                    class: 'cursor-pointer', 
                    icon: 'i-lucide-pencil', 
                    variant: 'ghost', 
                    label: 'Editar',
                    onClick: () => editStudent(row.getValue('uid'))
                }),
            ])
        }),
        meta: {
            class: {
                th: 'px-2.5',
                td: 'px-0'
            }
        }
    },
];
const uiTable = {
    th: 'bg-red-600 text-white py-2',
    td: 'text-black',
    tr: 'hover:bg-gray-200 trasition-all duration-300 ease-in-out'
}

// quando o componente rodar
onMounted(async () => {
    try {
        console.log("== DEBUG Students ==");
        
        // analisa se usuário está logado
        if (!user.isLoggedIn) {
            console.log("Usuário não está logado");
            console.log("Mandando para tela de login...");
            router.push('/login');    
            return;
        }
       
        await getStudents();
        console.log("Alunos ok");

        console.log("===== Pegando dados =====");
    } catch (err) {
        console.error("Erro na pagina de alunos:", err.message);
    }
});

/**
 * Vai pegar os dados dos alunos
 */
const getStudents = async () => {
    const { success, data, error } = await userService.get();

    if (!success) {
        throw new Error(`getStudents: ${error}`);
    }

    users.value = data.result;
}

const editStudent = async (uid) => {
    userModaldata.value = users.value.find((user) => user.uid === uid);

    modal.open({
        userData: userModaldata.value
    });
}
</script>