import { defineStore } from 'pinia';
import { SessionStorage } from 'quasar';
import { StorageKey } from 'src/constants/StorageKey';
import { Auth, Repositorio } from 'src/pages/tipos';

const defaultState: Auth = {
  email: '',
  permissao: '',
  repositorio: '',
  token: '',
  user: '',
  validade: '',
  repositorio_conectado: {} as Repositorio,
  isLoggedIn: false,
};

export const useAuthStore = defineStore('useAuthStore', {
  state: () => {
    let sessionData: Auth = defaultState;
    try {
      const storedData = SessionStorage.getItem(StorageKey.auth);
      if (storedData) {
        sessionData = JSON.parse(storedData as string);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do SessionStorage:', error);
    }

    return {
      ...defaultState,
      ...sessionData,
    };
  },

  getters: {
    get(): Auth {
      return {
        email: this.email,
        permissao: this.permissao,
        repositorio: this.repositorio,
        token: this.token,
        user: this.user,
        validade: this.validade,
        repositorio_conectado: this.repositorio_conectado,
        isLoggedIn: this.isLoggedIn,
      };
    },
  },

  actions: {
    set(objeto: Auth) {
      SessionStorage.set(StorageKey.auth, JSON.stringify(objeto));

      this.email = objeto.email;
      this.permissao = objeto.permissao;
      this.repositorio = objeto.repositorio;
      this.token = objeto.token;
      this.user = objeto.user;
      this.validade = objeto.validade;
      this.repositorio_conectado = objeto.repositorio_conectado;
      this.isLoggedIn = objeto.isLoggedIn || !!objeto.token;
    },

    limpar() {
      SessionStorage.remove(StorageKey.auth);

      this.email = defaultState.email;
      this.permissao = defaultState.permissao;
      this.repositorio = defaultState.repositorio;
      this.token = defaultState.token;
      this.user = defaultState.user;
      this.validade = defaultState.validade;
      this.repositorio_conectado = defaultState.repositorio_conectado;
      this.isLoggedIn = defaultState.isLoggedIn;
    },

    logout() {
      this.email = '';
      this.permissao = '';
      this.repositorio = '';
      this.token = '';
      this.user = '';
      this.validade = '';
      this.repositorio_conectado = {} as Repositorio;
      this.isLoggedIn = false;
    },
  },
});
