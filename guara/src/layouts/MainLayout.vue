<template>
  <q-layout view="hHh lpR fFf">
    <!-- CABEÇALHO (Header) -->
    <q-header elevated class="bg-grey-10 text-white">
      <div class="main-container">
        <q-toolbar class="q-px-none q-py-sm">
          <q-toolbar-title>
            <router-link
              to="/"
              class="text-h5 text-weight-bold text-white"
              style="text-decoration: none"
            >
              Guará
              <span class="text-blue-4">Digital</span>
            </router-link>
          </q-toolbar-title>

          <!-- Navegação Desktop -->
          <div class="gt-sm row items-center no-wrap">
            <q-btn
              v-for="link in navLinks"
              :key="link.name"
              :to="link.to"
              :label="link.name"
              flat
              stretch
              class="q-ml-sm"
            />
            <!-- Botão dinâmico de login/logout com menu -->
            <template v-if="authStore.isAuthenticated">
              <q-btn-dropdown
                color="blue-5"
                unelevated
                class="q-ml-lg"
                :label="authStore.user?.name || 'Usuário'"
                dropdown-icon="arrow_drop_down"
              >
                <q-list>
                  <q-item clickable v-close-popup @click="goToDashboard">
                    <q-item-section> Painel </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="handleLogout">
                    <q-item-section> Logout </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
            <template v-else>
              <q-btn
                label="Login"
                color="blue-5"
                unelevated
                class="q-ml-lg"
                @click="triggerLoginModal"
              />
            </template>
          </div>

          <!-- Botão de Menu Mobile -->
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleRightDrawer"
            class="lt-md"
          />
        </q-toolbar>
      </div>
    </q-header>

    <!-- MENU LATERAL (Drawer) para Mobile -->
    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      overlay
      behavior="mobile"
      elevated
      class="bg-grey-10 text-white"
    >
      <q-list>
        <q-item-label header class="text-grey-5">Navegação</q-item-label>
        <q-item
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          clickable
          v-ripple
        >
          <q-item-section>
            <q-item-label>{{ link.name }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator dark class="q-my-md" />
        <q-item>
          <q-item-section>
            <!-- Botão dinâmico de login/logout no drawer -->
            <template v-if="authStore.isAuthenticated">
              <q-btn-dropdown
                color="blue-5"
                unelevated
                class="full-width"
                :label="authStore.user?.name || 'Usuário'"
                dropdown-icon="arrow_drop_down"
              >
                <q-list>
                  <q-item clickable v-close-popup @click="goToDashboard">
                    <q-item-section> Painel </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="handleLogout">
                    <q-item-section> Logout </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
            <template v-else>
              <q-btn
                label="Login"
                color="blue-5"
                unelevated
                class="full-width"
                @click="triggerLoginModal"
              />
            </template>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- CONTAINER DA PÁGINA -->
    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>

    <!-- RODAPÉ (Footer) -->
    <div class="bg-grey-9 text-grey-4">
      <div class="main-container">
        <div class="q-py-lg">
          <div class="row q-col-gutter-x-xl q-col-gutter-y-xl">
            <div class="col-xs-12 col-md-4">
              <div class="text-h6 text-weight-bold text-white">
                Guará Digital
              </div>
              <p class="q-mt-sm">Digitalizando e conectando o conhecimento.</p>
            </div>
            <div class="col-xs-12 col-md-4">
              <div class="text-h6 text-weight-bold text-white">
                Links Rápidos
              </div>
              <q-list>
                <q-item
                  v-for="link in navLinks"
                  :key="link.name"
                  :to="link.to"
                  clickable
                  class="q-pa-none q-mt-sm"
                >
                  <q-item-section>
                    <q-item-label class="text-grey-4 hover-link">{{
                      link.name
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-xs-12 col-md-4">
              <div class="text-h6 text-weight-bold text-white">Contato</div>
              <p class="q-mt-sm">contato@guaradigital.org</p>
            </div>
          </div>
          <q-separator dark class="q-mt-xl" />
          <div class="q-mt-md text-center">
            &copy; 2024 Guará Digital. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </div>

    <!-- O componente do modal continua igual -->
    <login-modal v-model="showLoginModal" />

    <!-- Chatbot público -->
    <PublicChatbot />
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import LoginModal from 'components/shared/LoginModal.vue';
import PublicChatbot from 'components/PublicChatbot.vue';
import { useAuthStore } from 'stores/auth-store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const rightDrawerOpen = ref(false);
const showLoginModal = ref(false);

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}

function triggerLoginModal() {
  console.log('Tentando abrir o modal de login...');
  showLoginModal.value = true;
}

function handleLogout() {
  authStore.logout();
  router.push('/');
}

function goToDashboard() {
  router.push('/admin/dashboard');
}

const navLinks = [
  { name: 'Início', to: '/' },
  { name: 'Acervo', to: '/acervo' },
  { name: 'Contato', to: '/contato' },
  { name: 'Sobre', to: '/sobre' },
];
</script>

<style lang="scss">
.main-container {
  max-width: 1200px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 16px;
  padding-right: 16px;
}

.q-btn.q-router-link--active {
  color: $blue-4 !important;
}

.hover-link:hover {
  color: white;
  text-decoration: underline;
}
</style>
