// src/boot/axios.ts
import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { useAuthStore } from 'src/stores/auth-store';
import { Notify } from 'quasar';

const API_BASE_URL = 'http://localhost:5000';
console.log('API_BASE_URL:', API_BASE_URL);
const api = axios.create({ baseURL: API_BASE_URL });

// Interceptor de requisição - configurado imediatamente
api.interceptors.request.use((config) => {
  // Log para depuração
  console.log('=== DEBUG: Interceptor de Requisição ===');
  console.log('URL da requisição:', config.url);
  console.log('Método:', config.method);

  // Tentar obter o token do sessionStorage diretamente
  const token = sessionStorage.getItem('guara_token');
  console.log('Token do sessionStorage:', token);

  // Verificar se é um token JWT válido (não um token do Quasar)
  if (token && !token.startsWith('__q_strn|')) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(
      'Header Authorization adicionado:',
      config.headers.Authorization
    );
  } else {
    console.log('Token inválido ou não encontrado:', token);
  }

  // Adicionar Content-Type para requisições POST/PUT
  if (config.method === 'post' || config.method === 'put') {
    config.headers['Content-Type'] = 'application/json';
  }

  console.log('Headers finais:', config.headers);
  console.log('=====================================');

  return config;
});

api.interceptors.response.use(
  (response) => response, // Sucesso, apenas retorne a resposta
  (error) => {
    // Se for um erro de rede, notifique o usuário
    if (error.response) {
      // O servidor respondeu com um status de erro (4xx, 5xx)
      const message =
        error.response.data.message || 'Ocorreu um erro na requisição.';
      Notify.create({ type: 'negative', message });
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta (ex: backend offline)
      Notify.create({
        type: 'negative',
        message:
          'Não foi possível conectar ao servidor. Verifique sua conexão.',
      });
    } else {
      // Erro ao configurar a requisição
      Notify.create({
        type: 'negative',
        message: 'Erro inesperado ao criar a requisição.',
      });
    }
    return Promise.reject(error);
  }
);

export default boot(({ app, store }) => {
  app.config.globalProperties.$api = api;
});

export { api };
