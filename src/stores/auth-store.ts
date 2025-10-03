import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { login as loginService } from 'src/services/authService';
import type { AuthenticatedUser, LoginResponse } from 'src/types/apiTypes';

// --- NOVA FUNÇÃO HELPER ---
// Função para parsear o JSON de forma segura, evitando que a app quebre.
function getStoredUser(): AuthenticatedUser | null {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return null;
  }
  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Erro ao parsear dados do usuário do localStorage:', error);
    // Se os dados estiverem corrompidos, limpa para evitar erros futuros.
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
}


export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const token = ref<string | null>(localStorage.getItem('token'));
  // --- CORREÇÃO AQUI: Usa a função segura ---
  const user = ref<AuthenticatedUser | null>(getStoredUser());

  // --- GETTERS ---
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userName = computed(() => user.value?.username || 'Usuário');
  const userPermission = computed(() => user.value?.permission || null);

  // --- ACTIONS ---

  function _setUserState(loginData: LoginResponse) {
    token.value = loginData.token;
    user.value = {
      username: loginData.user,
      email: loginData.email,
      permission: loginData.permissao,
      associatedRepositories: loginData.repositorios_associados_nomes,
    };

    api.defaults.headers.common.Authorization = `Bearer ${token.value}`;

    localStorage.setItem('token', token.value);
    localStorage.setItem('user', JSON.stringify(user.value));
  }

  async function login(credentials: { email: string; password: string; }) {
    try {
      const responseData = await loginService(
        credentials.email,
        credentials.password
      );
      _setUserState(responseData);
      Notify.create({
        type: 'positive',
        message: 'Login realizado com sucesso!',
      });
      return true;
    } catch (error) {
      console.error('Falha na ação de login:', error);
      return false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;

    delete api.defaults.headers.common.Authorization;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Também limpa o repositório atual ao fazer logout
    localStorage.removeItem('currentRepository');

    Notify.create({
      type: 'info',
      message: 'Você foi desconectado.',
    });
  }

  function hydrate() {
    if (token.value) {
      api.defaults.headers.common.Authorization = `Bearer ${token.value}`;
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userName,
    userPermission,
    login,
    logout,
    hydrate,
  };
});
