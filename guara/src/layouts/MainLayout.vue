<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, {
  EssentialLinkProps,
} from 'components/EssentialLink.vue';

import { useAuthStore } from 'src/stores/auth-store';

defineOptions({
  name: 'MainLayout',
});

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
    title: 'Logout',
    caption: 'Sair do Guará',
    icon: 'logout',
    link: '/logout',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<template>
  <q-layout view="hHh lpR fff">
    <q-header elevated class="bg-primary text-white elevated">
      <q-toolbar class="q-pa-xs" style="min-height: 35px; padding: 0 8px">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          color="black"
        />
        <q-toolbar-title style="font-size: 14px; line-height: 1">
          Guará: Repositório Digital do Patrimônio Cultural do Estado de Goiás
        </q-toolbar-title>
        <div><img src="../assets/cmg.gif" width="100" alt="" /></div>
      </q-toolbar>
      <q-tabs
        align="left"
        style="font-size: 13px; height: 35px; margin-top: 0px; padding: 0px"
      >
        <q-route-tab to="/" label="Início" />
        <q-route-tab to="/organizacao-estrutura" label="Catálogo" />
        <q-route-tab to="/abrir-colecoes" label="Explorar coleções" />
      </q-tabs>
    </q-header>

    <q-drawer
      v-if="authStore.get.user != ''"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
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
    <q-footer class="bg-head-and-foot text-black" style="height: 40px">
      <q-toolbar class="q-pa-xs" style="min-height: 40px; padding: 0 8px">
        <q-toolbar-title style="font-size: 13px; line-height: 1">
          <div v-if="authStore.get.isLoggedIn">
            <q-avatar size="24px">
              <img src="../assets/guara.png" alt="" />
            </q-avatar>
            Guará - {{ authStore.get.email }} conectado em #{{
              authStore.get.repositorio_conectado.nome
            }}
          </div>
          <div v-else>
            {{ authStore.get.repositorio_conectado.nome }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

    <q-notifications />
  </q-layout>
</template>
