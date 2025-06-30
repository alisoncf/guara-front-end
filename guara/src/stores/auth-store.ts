import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
// Importa os plugins do Quasar diretamente, em vez de usar o hook useQuasar
import { LocalStorage, Notify } from 'quasar';
import { login as loginService } from 'src/services/authService';

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const token = ref(sessionStorage.getItem('guara_token'));
  const user = ref<string | null>(sessionStorage.getItem('guara_user'));

  // --- GETTERS ---
  const isAuthenticated = ref(!!token.value);

  // --- ACTIONS ---

  /**
   * Função principal de login.
   * @param {object} credentials - Contém o email e a password.
   */
  async function login(credentials: LoginCredentials) {
    try {
      const responseData = await loginService(
        credentials.email,
        credentials.password
      );

      token.value = responseData.token;
      const userData = {
        name: responseData.user,
        email: responseData.email,
        permission: responseData.permissao,
        repositorios: responseData.repositorios_associados_nomes,
      };
      user.value = JSON.stringify(userData);
      isAuthenticated.value = true;

      sessionStorage.setItem('guara_token', token.value);
      sessionStorage.setItem('guara_user', user.value);

      // Log para depuração
      console.log('=== DEBUG: Login Store ===');
      console.log('Token recebido:', responseData.token);
      console.log('Token salvo na store:', token.value);
      console.log(
        'Token salvo no sessionStorage:',
        sessionStorage.getItem('guara_token')
      );
      console.log('isAuthenticated:', isAuthenticated.value);
      console.log('Tipo do token:', typeof responseData.token);
      console.log('Token começa com:', responseData.token?.substring(0, 20));
      console.log('========================');

      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;

      // Adiciona log para depuração
      console.log('Login realizado!');
      console.log('Token:', token.value);
      console.log('User:', userData);
      console.log('isAuthenticated:', isAuthenticated.value);

      // Retorna sucesso para que o componente saiba quando redirecionar
      return true;
    } catch (error) {
      console.error('Erro de login:', error);
      isAuthenticated.value = false;
      Notify.create({
        type: 'negative',
        message: 'Email ou password inválidos. Por favor, tente novamente.',
      });
      throw error;
    }
  }

  /**
   * Função de logout.
   */
  function logout() {
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;

    sessionStorage.removeItem('guara_token');
    sessionStorage.removeItem('guara_user');

    delete api.defaults.headers.common['Authorization'];

    // A store não deve mais se preocupar com o redirecionamento.
    // Isso será feito no componente que chamar a função de logout.
    return true;
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  };
});
