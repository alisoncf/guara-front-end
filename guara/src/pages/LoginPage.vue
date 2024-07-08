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
          :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Email must be valid']"
          autofocus
        />
        <q-input
          v-model="password"
          label="Password"
          type="password"
          :rules="[val => !!val || 'Password is required']"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Login" color="primary" @click="login" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';

const email = ref('');
const password = ref('');
const router = useRouter();

async function login() {
  if (!email.value || !password.value) {
    Notify.create({
      type: 'negative',
      message: 'Email e senha são obrigatórios'
    });
    return;
  }

  try {
    const response = await fetch('https://localhost:5000/acesso/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer login');
    }

    const data = await response.json();

    // Supondo que a resposta contenha um token de autenticação
    if (data.token) {
      // Armazene o token em algum lugar (localStorage, Vuex, Pinia, etc.)

      localStorage.setItem('authToken', data.token);

      // Redirecione o usuário para a página inicial ou outra página protegida
      router.push('/');
    } else {
      Notify.create({
        type: 'negative',
        message: 'Login falhou'
      });
    }
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao fazer login'
    });
  }
}
</script>

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
