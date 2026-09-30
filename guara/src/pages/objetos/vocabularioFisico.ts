// Dados do schema de "Outros dados" pros OBJETOS FÍSICOS - propriedades
// do guaraonto específicas de cada tipo físico. O tipo CampoVocabulario e
// o mecanismo de filtro são genéricos e ficam em vocabularioSchema.ts
// (compartilhados com vocabularioDimensional.ts).
//
// Esta é a ÚNICA peça que deve mudar quando isso passar a vir do backend
// (ex.: um endpoint que consulta a ontologia de verdade): o componente que
// renderiza os campos (ComponenteVocabulario.vue) e o diálogo que o usa
// (DialogoObjetoFis.vue) não sabem - nem precisam saber - de onde esse
// schema vem, só chamam camposParaTipos().
//
// IMPORTANTE: os campos e URIs abaixo são EXEMPLO/placeholder pra validar
// o desenho. Troque pelos campos e propriedades reais do guaraonto antes
// de usar em produção.

import { CampoVocabulario, filtrarCamposPorTipo } from './vocabularioSchema';

const BASE_ONTO = 'http://guara.ueg.br/ontologias/v1/objetos#';

// TODO: substituir por consulta real ao guaraonto quando o backend
// expuser um endpoint de schema/vocabulário por classe.
export const CAMPOS_VOCABULARIO_FISICO: CampoVocabulario[] = [
  {
    chave: 'isbn',
    rotulo: 'ISBN',
    propriedadeUri: BASE_ONTO + 'isbn',
    tipoDado: 'texto',
    aplicaA: ['Bibliotecario'],
  },
  {
    chave: 'editora',
    rotulo: 'Editora',
    propriedadeUri: BASE_ONTO + 'editora',
    tipoDado: 'texto',
    aplicaA: ['Bibliotecario'],
  },
  {
    chave: 'sitioArqueologico',
    rotulo: 'Sítio arqueológico',
    propriedadeUri: BASE_ONTO + 'sitioArqueologico',
    tipoDado: 'texto',
    aplicaA: ['Arqueologico'],
  },
  {
    chave: 'periodoHistorico',
    rotulo: 'Período histórico',
    propriedadeUri: BASE_ONTO + 'periodoHistorico',
    tipoDado: 'texto',
    aplicaA: ['Arqueologico', 'MuseuLogico'],
  },
  {
    chave: 'numeroTombo',
    rotulo: 'Número de tombo',
    propriedadeUri: BASE_ONTO + 'numeroTombo',
    tipoDado: 'texto',
    aplicaA: ['MuseuLogico'],
  },
  {
    chave: 'dataProducao',
    rotulo: 'Data de produção',
    propriedadeUri: BASE_ONTO + 'dataProducao',
    tipoDado: 'data',
    aplicaA: ['MuseuLogico', 'Imagetico-Sonoro'],
  },
  {
    chave: 'tipologiaDocumental',
    rotulo: 'Tipologia documental',
    propriedadeUri: BASE_ONTO + 'tipologiaDocumental',
    tipoDado: 'texto',
    aplicaA: ['Arquivistico-Documental'],
  },
  {
    chave: 'suporte',
    rotulo: 'Suporte',
    propriedadeUri: BASE_ONTO + 'suporte',
    tipoDado: 'texto',
    aplicaA: ['Arquivistico-Documental', 'Imagetico-Sonoro'],
    ajuda: 'Ex.: papel, fita magnética, vidro, digital',
  },
  {
    chave: 'duracao',
    rotulo: 'Duração',
    propriedadeUri: BASE_ONTO + 'duracao',
    tipoDado: 'texto',
    aplicaA: ['Imagetico-Sonoro'],
    ajuda: 'Ex.: 00:12:30',
  },
];

// Junta os campos aplicáveis a uma lista de tipos físicos (um objeto pode
// ter mais de um tipo marcado).
export function camposParaTipos(tipos: string[]): CampoVocabulario[] {
  return filtrarCamposPorTipo(CAMPOS_VOCABULARIO_FISICO, tipos);
}
