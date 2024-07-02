<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
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
            Guará: Cultural Heritage RDF Information System
          </div>
        </q-toolbar-title>
        <div><img src="../assets/cmg.gif" width="100" alt="" /></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header></q-item-label>
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-notifications />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/EssentialLink.vue';

defineOptions({
  name: 'MainLayout'
});

const linksList: EssentialLinkProps[] = [
  {
    title: 'Login',
    caption: 'Acesso Administrativo',
    icon: 'login',
    link: '/login'
  },
  {
    title: 'Objetos e Coleções',
    caption: 'Pesquisar objetos e coleções',
    icon: 'category',
    link: '/abrir-colecoes'
  },
  {
    title: 'Organização e Estrutura',
    caption: 'Definição da estrutura do espaço de memória',
    icon: 'corporate_fare',
    link: '/organizacao-estrutura'
  },
  {
    title: 'Vocabulário',
    caption: 'Definições de vocabulário e ontologias',
    icon: 'chat',
    link: '/vocabulario'
  },
  {
    title: 'Informações do Espaço',
    caption: 'Endereço, telefone e email',
    icon: 'rss_feed',
    link: '/informacoes-espaco'
  },
  {
    title: 'Repositórios amigos',
    caption: 'Rede de repositórios conectados',
    icon: 'public',
    link: '/repositorios-amigos'
  },
  {
    title: 'Contato',
    caption: 'Informações e contato do projeto guará',
    icon: 'favorite',
    link: '/contato'
  }
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
