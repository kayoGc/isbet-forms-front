import { createRouter, createWebHistory } from 'vue-router';
import DashboardUser from '@/pages/DashboardUser.vue';
import DasboardAdmin from '@/pages/DasboardAdmin.vue';
import AuthPage from '@/pages/AuthPage.vue';
import Exam from '@/pages/Exam.vue';
import Exams from '@/pages/Exams.vue';
import Students from '@/pages/Students.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // pagina admin
    {
      path: "/login",
      component: AuthPage
    },
    {
      path: "/",
      component: DashboardUser
    },
    // pagina de provas
    // {
    //   path: "/",
    //   component: DasboardAdmin
    // },
    // pagina de criar / editar provas
    {
      path: "/exam",
      component: Exam
    },
    // mesma pagina acima mas com parametro
    { 
      path: "/exam/:id",
      component: Exam
    },
    {
      path: '/students',
      component: Students
    }
  ],
})

export default router
