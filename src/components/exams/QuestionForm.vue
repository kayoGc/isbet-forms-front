<template>
    <!-- Parte das perguntas -->
    <div class="py-2">

        <div class="mb-2" v-for="(question, index) in questions">

            <!-- Visualização -->
            <div v-if="!question.editing" class="p-2 rounded-xl cursor-pointer hover:bg-gray-100" @click="$emit('editQuestion', index)">
                
                <div class="flex justify-between items-center py-2">
                    <h4 class="text-black font-bold text-lg">Questão {{ index + 1 }}</h4>
                    <UButton size="sm" icon="i-lucide-x" variant="ghost" color="error"
                        class="cursor-pointer rounded-full" @click.stop="$emit('removeQuestion', index)" />
                </div>

                <div class="space-y-2">
                    <div class="text-black">
                        {{ question.question }}
                    </div>
                    <!-- <div>
                        <span class="font-semibold text-black">Tipo:</span>
                        <span class="text-black">
                            {{ question.type === 'mul' ? 'Múltipla escolha' : 'Dissertativa' }}
                        </span>
                    </div> -->
                    <div v-if="question.type === 'mul'" class="space-y-4">
                        <span class="font-semibold text-black">Alternativas:</span>

                        <div 
                            v-for="(opt, index) in question.options" 
                            class="text-black flex items-center space-x-2"
                        >
                            <UIcon
                                :name="question.correct.includes(index) ? 'i-lucide-check' : 'i-lucide-x'"
                                :class="question.correct.includes(index) ? 'text-green-500' : 'text-red-500'"
                            />                        

                            <span class="font-bold">{{ index + 1 }} - </span>
                            <span>{{ opt }}</span>
                        </div>

                    </div>
                </div>
            </div>

            <!-- se a pergunta estiver no modo editar -->
            <UForm class="p-2 bg-gray-200 rounded-xl" v-else :schema="valiSchema" :state="question">

                <!-- header -->
                <div class="flex justify-between items-center py-2">
                    <h4 class="text-black font-bold text-lg">Questão {{ index + 1 }}</h4>

                    <UButton size="sm" icon="i-lucide-x" variant="ghost" color="error"
                        class="cursor-pointer rounded-full" @click="$emit('removeQuestion', index)" />
                </div>

                <!-- inputs da pergunta -->
                <div class="space-y-2">
                    <UFormField label="Pergunta" :ui="formFieldUi" name="question">
                        <UTextarea v-model="question.question" :ui="inputUi" class="w-full"
                            placeholder="Escreva o enunciado da pergunta aqui" />
                        <!-- <UInput v-model="question.question" :ui="inputUi" type="text"></UInput> -->
                    </UFormField>

                    <!--  O tipo de pergunta  -->
                    <UFormField label="Tipo" :ui="formFieldUi" name="">
                        <USelect v-model="question.type" :items="questionTypes" class="py-2 w-full bg-white text-black">
                        </USelect>
                    </UFormField>

                    <!-- alternativas caso for multipla escolha -->
                    <template v-if="question.type === 'mul'">

                        <!-- input alternativa -->
                        <UFormField v-for="(opt, optIndex) in question.options" :ui="formFieldUi"
                            :label="optIndex === 0 ? 'Alternativas' : null" :name="`options[${optIndex}]`">
                            <div class="flex space-x-2 items-center">
                                
                                <!-- se a alternativa é a correta -->
                                <UButton 
                                    :color="question.correct.includes(optIndex) ? 'primary' : 'error'"
                                    variant="ghost"
                                    :icon="question.correct.includes(optIndex) ? 'i-lucide-check' : 'i-lucide-x'"
                                    class="cursor-pointer rounded-full"
                                    @click="$emit('changeCorrect', index, optIndex)"
                                />

                                <!-- input do texto -->
                                <UInput type="text" :ui="inputUi" v-model="question.options[optIndex]" class="grow"
                                    placeholder="Texto da alternativa"></UInput>


                                <!-- apagar alternativa -->
                                <UButton variant="ghost" color="error" icon="i-lucide-minus"
                                    class="cursor-pointer rounded-full"
                                    @click="$emit('removeOption', index, optIndex)">
                                    <span class="hidden md:block">Remover</span>
                                </UButton>
                            </div>
                        </UFormField>

                        <!-- adicionar alternativas -->
                        <UButton variant="ghost" color="info" icon="i-lucide-plus"
                            class="w-full flex justify-center cursor-pointer" @click="$emit('addOption', index)">
                            Adicionar alternativa
                        </UButton>
                    </template>
                </div>

                <!-- footer -->
                <div class="flex justify-end mt-2">
                    <UButton icon="i-lucide-check" @click="$emit('saveQuestion', index)">
                        Salvar
                    </UButton>
                </div>
            </UForm>
        </div>

        <!-- adicionar pergunta -->
        <UButton class="w-full p-3 flex justify-center cursor-pointer" icon="i-lucide-plus" variant="ghost" color="info"
            @click="$emit('addQuestion')">
            Adicionar pergunta
        </UButton>
    </div>
</template>

<script setup>
import * as valibot from 'valibot';
import { computed, watch } from 'vue';

const props = defineProps({
    questions: {
        type: Array,
        required: true
    },
    formFieldUi: {
        type: Object,
    },
    inputUi: {
        type: Object
    }
});

const questionTypes = [
    {
        label: "Múltipla escolha",
        value: "mul"
    },
    {
        label: "Dissertativa",
        value: "dis"
    }
]

const valiSchema = valibot.object({
    // nome da prova
    question: valibot.pipe(valibot.string(), valibot.minLength(5, "Tem que ter no minímo 5 letras")),
});  
</script>