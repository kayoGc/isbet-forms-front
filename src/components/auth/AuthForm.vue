<template>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Email" name="email" class="text-black" :ui="formFieldUi">
            <UInput 
                v-model="state.email" 
                type="email" 
                placeholder="Insira o seu email"
                icon="i-lucide-mail"
                class="w-full"
                :ui="inputUi"
                color="info"
            />
        </UFormField>       

        <UFormField label="Senha" name="senha" :ui="formFieldUi" >
            <UInput
                v-model="state.password" 
                type="password"
                placeholder="Insira a sua senha" 
                icon="i-lucide-lock"
                class="w-full"
                variant="outline"
                :ui="inputUi"
                color="info"
            />
        </UFormField>
    
        <div class="flex justify-center">
            <UButton type="submit" color="error" class="px-2 cursor-pointer">
                Entrar
            </UButton>
        </div>
    </UForm>
</template>


<script setup>
import * as v from 'valibot'
import useAxios from '@/composables/useAxios'
import { ref } from 'vue'
import router from '@/router'
import useUserStore from '@/stores/user'

const formFieldUi = {
    label: 'text-black'
}

const inputUi = {
    base: ['bg-white text-black py-2']
}

const schema = v.object({
    email: v.pipe(v.string(), v.email('Email invalido')),
    password: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters'))
})

const state = ref({
    email: '',
    password: ''
})

const toast = useToast()

async function onSubmit() {
    try {
        // tenta logar o usuário
        const { data } = await useAxios('post', 'auth/login', {
            email: state.value.email,
            password: state.value.password
        });

        if (data.error) {
            throw new Error(data.message);
        }

        // pega os dados do usuário retornados pelo backend
        const { _id, name, email, admin } = data.result;

        // salva os dados do usuário no store
        const user = useUserStore();
        user._id = _id;
        user.name = name;
        user.email = email;
        user.admin = admin;

        // se chegar aqui o usuário logou com sucesso
        router.push('/');
    } catch (err) {
        // o titulo vai aparecer no toast
        const toastProps = {
            title: "",
            color: 'error',
            icon: 'i-lucide-x',
        }

        if (err.message.startsWith("401")) {
            toastProps.title = 'Email ou senha incorretos.';
        }
        
        if (err.message.startsWith("500")) {
            toastProps.title = 'Erro no servidor. Tente novamente mais tarde.';
        }

        if (err.message.startsWith("404")) {
            toastProps.title = 'Usuário não registrado. Contate um administrador!';
        }

        // se não for nenhum dos erros acima, mostra erro desconhecido
        if (toastProps.title === "") {
            console.error("Erro ao logar:", err.message);
            toastProps.title = 'Erro desconhecido. Tente novamente mais tarde.';
        }

        toast.add(toastProps);
    }
}


</script>