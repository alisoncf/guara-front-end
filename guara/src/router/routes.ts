const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/public/HomePage.vue') },
      {
        path: 'acervo',
        component: () => import('pages/public/AcervoPage.vue'),
      },
      {
        path: 'acervo/:collectionId',
        component: () => import('pages/public/CollectionObjectsPage.vue'),
        props: true,
      },
      {
        path: 'acervo/objeto/:objectId',
        component: () => import('pages/public/ObjectDetailsPage.vue'),
        props: true,
      },
      {
        path: 'contato',
        component: () => import('pages/public/ContatoPage.vue'),
      },
      { path: 'sobre', component: () => import('pages/public/SobrePage.vue') },
    ],
  },

  // Rotas Admin
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      {
        path: 'dashboard',
        component: () => import('pages/admin/DashboardPage.vue'),
      },

      // Rotas de Coleções
      {
        path: 'collections',
        component: () => import('pages/admin/CollectionsListPage.vue'),
      },
      {
        path: 'collections/new',
        component: () => import('pages/admin/EditCollectionPage.vue'),
      },
      {
        path: 'collections/edit/:id',
        component: () => import('pages/admin/EditCollectionPage.vue'),
        props: true,
      },
      {
        path: 'collections/view/:id',
        component: () => import('pages/admin/ViewCollectionPage.vue'),
        props: true,
      },

      // Rotas de Objetos
      {
        path: 'objects',
        component: () => import('pages/admin/ObjectsListPage.vue'),
      },
      {
        path: 'objects/new',
        component: () => import('pages/admin/CreateObjectPage.vue'),
      },
      {
        path: 'objects/edit/:id',
        component: () => import('pages/admin/EditObjectPage.vue'),
        props: true,
      },
      {
        path: 'objects/view/:id',
        component: () => import('pages/admin/ViewObjectPage.vue'),
        props: true,
      },
      {
        path: 'objects/:id/relations',
        component: () => import('pages/admin/ObjectRelationsPage.vue'),
        props: true,
      },

      // Perfil do usuário
      {
        path: 'profile',
        component: () => import('pages/admin/ProfilePage.vue'),
      },
    ],
  },

  // Rota de fallback (Not Found).
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
