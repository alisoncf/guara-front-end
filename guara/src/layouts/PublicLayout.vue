<template>
  <div class="page-container">
    <!-- Container 1: Header com Login/Usuario -->
    <div class="header-container">
      <div class="login-button">
        <!-- Botão de usuário logado ou login -->
        <template v-if="authStore.get?.email">
          <q-btn-dropdown color="primary" :label="authStore.get.email">
            <q-list>
              <q-item clickable v-close-popup @click="goToAdmin">
                <q-item-section>
                  <q-item-label>Área Administrativa</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="logout">
                <q-item-section>
                  <q-item-label>Sair</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
        <q-btn v-else color="primary" @click="showLoginDialog = true">
          Login
        </q-btn>
      </div>
    </div>

    <!-- Container 2: Logo com background -->
    <div class="logo-container">
      <h1 class="logo-text">Guará</h1>
    </div>

    <!-- Container 3: Menu -->
    <div class="menu-container">
      <nav>
        <q-btn flat label="Home" @click="goToHome" />
        <q-btn flat label="Catálogo" @click="goToCatalogo" />
        <q-btn flat label="Sobre Nós" @click="goToAbout" />
      </nav>
    </div>

    <!-- Container 4: Conteúdo -->
    <div class="content-container">
      <router-view />
    </div>

    <!-- Container 5: Footer -->
    <div class="footer-container">
      <p>&copy; 2025 Projeto Guará. Todos os direitos reservados.</p>
    </div>

    <!-- Login Dialog -->
    <q-dialog v-model="showLoginDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Login</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="email" label="Email" type="email" />
          <q-input v-model="password" label="Senha" type="password" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Entrar" @click="handleLogin" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { Notify } from 'quasar';
import { efetuarLogout, efetuarLogin } from 'src/services/api-usuario';

const router = useRouter();
const authStore = useAuthStore();
const showLoginDialog = ref(false);
const email = ref('');
const password = ref('');

function goToAdmin() {
  router.push('/admin/abrir-colecoes');
}

async function logout() {
  console.log('Iniciando logout no layout...');
  const success = await efetuarLogout();
  console.log('Resultado do logout:', success);

  if (success) {
    console.log('Redirecionando para página inicial...');
    router.push('/');
  }
}

async function handleLogin() {
  try {
    if (!email.value || !password.value) {
      Notify.create({
        type: 'negative',
        message: 'Email e senha são obrigatórios',
      });
      return;
    }

    const auth = await efetuarLogin(
      email.value,
      password.value,
      '', // repositorio
      '' // nome_repositorio
    );

    if (auth.isLoggedIn) {
      showLoginDialog.value = false;
      email.value = '';
      password.value = '';
      Notify.create({
        type: 'positive',
        message: 'Login realizado com sucesso!',
      });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    Notify.create({
      type: 'negative',
      message: 'Erro ao realizar login',
    });
  }
}

function goToHome() {
  router.push('/');
}

function goToCatalogo() {
  router.push('/catalogo');
}

function goToAbout() {
  router.push('/sobre');
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-container {
  padding: 1rem;
  background-color: #f5f5f5;
}

.login-button {
  display: flex;
  justify-content: flex-end;
}

.logo-container {
  height: 300px;
  background: url('../assets/guara_image.jpg') no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-text {
  font-size: 4rem;
  color: white;
  text-shadow: 2px 2px 4px black;
  -webkit-text-stroke: 1px black;
}

.menu-container {
  background-color: #333;
  padding: 1rem;
}

.menu-container nav {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.menu-container .q-btn {
  color: white;
  font-size: 1.1rem;
}

.content-container {
  flex: 1;
  padding: 2rem;
}

.footer-container {
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}
</style>
