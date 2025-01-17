import { defineStore } from 'pinia';
import { SessionStorage } from 'quasar';
import { StorageKey } from 'src/constants/StorageKey';

import { Repositorio } from 'src/pages/tipos';

const defaultState: Repositorio = {
  contato: '',
  descricao: '',
  nome: '',
  responsavel: '',
  uri: ''

};

export const useDadosRepositorio = defineStore('useDadosRepositorio', {
  state: () => ({
    ...defaultState,
    ...JSON.parse(SessionStorage.getItem(StorageKey.repositorio) || '{}'),
  }),

  getters: {
    get(): Repositorio {
      return this.$state;
    },
  },

  actions: {
    set(objeto: Repositorio) {
      SessionStorage.set(StorageKey.objetoFisico, JSON.stringify(objeto));
      this.$state = { ...objeto };
    },
  },
});
