import { createRouter, createWebHistory } from 'vue-router';
import DasboardAdmin from '@/pages/DasboardAdmin.vue';
import AuthPage from '@/pages/AuthPage.vue';
import Exam from '@/pages/Exam.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // pagina admin
    {
      path: "/login",
      component: AuthPage
    },
    // pagina de provas
    {
      path: "/",
      component: DasboardAdmin
    },
    // pagina de criar / editar provas
    {
      path: "/exam",
      component: Exam
    },
    // mesma pagina acima mas com parametro
    {
      path: "/exam/:id",
      component: Exam
    }
  ],
})

export default router
