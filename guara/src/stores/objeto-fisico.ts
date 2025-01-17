import { defineStore } from 'pinia';
import { SessionStorage } from 'quasar';
import { StorageKey } from 'src/constants/StorageKey';
import { ObjetoFisico } from '../pages/objetos/manter-objeto';

const defaultState: ObjetoFisico = {
  id: '',
  obj: '',
  resumo: '',
  tipoFisico: [],
  titulo: '',
  altura: 0,
  dataCriacao:'',
  dataModificacao:'',
  descricao:'',
  largura: 0,
  material: '',
  profundidade: 0,
  peso: 0,
  associatedMedia: [],
  assunto: '',
  colecao: '',
  temRelacao:[]

};

export const useDadosObjetoFisico = defineStore('useDadosObjetoFisico', {
  state: () => ({
    ...defaultState,
    ...JSON.parse(SessionStorage.getItem(StorageKey.objetoFisico) || '{}'),
  }),

  getters: {
    get(): ObjetoFisico {
      return this.$state;
    },
  },

  actions: {
    set(objeto: ObjetoFisico) {
      SessionStorage.set(StorageKey.objetoFisico, JSON.stringify(objeto));
      this.$state = { ...objeto };
    },
  },
});
