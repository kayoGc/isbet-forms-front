<template v-if="user.isLoggedIn">
    <div>
        <!-- header -->
        <MainHeader :class="spacingClass"></MainHeader>

        <!-- conteudo principal -->
        <main class="bg-gray-300 h-full" :class="spacingClass">
            
            <div class="flex justify-between align-middle items-center pb-2">
                <h2 class="text-red-600 text-center text-2xl justify-self-center">ALUNOS</h2>

                <UButton
                    color="error"
                    icon="i-lucide-refresh-cw"
                    variant="ghost"
                    class="cursor-pointer"
                    @click="refreshEverything(true)"
                />   
            </div>

            <!-- filtros -->
            <div class="flex flex-col gap-2">
                <div>
                    <div class="flex justify-between align-middle gap-2">
                        <label for="in-class-filter" class="text-black">Turma:</label>

                        
                        <UButton
                        color="error"
                        icon="i-lucide-plus"
                        label="Criar turma"
                        class="cursor-pointer"
                        variant="ghost"
                        :loading="isTableLoading"
                        @click="openClassModal"
                        />    
                    </div>

                    <USelect 
                        id="in-class-filter"
                        :items="selectItems"
                        v-model="classSelectedId"
                        class=" bg-white text-black mt-1 w-full"
                        :ui="uiSelect"
                    />
                </div>

                <div class="flex justify-end">
                    <UButton
                        color="error"
                        label="Aplicar filtro"
                        icon="i-lucide-search"
                        class="cursor-pointer"
                        @click="searchFilter"
                        :loading="isTableLoading"
                    />            
                </div>
            </div>
            
            <UTable 
                v-if="users" 
                :key="recharger"
                :data="users" 
                class="bg-white rounded-sm border border-gray-400 shadow-xs mt-2" 
                :columns="columns" 
                :ui="uiTable"
                empty="Nenhum aluno foi achado"
                :loading="isTableLoading"
                loading-color="warning"
                loading-animation="swing"
            />
        </main>
    </div>
</template>


<script setup>
import { onMounted, ref, h, computed, provide, watch } from 'vue';
import MainHeader from '@/components/shared/MainHeader.vue';
import useSpacingClass from '@/composables/useSpacingClass';
import useUserStore from '@/stores/user';
import router from '@/router';
import userService from '@/services/user-service';
import UButton from '@nuxt/ui/components/Button.vue'
import UCheckbox from '@nuxt/ui/components/Checkbox.vue'
import EditStudent from '@/components/students/moveStudents.vue';
import CreateClass from '@/components/students/CreateClass.vue';
import classService from '@/services/class-service';

const numOfItems = ref(10);
const page = ref(1);
const classes = ref(null);
const classSelectedId = ref('none');
const spacingClass = useSpacingClass();
const user = useUserStore();
const users = ref(null);
const overlay = useOverlay();
const modal = overlay.create(EditStudent);
const classModal = overlay.create(CreateClass);
const selectedUsers = ref([]);
const recharger = ref(0);
const isTableLoading = ref(false);
// configuração da tabela
const columns = ref([
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
        header: 'Selecionado',
        // cell é o que vai ter na celula da tabela
        cell: (({ row }) => {
            // <div>
            return h(UCheckbox,{ 'onUpdate:modelValue': (checked) => selectStudent(checked, row.index), color: 'secondary' })
        }),
        footer: (() => {
            return h(UButton, { 
                label: 'Mover turma', 
                color: 'secondary', 
                disabled: selectedUsers.value.length === 0,
                icon: 'i-lucide-arrow-right-left',
                class: 'cursor-pointer',
                onClick: openModal
            })
        })
    },
]);

const uiTable = {
    th: 'bg-red-600 text-white py-2',
    td: 'text-black',
    tr: 'hover:bg-gray-200 trasition-all duration-300 ease-in-out'
}
const uiSelect = {
        base: 'bg-white text-black',
        slots: {
            list: {
                base: 'bg-gray-800 text-white shadow-lg rounded-md', // dropdown (lista)
            },
            item: {
                base: 'bg-white',
                active: 'bg-white text-black',
            }
        }
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

        await getClasses();
        console.log("classes ok");

        console.log("===== Pegando dados =====");
    } catch (err) {
        console.error("Erro na pagina de alunos:", err.message);
    }
});

/**
 * Vai pegar os dados dos alunos
 */
const getStudents = async () => {
    let classFilter = classSelectedId.value;
    
    if (classFilter === 'none') {
        classFilter = null;
    }

    const { success, data, error } = await userService.get(numOfItems.value, page.value, classFilter);

    if (!success) {
        throw new Error(`getStudents: ${error}`);
    }

    users.value = data.result;
}

/**
 * Vai pegar as turmas que vai poder mover os usuários
 */
