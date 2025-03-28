import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Rotas públicas
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'catalogo', component: () => import('pages/CatalogoPublico.vue') },
      { path: 'sobre', component: () => import('pages/SobreNos.vue') },
    ]
  },

  // Rotas administrativas (protegidas)
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'inicio', component: () => import('pages/IndexPage.vue') },
      { path: 'catalogo', component: () => import('pages/CatalogoPublico.vue') },
      { path: 'abrir-colecoes', component: () => import('pages/AbrirColecoes.vue') },
      { path: 'organizacao-estrutura', component: () => import('pages/AbrirEstrutura.vue') },
      { path: 'repositorios-amigos', component: () => import('pages/AbrirRepositorios.vue') },
      { path: 'criar-objeto', component: () => import('pages/objetos/CriarObjeto.vue') },
      { path: 'editar-objeto/:id', component: () => import('pages/objetos/CriarObjeto.vue') },
      {
        path: 'objetos/:id/midias',
        component: () => import('pages/objetos/GerenciarMidias.vue'),
        props: true
      },
      {
        path: 'upload-midias/:id',
        component: () => import('pages/objetos/UploadMidias.vue'),
        props: true
      },
      {
        path: 'login',
        component: () => import('pages/LoginPage.vue')
      },
      { 
        path: 'catalogo/item/:id', 
        component: () => import('pages/CatalogoItemDetalhes.vue') 
      },
    ],
  },

  {
    path: '/catalogo/:id',
    component: () => import('pages/VisualizarItem.vue'),
    meta: { requiresAuth: false }
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  }
];

export default routes;
