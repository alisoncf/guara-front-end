import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Rotas Públicas
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'PublicHome',
        component: () => import('pages/HomePage/HomePage.vue'),
      },
      {
        path: 'catalogo',
        name: 'CatalogoPublico',
        component: () => import('pages/PublicCatalog/CatalogoPublico.vue'),
      },
      {
        path: 'sobre',
        name: 'AboutPage',
        component: () => import('pages/HomePage/HomePage.vue'), // Temporariamente usando HomePage
      },
    ],
  },

  // Rotas Administrativas
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/admin/inicio' },
      {
        path: 'inicio',
        name: 'AdminIndex',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'inicio/:repo',
        name: 'AdminIndexRepo',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'abrir-colecoes',
        name: 'AdminAbrirColecoes',
        component: () => import('pages/colecoes/AbrirColecoes.vue'),
      },
      {
        path: 'repositorios-amigos',
        name: 'AdminRepositoriosAmigos',
        component: () => import('pages/AbrirRepositorios.vue'),
      },
      {
        path: 'organizacao-estrutura',
        name: 'AdminOrganizacaoEstrutura',
        component: () => import('pages/estrutura/AbrirEstrutura.vue'),
      },
      {
        path: 'criar-objeto-dim',
        name: 'AdminCriarObjetoDim',
        component: () => import('pages/objetos/DialogoObjetoDim.vue'),
      },
      {
        path: 'objetos/:id/midias',
        name: 'AdminGerenciarMidias',
        component: () => import('pages/objetos/GerenciarMidias.vue'),
        props: true,
      },
      {
        path: 'upload-midias/:id',
        name: 'AdminUploadMidias',
        component: () => import('pages/objetos/UploadMidias.vue'),
        props: true,
      },
      {
        path: 'logout',
        name: 'AdminLogout',
        component: () => import('pages/LogoutPage.vue'),
      },
    ],
  },

  // Rota Catch-all para erros 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
