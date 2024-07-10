import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'abrir-colecoes', component: () => import('pages/AbrirColecoes.vue') } ,
      { path: 'organizacao-estrutura', component: () => import('pages/AbrirEstrutura.vue') },
      { path: 'criar-objeto', component: () => import('pages/objetos/CriarObjeto.vue') },
      {
        path: '/login',
        component: () => import('pages/LoginPage.vue')
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  }
];

export default routes;
