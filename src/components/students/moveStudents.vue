<template>
    <UModal
        :close="{ onClick: () => emits('close', null) }"
        title="Mover turma"
        description="Mova os usuários para uma turma específica"
        :ui="uiModal"
    >
        <template #body>

            <div v-if="isLoading">
                <UProgress 
                    color="error"
                />

                <p class="text-center">Carregando...</p>
            </div>

            <div v-else>
                <label for="in-class">Selecione a turma</label>

                <USelect 
                    id="in-class"
                    :items="selectItems"
                    v-model="classSelectedId"
                    class="w-full bg-white text-black mt-1"
                    :ui="uiSelect"
                />
            </div>

        </template>

        <template #footer>
            <div class="flex justify-end gap-2 w-full">
                <UButton 
                    color="secondary"
                    label="Cancelar"
                    icon="i-lucide-x"
                    class="cursor-pointer"
                    @click="emits('close', null)"
                />

                <UButton 
                    color="error"
                    label="Mover"
                    icon="i-lucide-arrow-right-left"
                    :disabled="classSelectedId === 'none'"
                    class="cursor-pointer"
                    @click="changeClass"
                />
            </div>
        </template>
    </UModal>
</template>

<script setup>
import userService from '@/services/user-service';
import { computed, onMounted, ref } from 'vue';

const props = defineProps(['usersData', 'classes']);
const emits = defineEmits(["close", 'moveEnd']);
const classSelectedId = ref('none');
const isLoading = ref(false);
// customização na ui do nuxt
const uiModal = {
    header: 'bg-red-600 p-3 text-white',
    close: 'hover:bg-red-400 hover:text-black text-white cursor-pointer',
    content: 'bg-white text-black',
    description: 'text-black'
};
const uiSelect = {
    select: {
        slots: {
            item: {
                active: 'bg-white text-black',
            }
        }
    }
}


/**
 * Monta o objeto items que o USelect precisa
 */
const selectItems = computed(() => {
    let items = [{
        label: 'Selecione uma turma',
        value: 'none'
    }];

    props.classes.forEach((clas) => {
        items.push({
            label: clas.name,
            value: clas._id
        });
    });

    return items;
});

/**
 * Roda quando o modal é montado
 */
onMounted(async () => {
    try {
        isLoading.value = true;
        console.log("Montando modal de mover usuários");



        console.log("Modal montado");
    } catch (err) {
        console.error(`Erro montando modal: ${err}`);
    } finally {
        isLoading.value = false;
    }
});

/**
 * Faz a requisição que muda a turma dos usuários
 */
const changeClass = async () => {
    let moveSuccess = false;
    
    try {
        if (classSelectedId.value === 'none') {
            return;
        }
    
        // constroi o objet oa ser mandado
        let updateObj = props.usersData.map((user) => {
            return {
                uid: user.uid,
                class: classSelectedId.value
            };
        });
    
        const { success, error } = await userService.put({ users: updateObj });

        if (!success) {
            throw new Error(error);
        }

        console.log(updateObj);

        console.log("✅ Usuários mudaram de turma com sucesso");
        moveSuccess = true;
    } catch (err) {
        console.error(`❌ Erro changeClass: ${err.message}`);
    } finally {
        emits('close', { success: moveSuccess, selClass: classSelectedId.value });
    }
}

</script>