import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { useDadosRepositorio } from 'src/stores/repositorio-store';
import apiConfig from 'src/apiConfig';
import { useAuthStore } from 'src/stores/auth-store';
import { Auth, Repositorio } from 'src/pages/tipos';
import { buscarRepositorio } from './api-repo';

const router = useRouter();
const repoStore = useDadosRepositorio();

const authStore = useAuthStore();
export async function efetuarLogin(
  email: string,
  password: string,
  repositorio: string,
  nome_repositorio: string
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
      name: nome_repositorio,
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
  console.log('inicio');
  const data = await response.json();
  const auth = ref({} as Auth);

  auth.value = data;
  auth.value.isLoggedIn = true;

  console.log('auth', auth.value.repositorio_conectado);
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    if (auth.value) {
      authStore.set(auth.value);
    }

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
