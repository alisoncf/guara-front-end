import { defineStore } from 'pinia';
import { SessionStorage } from 'quasar';
import { StorageKey } from 'src/constants/StorageKey';
import { ObjetoFisico } from './../pages/tipos';

const defaultState: ObjetoFisico = {
  id: '',
  obj: '',
  resumo: '',
  tipo: '',
  tipo_id: '',
  titulo: '',
  contentUrl: []
};

export const useDadosObjetoFisico = defineStore('useDadosObjetoFisico', {
  state: () => ({
    ...defaultState,
    ...JSON.parse(SessionStorage.getItem(StorageKey.objetoFisico) || '{}'),
  }),

  getters: {
    getObjetoFisico(): ObjetoFisico {
      return this.$state;
    },
  },

  actions: {
    salvarObjetoFisico(objeto: ObjetoFisico) {
      SessionStorage.set(StorageKey.objetoFisico, JSON.stringify(objeto));
      this.$state = { ...objeto };
    },
  },
});
