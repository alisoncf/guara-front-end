import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'inicio/:repo', component: () => import('pages/IndexPage.vue') },
      {
        path: 'abrir-colecoes',
        component: () => import('pages/colecoes/AbrirColecoes.vue'),
      },
      {
        path: 'repositorios-amigos',
        component: () => import('pages/AbrirRepositorios.vue'),
      },
      {
        path: 'organizacao-estrutura',
        component: () => import('pages/estrutura/AbrirEstrutura.vue'),
      },
      {
        path: 'criar-objeto',
        component: () => import('pages/objetos/CriarObjeto.vue'),
      },
      {
        path: 'criar-objeto-dim',
        component: () => import('pages/objetos/DialogoObjetoDim.vue'),
      },
      {
        path: 'editar-objeto/:id',
        component: () => import('pages/objetos/CriarObjeto.vue'),
      },
      {
        path: 'objetos/:id/midias',
        component: () => import('pages/objetos/GerenciarMidias.vue'),
        props: true, // Passa o ID como prop para o componente
      },
      {
        path: 'upload-midias/:id',
        component: () => import('pages/objetos/UploadMidias.vue'),
        props: true, // Passa o ID como prop para o componente
      },
      {
        path: '/login',
        component: () => import('pages/LoginPage.vue'),
      },
      {
        path: '/logout',
        component: () => import('pages/LogoutPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
