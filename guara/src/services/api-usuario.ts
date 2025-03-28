import { ref } from 'vue';
import { Notify } from 'quasar';
import { useDadosRepositorio } from 'src/stores/repositorio-store';
import apiConfig from 'src/apiConfig';
import { useAuthStore } from 'src/stores/auth-store';
import { Auth, Repositorio } from 'src/pages/tipos';
import { buscarRepositorio } from './api-repo';

const repoStore = useDadosRepositorio();

const authStore = useAuthStore();
export async function efetuarLogin(
  email: string,
  password: string,
  repositorio: string
): Promise<Auth> {
  const url = apiConfig.baseURL + apiConfig.endpoints.login;
  if (!email || !password) {
    Notify.create({
      type: 'negative',
      message: 'Email e senha são obrigatórios',
    });
    return {} as Auth;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
      repository: repositorio,
    }),
  });

  if (!response.ok) {
    const errorMessage = `Erro ao fazer login (${response.status}): ${response.statusText}`;
    Notify.create({
      type: 'negative',
      message: errorMessage,
    });
    return {} as Auth;
  }
  console.log('inicio')
  const data = await response.json();
  const auth = ref({} as Auth);
  const repo = ref({} as Repositorio);
  auth.value = data;
  console.log('data',data)
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    console.log('setar auth',auth.value)
    authStore.set(auth.value);
    console.log('setado')
    //repo.value = await buscarRepositorio(auth.value.repositorio)

    //await repoStore.set(repo);
  } else {
    Notify.create({
      type: 'negative',
      message: 'Login falhou',
    });
  }

  return auth.value;
}

export async function efetuarLogout(): Promise<boolean> {
  const authStore = useAuthStore();

  try {
    console.log('Iniciando processo de logout...');
    
    // Remove o token do localStorage
    const token = localStorage.getItem('authToken');
    console.log('Token antes de remover:', token);
    localStorage.removeItem('authToken');
    console.log('Token removido do localStorage');
    
    // Limpa os dados do store
    console.log('Estado do auth antes de limpar:', authStore.get);
    authStore.limpar();
    console.log('Estado do auth após limpar:', authStore.get);

    Notify.create({
      type: 'positive',
      message: 'Logout realizado com sucesso',
      position: 'top'
    });

    return true;

  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    Notify.create({
      type: 'negative',
      message: 'Erro ao realizar logout',
      position: 'top'
    });
    return false;
  }
}
