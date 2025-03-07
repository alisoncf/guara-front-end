<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue')" persistent>
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
        <q-btn flat label="Cancelar" color="primary" @click="closeDialog" />
        <q-btn label="Login" color="primary" @click="login" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { efetuarLogin } from 'src/services/api-usuario';
import { listarRepositorios } from 'src/services/api-repo';
import { Auth, Repositorio } from 'src/pages/tipos';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';

const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits(['update:modelValue']);

const email = ref('');
const password = ref('');
const repo = ref({} as Repositorio);
const listaRepositorios = ref([] as Repositorio[]);
const authStore = useAuthStore();

async function login() {
  if (!repo.value) {
    Notify.create({
      type: 'negative',
      message: 'Por favor, selecione um repositório.',
    });
    return;
  }

  try {
    const usuario = await efetuarLogin(email.value, password.value, repo.value.uri);
    closeDialog();
    Notify.create({
      type: 'positive',
      message: 'Login realizado com sucesso!',
    });
  } catch (error) {
    console.error('Erro no login:', error);
    Notify.create({
      type: 'negative',
      message: 'Erro ao tentar efetuar login. Tente novamente.',
    });
  }
}

function closeDialog() {
  emit('update:modelValue', false);
}

async function listarRepo() {
  listaRepositorios.value = await listarRepositorios();
}

onBeforeMount(() => {
  listarRepo();
});
</script>

<style scoped>
.login-card {
  min-width: 400px;
}
</style> 