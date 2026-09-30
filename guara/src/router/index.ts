import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useAuthStore } from 'src/stores/auth-store';

// Páginas que fazem sentido sem um repositório já conectado - todo o
// resto precisa de authStore.repositorio_conectado, então quem cair
// direto ali (link externo, F5, digitou a URL) volta pra home, que é
// quem escolhe/entra num repositório (inclusive o padrão automático).
const ROTAS_SEM_REPOSITORIO = ['/login', '/logout', '/exemplo-grafo', '/repositorios-amigos'];
function precisaDeRepositorio(caminho: string): boolean {
  if (caminho === '/' || caminho.startsWith('/inicio/')) return false;
  return !ROTAS_SEM_REPOSITORIO.includes(caminho);
}

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
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to) => {
    const authStore = useAuthStore();
    if (
      precisaDeRepositorio(to.path) &&
      !authStore.get.repositorio_conectado?.uri
    ) {
      return '/';
    }
    return true;
  });

  return Router;
});
