import { ref } from 'vue';
import { Notify } from 'quasar';
import { useDadosRepositorio } from 'src/stores/repositorio-store';
import apiConfig from 'src/apiConfig';
import { useAuthStore } from 'src/stores/auth-store';
import { Auth, Repositorio } from 'src/pages/tipos';
import { buscarRepositorio } from './api-repo';
import axios from 'axios';

const repoStore = useDadosRepositorio();
const authStore = useAuthStore();

export async function efetuarLogout(): Promise<boolean> {
  try {
    localStorage.removeItem('authToken');
    authStore.limpar();
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
}

export async function efetuarLogin(
  email: string,
  password: string,
  repositorio: string,
  nome_repositorio: string
): Promise<Auth> {
  const url = apiConfig.baseURL + apiConfig.endpoints.login;
  console.log('Tentando login em:', url);

  if (!email || !password) {
    Notify.create({
      type: 'negative',
      message: 'Email e senha são obrigatórios',
    });
    return {} as Auth;
  }

  try {
    console.log('Enviando dados de login:', {
      email,
      repositorio,
      nome_repositorio,
    });
    const response = await axios.post(
      url,
      {
        email: email,
        password: password,
        repository: repositorio,
        name: nome_repositorio,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        validateStatus: function (status) {
          return status < 500; // Aceita qualquer status menor que 500
        },
      }
    );

    console.log('Resposta do servidor:', response.status, response.data);

    if (response.status === 500) {
      console.error('Erro interno do servidor:', response.data);
      throw new Error('Erro interno do servidor ao fazer login');
    }

    if (!response.data || !response.data.token) {
      console.error('Resposta inválida do servidor:', response.data);
      throw new Error('Resposta inválida do servidor');
    }

    const auth = ref({} as Auth);
    auth.value = {
      ...response.data,
      isLoggedIn: true,
    };

    console.log('Dados de autenticação:', auth.value);

    if (auth.value.token) {
      localStorage.setItem('authToken', auth.value.token);
      authStore.set(auth.value);
      return auth.value;
    } else {
      throw new Error('Token não recebido do servidor');
    }
  } catch (error) {
    console.error('Erro detalhado ao fazer login:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro Axios:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
    }
    Notify.create({
      type: 'negative',
      message: 'Erro ao fazer login. Por favor, verifique suas credenciais.',
    });
    return {} as Auth;
  }
}
