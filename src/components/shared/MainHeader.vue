<template>

    <header class="bg-white flex justify-between align-middle">
        <h1 class="text-red-600 text-2xl">ISBET</h1>

        <UDropdownMenu :content="{ align: 'end'}" :items="items" :ui="{ content: 'bg-white', label: 'text-black text-xs', separator: 'hover:bg-warning', item: 'text-black '}">
            <div>
                <UAvatar :alt="user.name ? user.name : '?'" size="md" class="bg-radial-[at_25%_25%] from-red-500 from-40% to-orange-900 cursor-pointer" :ui="avatarUi"></UAvatar>
            </div>
        </UDropdownMenu>

        
    </header>

</template>

<script setup>
import useUserStore from '@/stores/user';
import { ref } from 'vue';

const user = useUserStore();

// estilos do avatar
const avatarUi = { 
    fallback: 'text-white'
}

// items do menu dropdown
const items = [
    [
        { label: user.name ? `Nome: ${user.name}` : '?', type: 'label' },
        { label: user.email ? `Email: ${user.email}` : '?', type: 'label' },
    ],
    [
        { label: 'Sair', icon: 'i-lucide-log-out', to: '/login' }
    ]
]

</script>