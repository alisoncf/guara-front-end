<template>
  <q-page class="q-pa-md flex flex-center">
    <div class="main-container form-container">

      <!-- Cabeçalho da Página -->
      <div class="text-center q-mb-xl">
        <h1 class="text-h4 text-weight-bold text-grey-9">Entre em Contato</h1>
        <p class="text-subtitle1 text-grey-7">Tem alguma dúvida ou sugestão? Envie-nos uma mensagem.</p>
      </div>

      <!-- Formulário de Contato -->
      <q-card flat bordered class="q-pa-lg">
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">

          <!-- Campo Nome -->
          <q-input
            outlined
            v-model="form.name"
            label="Seu Nome *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Por favor, digite seu nome']"
          />

          <!-- Campo Email -->
          <q-input
            outlined
            type="email"
            v-model="form.email"
            label="Seu Email *"
            lazy-rules
            :rules="[
              val => val && val.length > 0 || 'Por favor, digite seu email',
              val => /.+@.+\..+/.test(val) || 'Por favor, digite um email válido'
            ]"
          />

          <!-- Campo Mensagem -->
          <q-input
            outlined
            type="textarea"
            v-model="form.message"
            label="Sua Mensagem *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Por favor, digite sua mensagem']"
          />

          <!-- Botão de Envio -->
          <div>
            <q-btn label="Enviar Mensagem" type="submit" color="primary" class="full-width" unelevated/>
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'ContatoPage'
});

const $q = useQuasar();

// Reativo para armazenar os dados do formulário
const form = ref({
  name: '',
  email: '',
  message: ''
});

/**
 * Função chamada quando o formulário é enviado.
 */
function onSubmit() {
  // Por enquanto, apenas exibimos uma notificação de sucesso.
  // No futuro, aqui você faria a chamada para a sua API para enviar o email.
  $q.notify({
    color: 'positive',
    icon: 'check_circle',
    message: 'Mensagem enviada com sucesso! Agradecemos o seu contato.'
  });

  // Limpa o formulário após o envio
  form.value.name = '';
  form.value.email = '';
  form.value.message = '';
}
</script>

<style lang="scss" scoped>
.form-container {
  max-width: 600px; /* Define uma largura máxima para o formulário */
  width: 100%;
}
</style>
