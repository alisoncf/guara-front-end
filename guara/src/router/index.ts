import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Guard de autenticação para rotas admin
  Router.beforeEach((to, from, next) => {
    // Verifica se a rota requer autenticação
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      // Verifica se o usuário está autenticado
      const token = sessionStorage.getItem('guara_token');
      console.log(
        '[Router Guard] Rota protegida:',
        to.fullPath,
        '| Token:',
        token
      );
      if (!token) {
        // Redireciona para a página inicial se não estiver autenticado
        next('/');
        return;
      }
    }
    next();
  });

  return Router;
});
