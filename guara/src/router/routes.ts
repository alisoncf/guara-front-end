import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Rotas públicas com o novo layout
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'catalogo', component: () => import('pages/CatalogoPublico.vue') },
      { path: 'sobre', component: () => import('pages/SobreNos.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
    ]
  },

  // Rotas administrativas com o layout original
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'inicio/:repo', component: () => import('pages/IndexPage.vue') },
      { path: 'abrir-colecoes', component: () => import('pages/AbrirColecoes.vue') },
      { path: 'repositorios-amigos', component: () => import('pages/AbrirRepositorios.vue') },
      { path: 'organizacao-estrutura', component: () => import('pages/AbrirEstrutura.vue') },
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
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  }
];

export default routes;
