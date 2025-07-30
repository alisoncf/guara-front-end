<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth-store';
import { useRouter } from 'vue-router';
import { Auth, Repositorio } from './tipos';
import { onBeforeMount, ref } from 'vue';
import { listarRepositorios } from 'src/services/api';
import { Notify } from 'quasar';

const router = useRouter();
const store = useAuthStore();

const listaRepositorios = ref([] as Repositorio[]);

async function listarRepo() {
  listaRepositorios.value = await listarRepositorios('');
}
function goToLogin() {
  router.push('/login');
}
function goToLogout() {
  router.push('/logout');
}
function selecionarRepositorio(repo: Repositorio) {
  const auth = ref({} as Auth);
  auth.value.isLoggedIn = false;
  auth.value.user = '';
  auth.value.repositorio_conectado = repo;
  store.set(auth.value);
  Notify.create({
    message: `Repositório "${repo.nome}" selecionado.`,
    color: 'primary',
    position: 'top',
  });
  router.push('/abrir-colecoes');
}
onBeforeMount(() => {
  console.log('montando');
  listarRepo();
});
</script>

<template>
  <div padding>
    <q-btn
      v-if="!store.user"
      icon="login"
      round
      flat
      color="primary"
      @click="goToLogin"
      class="q-mr-md q-mt-md"
      size="md"
      label="Admin"
    />

    <div class="q-pa-md q-gutter-md flex column">
      <q-card
        v-if="store.user"
        class="q-pa-md"
        style="max-width: 400px; width: 100%"
      >
        <q-card-section>
          <div class="text-subtitle1">Usuário conectado: {{ store.user }}</div>
          <div v-if="store.repositorio_conectado" class="q-mt-sm">
            Repositório: {{ store.repositorio_conectado.nome }}
          </div>
          <div v-if="store.repositorio_conectado" class="q-mt-sm">
            URI: {{ store.repositorio_conectado.uri }} token
            {{ store.token }} validade {{ store.validade }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Logout" color="primary" @click="goToLogout" flat />
        </q-card-actions>
      </q-card>

      <div
        v-if="!store.user || store.user == undefined || store.user == ''"
        class="row justify-left q-gutter-md"
        style="max-width: 1000px"
      >
        <q-card
          v-for="repo in listaRepositorios"
          :key="repo.uri"
          class="cursor-pointer"
          style="width: 300px"
          bordered
          flat
          hoverable
          @click="selecionarRepositorio(repo)"
        >
          <q-card-section>
            <div class="text-bold">{{ repo.nome }}</div>
            <div class="text-body2 q-mt-sm">{{ repo.descricao }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>
