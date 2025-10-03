// src/boot/axios.ts
import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { Notify } from 'quasar';
import apiConfig from 'src/config/apiConfig'; // Importe a configuração central

// Crie a instância do axios usando a baseURL da configuração
const api = axios.create({ baseURL: apiConfig.baseURL });

export default boot(({ app }) => {
  // --- Interceptor de Requisição ---
  api.interceptors.request.use((config) => {
    // Tenta obter o token do Local Storage (mais comum para persistência)
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // O Content-Type padrão para POST/PUT/PATCH é application/json.
    // O Axios já faz isso por padrão quando o `data` é um objeto.
    // No entanto, se o `data` for um FormData (para uploads), o Axios
    // define automaticamente o Content-Type para 'multipart/form-data'
    // com o boundary correto. Portanto, não precisamos definir o header aqui.

    return config;
  });

  // --- Interceptor de Resposta (para tratamento de erros) ---
  api.interceptors.response.use(
    (response) => response, // Se a resposta for bem-sucedida, apenas a retorne
    (error) => {
      if (error.response) {
        // O servidor respondeu com um status de erro (4xx, 5xx)
        const status = error.response.status;
        const message = error.response.data?.message || 'Ocorreu um erro no servidor.';

        if (status === 401) {
          // Se o erro for 401 (Não Autorizado), pode ser um token inválido ou expirado.
          // Aqui você pode chamar a ação de logout da sua store para limpar os dados do usuário.
          // Ex: useAuthStore().logout();
          Notify.create({ type: 'negative', message: 'Sua sessão expirou. Por favor, faça login novamente.' });
        } else {
          Notify.create({ type: 'negative', message });
        }
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta (backend offline)
        Notify.create({
          type: 'negative',
          message: 'Não foi possível conectar ao servidor. Verifique a API e sua conexão.',
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

  // Disponibiliza a instância do axios globalmente no app Vue
  app.config.globalProperties.$api = api;
});

export { api };