const getClasses = async () => {
    try {
        const { success, data, error } = await classService.get();

        console.log(JSON.stringify(data));

        if (!success) {
            throw new Error(error);
        }

        classes.value = data.result;
    } catch (err) {
        console.error(`getClasses: ${err.message}`);        
    } 
}

/**
 * Vai pegar os alunos que estão dentro do filtro
 */
const searchFilter = async () => {
    try {
        isTableLoading.value = true;

        console.log("Buscando alunos com novo filtro");

        await getStudents();

        console.log("Pesquisa feita com sucesso!");
    } catch (err) {
        console.error("Erro searchFilter:", err);
    } finally {
        isTableLoading.value = false;
    }
}

const refreshEverything = async (refreshClass) => {
    try {
        isTableLoading.value = true;
    
        console.log("Limpando cache e pegando dados novamente");
        // vai apagar dados do localStorage
        for (const key of Object.keys(localStorage)) {
            
            if (key.startsWith(userService.collectionName) || key.startsWith(classService.collectionName)) {
                localStorage.removeItem(key);    
            }

        }
        
        if (refreshClass) {
            await getClasses();
        }

        await getStudents();
    
        console.log("Dados recarregados com sucesso!");
    } catch (err) {
        console.error("Erro refreshEverything:", err);
    } finally {
        isTableLoading.value = false;
    }
}

/**
 * Vai lidar com a manipulação dos usuários selecionados
 * @param checked se o usuário está selecionado
 * @param index o index do usuário no array users
 */
const selectStudent = (checked, index) => {
    // coloca na variavel se estiver checado
    if (checked) {
        if (selectedUsers.value.includes(index)) {
            return;
        }

        selectedUsers.value.push(index);
        return;
    }
 
    // tira da variavel se não estiver checado
    let i = selectedUsers.value.findIndex((val) => val === index);

    if (i !== -1) {
        selectedUsers.value.splice(i, 1);
    }
}

/**
 * Abre o modal que edita os usuários
 */
const openModal = async () => {
    let usersData = selectedUsers.value.map((i) => {
        return users.value[i]
    });

    const instance = modal.open({ usersData: usersData, classes: classes.value, });

    const result = await instance.result;

    // se retornou null usuário fechou antes de qualquer ação
    if (result === null) {
        return;
    }

    handleModalClose(result.success, result.selClass);
}

/**
 * Abre o modal que edita os usuários
 */
const openClassModal = async () => {
    const instance = classModal.open();

    const result = await instance.result;

    // se retornou null usuário fechou antes de qualquer ação
    if (result === null) {
        return;
    }

    handleClassModalClose(result.success);
}

/**
 * Lida com o fechamento do modal de mover alunos quando tenta mover eles no banco, 
 * vai fazer um toast aparecer avisando o estado ao usuário
 * 
 * Também recarrega a tabela
 * @param result se deu certo mover os alunos
 */
const handleModalClose = async (result, classId) => {
    const toast = useToast();

    let toastProps = null

    if (result) {
        toastProps = {
            title: 'Alunos movidos com sucesso!',
            color: "primary",
            icon: "i-lucide-check"
        }
    } else {
        toastProps = {
            title: 'Erro movendo alunos!',
            description: "Aconteceu um erro interno, recarregue e tente novamente. Persistindo contate desenvolvedor.",
            color: "error",
            icon: "i-lucide-x"
        }
    }

    toast.add(toastProps);

    if (result) {
        classSelectedId.value = classId;
        await refreshEverything(false);
    }
}

/**
 * Cria um prop falando para o usuário se a criação da turma foi um sucesso ou não
 * @param success se a criação da turma foi um sucesso
 */
const handleClassModalClose = async (success) => {
    const toast = useToast();

    let toastProps = null

    if (success) {
        toastProps = {
            title: 'Turma criada com sucesso!',
            color: "primary",
            icon: "i-lucide-check"
        }
    } else {
        toastProps = {
            title: 'Erro criando turma!',
            description: "Aconteceu um erro interno, recarregue e tente novamente. Persistindo contate desenvolvedor.",
            color: "error",
            icon: "i-lucide-x"
        }
    }

    toast.add(toastProps);

    if (success) {
        await refreshEverything(true);
    }
}

/**
 * Monta o objeto items que o USelect precisa
 */
const selectItems = computed(() => {
    let items = [{
        label: 'Alunos sem turma',
        value: 'none'
    }];

    if (!classes.value) {
        return items;
    }

    classes.value.forEach((clas) => {
        items.push({
            label: clas.name,
            value: clas._id
        });
    });

    return items;
});

/**
 * Reseta os usuários selecionados
 */
watch(classSelectedId, () => {
    console.log("oi");
    selectedUsers.value = [];
})
</script>