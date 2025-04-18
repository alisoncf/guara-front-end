import apiConfig from 'src/apiConfig';
import { ref } from 'vue';

export const mostrarPopUpObjetoDim = ref(false);
export const mostrarPopUpObjetoFis = ref(false);
export interface Dimensao {
  tipo: string;
  uri: string;
}
export interface ObjetoFisico {
  obj: string; // URI completa do objeto
  id: string; // ID do objeto (final da URI)
  titulo: string;
  tipoFisico: string[];
  tipoFisicoAbreviado: string[];
  resumo: string;
  descricao: string;
  assunto: string;
  temRelacao: string[];
  altura: number;
  largura: number;
  profundidade: number;
  peso: number;
  material: string;
  dataCriacao: string; // Data de criação do objeto
  dataModificacao: string; // Data de modificação do objeto
  colecao: string;
  associatedMedia: string[];
  repositorio: string;
  dimensao: string;
}
export function DimMapping(tipo: string): Dimensao {
  switch (tipo.toLocaleLowerCase()) {
    case 'pessoa':
      return tipoDimensional.Pessoa();
      break;
    case 'evento':
      return tipoDimensional.Evento();
      break;
    case 'tempo':
      return tipoDimensional.Tempo();
      break;
    case 'lugar':
      return tipoDimensional.Lugar();
      break;

    default:
      return { tipo: '', uri: '' };
      break;
  }
}
export const tipoDimensional = {
  Pessoa(): Dimensao {
    return { tipo: 'Pessoa', uri: apiConfig.dimension.Pessoa };
  },
  Lugar() {
    return { tipo: 'Lugar', uri: apiConfig.dimension.Lugar };
  },
  Tempo() {
    return { tipo: 'Tempo', uri: apiConfig.dimension.Tempo };
  },
  Evento() {
    return { tipo: 'Evento', uri: apiConfig.dimension.Evento };
  },
};
export interface ObjetoDimensional {
  obj: string; // URI completa do objeto
  id: string; // ID do objeto (final da URI)
  tipo: Dimensao;
  titulo: string;
  resumo: string;
  descricao: string;
  assunto: string;
  temRelacao: string[];
  quem: string[];
  quando: string[];
  onde: string[];
  oque: string[];
  dataCriacao: string; // Data de criação do objeto
  dataModificacao: string; // Data de modificação do objeto
  associatedMedia: string[];
  repositorio: string;
}

export interface Lugar {
  obj: string; // URI completa do objeto
  id: string; // ID do objeto (final da URI)
  titulo: string;
  resumo: string;
  descricao: string;
  temRelacao: string[];
  altura: number;
  largura: number;
  profundidade: number;
  peso: number;
  material: string;
  dataCriacao: string; // Data de criação do objeto
  dataModificacao: string; // Data de modificação do objeto
  colecao: string;
  associatedMedia: string[];
  repositorio: string;
  dimensao: string;
}

export interface Arquivo {
  nome: string;
  uri: string;
}
export function ListaTipoDim(): Dimensao[] {
  const dim = ref([] as Dimensao[]);
  dim.value.push(DimMapping('pessoa'));
  dim.value.push(DimMapping('tempo'));
  dim.value.push(DimMapping('lugar'));
  dim.value.push(DimMapping('evento'));
  return dim.value;
}
