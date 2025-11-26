<template>
    <UModal
        :close="{ onClick: () => emits('close', null) }"
        title="Gerenciar liberações"
        description="Gerencie as liberações desta prova"
        :ui="uiModal"
    >
        <template #body>

            <label for="in-class">Selecione a turma</label>

            <USelect 
                id="in-class"
                :items="selectItems"
                v-model="classSelectedId"
                class="w-full bg-white text-black mt-1"
                :ui="uiSelect"
            />

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
                    label="Liberar"
                    icon="i-lucide-play"
                    class="cursor-pointer"
                    @click="activateExam()"
                />
            </div>

        </template>
    </UModal>
</template>

<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import activeService from '@/services/active-service';
import classService from '@/services/class-service';

const isLoading = ref(false);
const actives = ref([]);
const classes = ref([]);
const props = defineProps(['examId']);
const emits = defineEmits(['close']);
const classSelectedId = ref('none');
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

    classes.value.forEach((clas) => {
        items.push({
            label: clas.name,
            value: clas._id
        });
    });

    return items;
});

/**
 * Pega os dados iniciais para o componente funcionar
 */
onBeforeMount(async () => {
    try {
        console.log("Iniciando montagem do StartExam.vue...");
        isLoading.value = true;

        // pega os dados de liberadas
        console.log("Pegando dados de liberadas...");
        const { success, data, error, status } = await activeService.get([{
            key: 'exam',
            value: props.examId
        }]); 

        if (!success) {
            throw new Error(error);
        }

        actives.value = data;
        console.log("SUCESSO -> liberadas ok!");

        // pega os dados de turmas
        console.log("Pegando dados de turmas...");
        const { success: classSu, data: classDa, error: classEr } = await classService.get(0);

        if (!classSu) {
            throw new Error(classEr);
        }

        classes.value = classDa.result;
        console.log("SUCESSO -> turmas ok!");

        console.log("Montagem do componente finalizada");
    } catch (err) {
        console.error("ERRO -> Montando StartExam.vue:", err);
    } finally {
        isLoading.value = false;
    }
})

const activateExam = async () => {
    try {
        isLoading.value = true;

        const { success, error } = await activeService.post({
            classId: classSelectedId.value,
            exam: props.examId
        });

        if (!success) {
            throw new Error(error);
        }

        emits('close', { success: true });
    } catch (err) {
        console.error("ERRO -> Ativando prova:", err);
    }
}

</script>