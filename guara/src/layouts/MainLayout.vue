<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import EssentialLink, {
  EssentialLinkProps,
} from 'components/EssentialLink.vue';
import { useDadosRepositorio } from 'src/stores/repositorio-store';
import { useAuthStore } from 'src/stores/auth-store';

defineOptions({
  name: 'MainLayout',
});
const repoStore = useDadosRepositorio();
const authStore = useAuthStore();

const linksList: EssentialLinkProps[] = [
  {
    title: 'Início',
    caption: 'Página Inicial',
    icon: 'home',
    link: '/',
  },
  {
    title: 'Login',
    caption: 'Acesso Administrativo',
    icon: 'login',
    link: '/login',
  },
  {
    title: 'Objetos e Coleções',
    caption: 'Pesquisar objetos e coleções',
    icon: 'category',
    link: '/abrir-colecoes',
  },
  {
    title: 'Organização e Estrutura',
    caption: 'Definição da estrutura do espaço de memória',
    icon: 'corporate_fare',
    link: '/organizacao-estrutura',
  },
  {
    title: 'Vocabulário',
    caption: 'Definições de vocabulário e ontologias',
    icon: 'chat',
    link: '/vocabulario',
  },
  {
    title: 'Informações do Espaço',
    caption: 'Endereço, telefone e email',
    icon: 'rss_feed',
    link: '/informacoes-espaco',
  },
  {
    title: 'Repositórios amigos',
    caption: 'Rede de repositórios conectados',
    icon: 'public',
    link: '/repositorios-amigos',
  },
  {
    title: 'Contato',
    caption: 'Informações e contato do projeto guará',
    icon: 'favorite',
    link: '/contato',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
onBeforeMount(() => {
  const repositorioSelecionado = computed(() => repoStore.get || { nome: 'Nenhum' });
  const usuarioLogado = computed(() => authStore.get || { nome: 'Nenhum' });


})
</script>

<template>
  <q-layout view="lHh LpR fFf">
    <q-header elevated class="bg-primary text-white" >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          color="black"
        />
        <q-toolbar-title>
          <div style="color: black">
            Guará: Repositório Digital do Patrimônio Cultural do Estado de Goiás
          </div>
        </q-toolbar-title>
        <div><img src="../assets/cmg.gif" width="100" alt="" /></div>
      </q-toolbar>
      <q-tabs align="left">
        <q-route-tab to="/organizacao-estrutura" label="Catálogo" />
        <q-route-tab to="/abrir-colecoes" label="Explorar coleções" />
        <q-route-tab to="/" label="O Espaço" />
      </q-tabs>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header></q-item-label>
        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="../assets/guara.png" alt =""  />
          </q-avatar>
          Guará - {{ authStore.get.email}} conectado em #{{ authStore.get.repositorio }}
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

    <q-notifications />
  </q-layout>
</template>

