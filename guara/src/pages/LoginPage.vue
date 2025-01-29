<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { efetuarLogin } from "src/services/api-usuario";
import { buscarRepositorio, listarRepositorios } from "src/services/api-repo";
import { Auth, Repositorio } from "./tipos";
import { Notify } from "quasar";
import { useRouter } from "vue-router"; // Importando o router
import { useDadosRepositorio } from "src/stores/repositorio-store";

const email = ref("");
const password = ref("");
const repo = ref({} as Repositorio);
const listaRepositorios = ref([] as Repositorio[]);
const router = useRouter(); // Instanciando o router
const repoStore= useDadosRepositorio();
// Função de login
async function login() {
  if (!repo.value) {
    Notify.create({
      type: 'negative',
      message: 'Por favor, selecione um repositório.',
    });
    return;
  }

  try {
    const usuario = ref({} as Auth)
    usuario.value = await efetuarLogin(email.value, password.value, repo.value.uri);
    await router.push('/');

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
  listarRepo();
});
</script>

<template>
  <q-page class="login-page">
    <q-card class="login-card">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="email"
          label="Email"
          type="email"
          :rules="[
            (val) => !!val || 'Email é obrigatório',
            (val) => /.+@.+\..+/.test(val) || 'Email deve ser válido',
          ]"
          autofocus
        />
        <q-input
          v-model="password"
          label="Senha"
          type="password"
          :rules="[(val) => !!val || 'Senha é obrigatória']"
        />
        <q-select
          v-model="repo.uri"
          label="Selecione o repositório"
          :options="listaRepositorios.map((r) => ({ label: r.nome, value: r.uri }))"
          option-value="value"
          option-label="label"
          emit-value
          map-options
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Login" color="primary" @click="login" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.login-card {
  max-width: 400px;
  width: 100%;
}
</style>
