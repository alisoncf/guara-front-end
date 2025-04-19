import { defineStore } from 'pinia';
import { SessionStorage } from 'quasar';
import { StorageKey } from 'src/constants/StorageKey';
import {
  ObjetoDimensional,
  ObjetoFisico,
} from '../pages/objetos/manter-objeto';

const defaultState = {
  objetoSelecionado: {} as ObjetoFisico, // Objeto individual
  objetoSelecionadoDim: {} as ObjetoDimensional,
  listaObj: [] as ObjetoFisico[], // Lista de objetos
  keyword: '', // Palavra-chave usada na pesquisa
};

export const useDadosObjetoFisico = defineStore('useDadosObjetoFisico', {
  state: () => {
    // Obtenha dados do SessionStorage e mescle com o defaultState de forma cuidadosa
    const sessionData = JSON.parse(
      SessionStorage.getItem(StorageKey.objetoFisico) || '{}'
    );
    return {
      ...defaultState, // Defina o estado padrão
      ...sessionData, // Mescle os dados da sessão
    };
  },
  getters: {
    get(): ObjetoFisico {
      return this.$state;
    },
    getObjeto(): ObjetoFisico {
      return this.$state.objetoSelecionado;
    },
    getObjetoDim(): ObjetoDimensional {
      return this.$state.objetoSelecionadoDim;
    },
    getLista(): ObjetoFisico[] {
      return this.$state.listaObj;
    },
    getKeyword(): string {
      return this.$state.keyword;
    },
  },

  actions: {
    set(objeto: ObjetoFisico) {
      SessionStorage.set(StorageKey.objetoFisico, JSON.stringify(objeto));
      this.$state = { ...objeto };
    },
    setObjeto(objeto: ObjetoFisico) {
      console.log('storefisico->', objeto);
      this.$state.objetoSelecionado = objeto;
      SessionStorage.set(StorageKey.objetoFisico, JSON.stringify(this.$state));
    },
    setObjetoDim(objeto: ObjetoDimensional) {
      this.$state.objetoSelecionadoDim = objeto;
      SessionStorage.set(
        StorageKey.objetoDimensional,
        JSON.stringify(this.$state)
      );
    },
    setLista(lista: ObjetoFisico[]) {
      this.$state.listaObj = lista;
      SessionStorage.set(StorageKey.objetoFisico, JSON.stringify(this.$state));
    },
    setKeyword(keyword: string) {
      this.$state.keyword = keyword;
      SessionStorage.set(StorageKey.objetoFisico, JSON.stringify(this.$state));
    },
    limparObjeto() {
      this.$state.objetoSelecionado = {} as ObjetoFisico;
      SessionStorage.set(StorageKey.objetoFisico, JSON.stringify(this.$state));
    },
  },
});
