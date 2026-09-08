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
      <q-toolbar class="header-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          color="white"
        />

        <q-avatar size="68px" class="header-logo">
          <img src="../assets/guara.png" alt="Guará" />
        </q-avatar>

        <div class="header-titulo">
          <div class="header-titulo-principal">Guará</div>
          <div class="header-titulo-sub">
            Sistema de Informação Patrimonial
          </div>
        </div>

        <q-space />

        <img
          src="../assets/cmg.gif"
          class="header-logo-parceiro gt-xs"
          alt=""

        />
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
        <div class="footer-texto">
          <div v-if="authStore.get.isLoggedIn" class="row items-center no-wrap">
            <q-avatar size="20px" class="q-mr-xs">
              <img src="../assets/guara.png" alt="" />
            </q-avatar>
            <span class="footer-texto-linha">
              Guará - {{ authStore.get.email }} conectado em #{{
                authStore.get.repositorio_conectado.nome
              }}
            </span>
          </div>
          <div v-else class="footer-texto-linha">
            {{ authStore.get.repositorio_conectado.nome }}
          </div>
        </div>
      </q-toolbar>
    </q-footer>

    <q-notifications />
  </q-layout>
</template>

<style scoped>
.header-toolbar {
  min-height: 48px;
  padding: 4px 8px;
  gap: 10px;
}
.header-logo {
  flex-shrink: 0;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}
.header-logo img {
  object-fit: cover;
}
.header-titulo {
  flex: 1 1 auto;
  min-width: 0;
  line-height: 1.2;
}
.header-titulo-principal {
  font-weight: 700;
  font-size: 17px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.header-titulo-sub {
  font-size: 11px;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.header-logo-parceiro {
  flex-shrink: 0;
  height: 62px;
  width: auto;
  max-width: 100px;
  object-fit: contain;
  background: #ffffff;
  border-radius: 4px;
  padding: 2px 6px;
}

.footer-texto {
  min-width: 0;
  flex: 1 1 auto;
  font-size: 13px;
  line-height: 1;
  overflow: hidden;
}
.footer-texto-linha {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Em telas bem estreitas, esconde o subtítulo pra não espremer o logo do menu */
@media (max-width: 599px) {
  .header-titulo-sub {
    display: none;
  }
}
</style>
