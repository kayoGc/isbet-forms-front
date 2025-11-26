<template>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">

        <UFormField v-if="firstTime" label="Nome" name="name" :ui="formFieldUi">
            <!-- NOME - apenas na primeira vez-->
            <UInput v-model="state.name" type="text" placeholder="Insira o seu nome" icon="i-lucide-user" class="w-full"
                variant="outline" :ui="inputUi" color="info" />
        </UFormField>

        <UFormField label="Email" name="email" class="text-black" :ui="formFieldUi">
            <!-- EMAIL -->
            <UInput v-model="state.email" type="email" placeholder="Insira o seu email" icon="i-lucide-mail"
                class="w-full" :ui="inputUi" color="info" />
        </UFormField>

        <UFormField label="Senha" name="password" :ui="formFieldUi">
            <!-- SENHA -->
            <UInput v-model="state.password" type="password" placeholder="Insira a sua senha" icon="i-lucide-lock"
                class="w-full" variant="outline" :ui="inputUi" color="info" />
        </UFormField>

        <UFormField v-if="firstTime" label="Confirmar senha" name="confirmPassword" :ui="formFieldUi">
            <!-- CONFIRMAR SENHA - apenas na primeira vez -->
            <UInput v-model="state.confirmPassword" type="password" placeholder="Confirme a sua senha"
                icon="i-lucide-lock" class="w-full" variant="outline" :ui="inputUi" color="info" />
        </UFormField>

        <div class="flex justify-center">
            <UButton type="submit" color="error" class="px-2 cursor-pointer">
                {{ firstTime ? 'Cadastrar' : 'Entrar' }}
            </UButton>
        </div>
    </UForm>
</template>


<script setup>
import * as v from 'valibot'
import { ref, inject } from 'vue'
import router from '@/router'
import useUserStore from '@/stores/user'
import authService from '@/services/auth-service'

const firstTime = inject('firstTime', ref(false));
const formFieldUi = {
    label: 'text-black'
}
const inputUi = {
    base: ['bg-white text-black py-2']
}

// esquema usado na validação do formulário
// Observação: tornamos `name` permissivo no objeto base e adicionamos
// validações condicionais que só rodam quando `firstTime.value` for true.
const schema = v.pipe(
    v.object({
        // não exigimos name aqui diretamente, pois o campo pode estar ausente
        name: v.string(),
        email: v.pipe(v.string(), v.nonEmpty("Por favor, insira seu email"), v.email('Email invalido')),
        password: v.pipe(v.string(), v.nonEmpty("Por favor, coloque sua senha"), v.minLength(8, 'Tem que ter pelo menos 8 caracteres')),
        confirmPassword: v.string()
    }),
    // validações adicionais condicionais
    v.forward(
        // checa se as senhas batem apenas no modo de primeiro cadastro
        v.partialCheck(
            [['password'], ['confirmPassword']],
            (input) => firstTime.value ? input.password === input.confirmPassword : true,
            'As senhas não batem'
        ),
        ['confirmPassword']
    ),
    v.forward(
        // exige nome apenas no modo de primeiro cadastro
        v.partialCheck(
            [['name']],
            (input) => firstTime.value ? (typeof input.name === 'string' && input.name.trim().length > 0) : true,
            'Por favor, coloque seu nome'
        ),
        ['name']
    )
);
const state = ref({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
})
const toast = useToast()

// vai rodar quando o botão do formulário for clicado
const onSubmit = async () => {
    if (firstTime.value) {
        await register();
        return;
    }

    // entrando
    await login();
}

const login = async () => {
    try {
        // tenta logar o usuário
        const { success, error, user: userData } = await authService.login(state.value.email, state.value.password);

        if (!success) {
            throw new Error(error);
        }

        // salva os dados do usuário no store
        const user = useUserStore();
        user.name = userData.name;
        user.email = userData.email;
        user.admin = userData.admin;

        // se chegar aqui o usuário logou com sucesso
        await router.push('/dashboard_user');
    } catch (err) {
        // o titulo vai aparecer no toast
        const toastProps = {
            title: "",
            color: 'error',
            icon: 'i-lucide-x',
        }

        if (err.message === "auth/invalid-credential") {
            toastProps.title = 'Email ou senha incorretos.';
        }

        // se não for nenhum dos erros acima, mostra erro desconhecido
        if (toastProps.title === "") {
            console.error("Erro ao logar:", err.message);
            toastProps.title = 'Erro desconhecido. Tente novamente mais tarde.';
        }

        toast.add(toastProps);
    }
}

const register = async () => {
    try {
        // tenta criar o usuário
        const { success: registerSuccess, error: registerError } = await authService.register(state.value.email, state.value.password, state.value.name);

        if (!registerSuccess) {
            throw new Error(registerError);
        }

        const { success: loginSuccess, error: loginError, user } = await authService.login(state.value.email, state.value.password);
        
        if (!loginSuccess) {
            throw new Error(`LOGIN: ${loginError}`);
        }

        updateStore(user.name, user.email, user.admin);

        // se chegar aqui o usuário foi criado com sucesso
        await router.replace('/');
    } catch (err) {
        // o titulo vai aparecer no toast
        const toastProps = {
            title: "",
            color: 'error',
            icon: 'i-lucide-x',
        }

        if (err.message.includes("DUPLICATE")) {
            toastProps.title = "Email já está cadastrado!";
        }

        if (err.message.startsWith("LOGIN")) {
            console.log("Erro no login:", err.message);

            toastProps.color = "primary",
            toastProps.icon  =  "i-lucide-check"
            toastProps.title = "Usuário criado com sucesso! Basta logar agora!"
            firstTime.value = false;
        }

        // se não for nenhum dos erros acima, mostra erro desconhecido
        if (toastProps.title === "") {
            console.error("Erro ao logar:", err.message);
            toastProps.title = 'Um erro desconhecido aconteceu. Tente novamente mais tarde.';
        }

        toast.add(toastProps);
    }
}

/**
 * Vai atualizar a store do usuário
 * @param name nome do usuário
 * @param email email do usuário
 * @param admin se o usuário é admin ou não
 */
const updateStore = (name, email, admin) => {
    const user = useUserStore();
    user.name = name;
    user.email = email;
    user.admin = admin;
}

</script>