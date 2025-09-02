<template>

    <main class="h-full w-full flex items-center justify-center">

        <div class="w-lg bg-white rounded-md shadow-2xl p-4 mx-2">
            <!-- header -->
            <div class="flex flex-col items-center">
                <!-- icone de bola -->
                <div class="bg-radial-[at_25%_25%] from-red-500 text-white from-40% to-orange-900 size-14 rounded-full flex justify-center items-center">
                    <UIcon name="i-lucide-user" class="size-8"></UIcon>
                </div>
                <h1 class="text-red-500 text-2xl">LOGIN</h1>
            </div>
    
            <!-- form -->
            <AuthForm  class="mt-3 w-full"/>
        </div>

    </main>

</template>

<script setup>
import AuthForm from '@/components/auth/AuthForm.vue';
import useUserStore from '@/stores/user';
import { onMounted } from 'vue';

const user = useUserStore();

onMounted(() => {
    // reseta a store do usuário
    user.$reset();
})

</script>