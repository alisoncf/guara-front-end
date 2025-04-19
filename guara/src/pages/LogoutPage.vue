<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { listarRepositorios } from 'src/services/api-repo';
import { Auth, Repositorio } from './tipos';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router'; // Importando o router
import { useAuthStore } from 'src/stores/auth-store';

const repositorioSelecionado = ref({} as Repositorio);
const listaRepositorios = ref([] as Repositorio[]);
const router = useRouter(); // Instanciando o router
const authStore = useAuthStore();
// Função de login
function logout() {
  try {
    const usuario = ref({} as Auth);
    authStore.set(usuario.value);
    authStore.logout;
    router.push('/');
  } catch (error) {
    console.error('Erro no login:', error);
    Notify.create({
      type: 'negative',
      message: 'Erro ao tentar efetuar login. Tente novamente.',
    });
  }
}

async function listarRepo() {
  listaRepositorios.value = await listarRepositorios();
}

onBeforeMount(() => {
  logout();
});
</script>

<template>
  <q-page class="login-page">
    <q-card class="login-card">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="repositorioSelecionado"
          label="Selecione o repositório"
          :options="listaRepositorios"
          option-value="nome"
          option-label="nome"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Logout" color="primary" @click="logout" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>
