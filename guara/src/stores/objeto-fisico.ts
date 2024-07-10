import { defineStore } from 'pinia';
import { SessionStorage } from 'quasar';
import { StorageKey } from 'src/constants/StorageKey';
import { ObjetoFisico } from './../pages/tipos';

const defaultState: ObjetoFisico = {
  id: '',
  obj: '',
  resumo: '',
  tipo: [],
  tipo_id: '',
  titulo: '',
  contentUrl: [],
  altura: 0,
  dataCriacao:'',
  dataModificacao:'',
  descricao:'',
  classe: '',
  largura: 0,
  material: '',
  profundidade: 0,
  peso: 0,
  type: [],
  pertence: ''





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
