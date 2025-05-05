import apiConfig from 'src/apiConfig';
import { ref } from 'vue';

export const mostrarPopUpObjetoDim = ref(false);
export const mostrarPopUpObjetoFis = ref(false);
export const mostrarPopUpMidias = ref(false);
export const mostrarPopUpRelacoes = ref(false);
export const mostrarPopUpAddRelacao = ref(false);
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
  coordenadas: string;
  lat: string;
  lon: string;
  inicio: string;
  fim: string;
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
export interface ObjetoDigital {
  obj: string; // URI completa do objeto
  id: string; // ID do objeto (final da URI)
  titulo: string;
  resumo: string;
  descricao: string;
  assunto: string;
  tipo: string;
  tipoFisico: string;
  keyword: string;
  coordenadas: string;
  lat: string;
  lon: string;
  inicio: string;
  fim: string;
}

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
  coordenadas: string;
  lat: string;
  lon: string;
  inicio: string;
  fim: string;
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
  lat: string;
  lon: string;
}

export interface Evento {
  obj: ObjetoDimensional;
  inicio: string;
  fim: string;
  periodicidade: string;

}
export const periodicidade{
  mensal: 'Mensal',
  
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

export interface Relacao {
  uri: string;
  nome: string;
  prefixo: string;
  descricao: string;
}
export const QUEM = {
  descricao: 'Relacionar o objeto a uma Pessoa',
  nome: 'quem',
  prefixo: '@prefix obj: <http://guara.ueg.br/ontologias/v1/objetos#>',
  uri: 'http://guara.ueg.br/ontologias/v1/objetos#quem',
} as Relacao;
export const QUANDO = {
  descricao: 'Relacionar o objeto a um tempo',
  nome: 'quando',
  prefixo: '@prefix obj: <http://guara.ueg.br/ontologias/v1/quando#>',
  uri: 'http://guara.ueg.br/ontologias/v1/objetos#quando',
} as Relacao;
export const ONDE = {
  descricao: 'Relacionar o objeto a um lugar',
  nome: 'onde',
  prefixo: '@prefix obj: <http://guara.ueg.br/ontologias/v1/onde#>',
  uri: 'http://guara.ueg.br/ontologias/v1/objetos#onde',
} as Relacao;
export const OQUE = {
  descricao: 'Relacionar o objeto a um evento',
  nome: 'oque',
  prefixo: '@prefix obj: <http://guara.ueg.br/ontologias/v1/evento#>',
  uri: 'http://guara.ueg.br/ontologias/v1/objetos#evento',
} as Relacao;

export const FISICO = {
  descricao: 'Relacionar o objeto a um objeto físico',
  nome: 'fisico',
  prefixo: '@prefix obj: <http://guara.ueg.br/ontologias/v1/fisico#>',
  uri: 'http://guara.ueg.br/ontologias/v1/objetos#fisico',
} as Relacao;

export const MIDIA = {
  descricao: 'Relacionar o objeto a uma mídia',
  nome: 'associatedMedia',
  prefixo: '@prefix schema: <http://schema.org/>',
  uri: 'https://schema.org/associatedMedia',
} as Relacao;
export const LIGAR_COM = {
  descricao: 'Relacionar o objeto a um recurso externo',
  nome: 'relation',
  prefixo: '@prefix dc: <http://purl.org/dc/elements/1.1/relation>',
  uri: 'http://purl.org/dc/elements/1.1/relation',
} as Relacao;

export function listaRelacoes() {
  const relacoes = ref([] as Relacao[]);
  relacoes.value.push(QUEM);
  relacoes.value.push(ONDE);
  relacoes.value.push(QUANDO);
  relacoes.value.push(OQUE);
  relacoes.value.push(MIDIA);
  relacoes.value.push(FISICO);
  relacoes.value.push(LIGAR_COM);
  return relacoes.value;
}

export const tipos_fisicos = [
  { label: 'Bibliotecário', value: 'Bibliotecario' },
  { label: 'Arqueológico', value: 'Arqueologico' },
  { label: 'Museológico', value: 'MuseuLogico' },
  { label: 'Arquivístico-Documental', value: 'Arquivistico-Documental' },
  { label: 'Imagético-Sonoro', value: 'Imagetico-Sonoro' },
];

export interface LabelValue {
  label: string;
  value: string;
}
export interface Tripla {
  prefixo: string;
  id: string;
  propriedade: string;
  valor: string;
  complemento: string;
  tipo_recurso: string;
  titulo: string;
  propriedade_abreviada: string;
}
