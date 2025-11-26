<template>
    <div class="w-full">
        <!-- Card Container -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">

            <!-- Card Header with red accent -->
            <div class="bg-red-600 p-3 text-white">
                <h2 class="text-2xl font-bold">{{ title }}</h2>
            </div>
            
            <!-- Card Body -->
            <div class="p-3">

                <!-- conteudo principal -->
                <div 
                    class="grid justify-between space-y-4 mb-2" 
                    :class="
                    contents.length < 4 
                    ?
                    `grid-cols-${contents.length}`
                    :
                    'grid-flow-row md:auto-cols-min md:grid-flow-col'
                    "
                >

                    <div v-for="content in contents">
                        <div class="flex items-center space-x-1 text-red-500">
                            <!-- icone -->
                            <u-icon v-if="content.icon" :name="`i-lucide-${content.icon}`" size="10"></u-icon>
                            <!-- titulo -->
                            <span>{{ content.title }}</span>
                        </div>
                        <!-- dado do titulo -->
                        <span class="text-gray-500">{{ content.data }}</span>
                    </div>
                </div>

                <!-- botões -->
                <div class="flex flex-col md:flex-row md:justify-end space-x-2 space-y-2" >
                    <u-button 
                        v-for="button in buttons"
                        v-if="title !== 'Erro'" 
                        :to="button.to"
                        :icon="`i-lucide-${button.icon}`"
                        :color="button.color"
                        class="w-full md:w-auto h-full py-2 cursor-pointer"
                        @click="button.onClick"
                    >
                        {{ button.text }}
                    </u-button>
                </div>
            </div>
        
        </div>
    </div>
</template>

<script setup>
// TODO: resolver o problema de quando não tem botões

const props = defineProps({
    title: {
        type: String,
        default: 'Sem dados'
    },

    // content vai ser um array de objetos, ele espera:
    // { icon: 'icone desejado', text: 'texto desejado'm data: 'dado desejado' }
    contents: {
        type: Array,
        default: () => [{ icon: 'circle-x', title: 'Sem dados', data: "Talvez aconteceu um erro" } ]
    },

    buttons: {
        type: Array,
        default: () => [{ text: 'Editar', icon: 'users', to: '#', color: 'error' }],
    }
});

</script>