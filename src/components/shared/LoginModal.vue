<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:model-value', $event)" persistent>
    <q-card style="width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Login</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          <q-input
            outlined
            v-model="email"
            label="Email"
            type="email"
            lazy-rules
            :rules="[val => !!val || 'O email é obrigatório']"
          />

          <q-input
            outlined
            v-model="password"
            label="Password"
            type="password"
            lazy-rules
            :rules="[val => !!val || 'A password é obrigatória']"
          />

          <div>
            <q-btn
              label="Entrar"
              type="submit"
              color="primary"
              class="full-width"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { useRouter } from 'vue-router'; // Importa o useRouter

// Props para controlar a visibilidade do modal
const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(['update:model-value']);

const authStore = useAuthStore();
const router = useRouter(); // Instancia o router
const email = ref('');
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    const loginSuccess = await authStore.login({ email: email.value, password: password.value });

    // Se o login for bem-sucedido, o componente faz o redirecionamento
    if (loginSuccess) {
      emit('update:model-value', false); // Fecha o modal
      router.push('/admin/dashboard'); // Redireciona para o dashboard
    }

  } catch (error) {
    // O erro já é tratado na store, aqui apenas paramos o loading.
  } finally {
    loading.value = false;
  }
}
</script>
