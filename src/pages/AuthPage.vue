<template>

    <main class="h-full w-full flex items-center justify-center p-2">

        <div class="w-lg bg-white rounded-md shadow-2xl p-4 mx-2">
            <!-- header -->
            <div class="flex flex-col items-center">
                <!-- icone de bola -->
                <div class="bg-radial-[at_25%_25%] from-red-500 text-white from-40% to-orange-900 size-14 rounded-full flex justify-center items-center">
                    <UIcon name="i-lucide-user" class="size-8"></UIcon>
                </div>
                <h1 class="text-red-500 text-2xl">
                    {{ firstTime ? 'Cadastrar' : 'Entrar' }}
                </h1>
            </div>
    
            <!-- form -->
            <AuthForm  class="mt-3 w-full"/>

            <div class="flex justify-center mt-4">
                <UButton 
                    variant="ghost"
                    color="secondary"
                    :label="firstTime ?  `Já possui uma conta? Clique aqui para entrar!` : 'Novo aqui? Clique aqui para criar uma conta!'"
                    class="cursor-pointer"
                    @click="changeMode"
                />
            </div>
        </div>

    </main>

</template>

<script setup>
import AuthForm from '@/components/auth/AuthForm.vue';
import useUserStore from '@/stores/user';
import authService from '@/services/auth-service';
import { useRouter } from 'vue-router';
import { onMounted, ref, provide } from 'vue';

const user = useUserStore();
const router = useRouter();
const firstTime = ref(false);

// passa mode para seus filhos
provide('firstTime', firstTime);

onMounted(async () => {
    console.log("== DEBUG AuthPage - onMounted ==");
    
    // reseta a store do usuário
    user.$reset();

    // aguarda o firebase auth inicializar e retornar o usuário se já estiver logado
    const userData = await authService.getUserInfo();

    // coloca as informações do usuário se ele já estiver logado
    if (userData) {
        console.log("Usuário logado");
        
        user.name = userData.name;
        user.email = userData.email;
        user.admin = userData.admin;
        user.uid = userData.uid;
        
        console.log("Store atualizada");

        console.log("Mandando para dasboard...");
        
        router.push('/dashboard_user');

        // para ter certeza que o programa para aqui
        return;
    }

    console.log("Usuário não logado");
});

const changeMode = () => {
    firstTime.value = !firstTime.value;
}
</script>