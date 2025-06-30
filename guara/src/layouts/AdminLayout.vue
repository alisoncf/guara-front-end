<template>
  <q-layout view="hHh LpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <div class="row items-center">
            <q-icon name="admin_panel_settings" size="24px" class="q-mr-sm" />
            <span class="text-h6">Painel Administrativo</span>
          </div>
        </q-toolbar-title>

        <!-- User menu -->
        <q-btn-dropdown flat color="white" icon="account_circle">
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="$router.push('/admin/profile')"
            >
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Meu Perfil</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Sair</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
      :width="280"
    >
      <q-list>
        <q-item-label header>Navegação</q-item-label>

        <q-item
          clickable
          v-ripple
          :active="$route.path === '/admin/dashboard'"
          @click="$router.push('/admin/dashboard')"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-separator />

        <q-item-label header>Gerenciamento</q-item-label>

        <q-item
          clickable
          v-ripple
          :active="$route.path.startsWith('/admin/collections')"
          @click="$router.push('/admin/collections')"
        >
          <q-item-section avatar>
            <q-icon name="collections" />
          </q-item-section>
          <q-item-section>Coleções</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="$route.path.startsWith('/admin/objects')"
          @click="$router.push('/admin/objects')"
        >
          <q-item-section avatar>
            <q-icon name="inventory_2" />
          </q-item-section>
          <q-item-section>Objetos</q-item-section>
        </q-item>

        <q-separator />

        <q-item-label header>Configurações</q-item-label>

        <q-item
          clickable
          v-ripple
          :active="$route.path === '/admin/profile'"
          @click="$router.push('/admin/profile')"
        >
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Meu Perfil</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple @click="$router.push('/')">
          <q-item-section avatar>
            <q-icon name="public" />
          </q-item-section>
          <q-item-section>Ver Site Público</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth-store';
import { Notify } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function handleLogout() {
  authStore.logout();
  router.push('/');
  Notify.create({
    type: 'info',
    message: 'Logout realizado com sucesso!',
  });
}
</script>

<style scoped>
.q-drawer {
  background: #f5f5f5;
}

.q-item {
  border-radius: 8px;
  margin: 2px 8px;
}

.q-item--active {
  background: #e3f2fd;
  color: #1976d2;
}

.q-item--active .q-icon {
  color: #1976d2;
}
</style>
