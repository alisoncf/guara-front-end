// Dados do schema de "Outros dados" pros OBJETOS DIMENSIONAIS (Pessoa,
// Lugar, Evento, Tempo) - mesma ideia de vocabularioFisico.ts, só que
// "aplicaA" usa o tipo da dimensão (Dimensao.tipo) em vez de tipoFisico.
//
// IMPORTANTE: os campos e URIs abaixo são EXEMPLO/placeholder. Troque
// pelos campos e propriedades reais do guaraonto antes de usar em
// produção.

import { CampoVocabulario, filtrarCamposPorTipo } from './vocabularioSchema';

const BASE_ONTO = 'http://guara.ueg.br/ontologias/v1/objetos#';

// TODO: substituir por consulta real ao guaraonto quando o backend
// expuser um endpoint de schema/vocabulário por classe.
export const CAMPOS_VOCABULARIO_DIMENSIONAL: CampoVocabulario[] = [
  {
    chave: 'dataNascimento',
    rotulo: 'Data de nascimento',
    propriedadeUri: BASE_ONTO + 'dataNascimento',
    tipoDado: 'data',
    aplicaA: ['Pessoa'],
  },
  {
    chave: 'dataMorte',
    rotulo: 'Data de morte',
    propriedadeUri: BASE_ONTO + 'dataMorte',
    tipoDado: 'data',
    aplicaA: ['Pessoa'],
  },
  {
    chave: 'apelido',
    rotulo: 'Apelido',
    propriedadeUri: BASE_ONTO + 'apelido',
    tipoDado: 'texto',
    aplicaA: ['Pessoa'],
  },
];

// Junta os campos aplicáveis ao(s) tipo(s) de dimensão do objeto (hoje é
// sempre um só - Pessoa, Lugar, Evento ou Tempo - mas a função já aceita
// lista, igual a camposParaTipos() de vocabularioFisico.ts).
export function camposParaTiposDimensao(tipos: string[]): CampoVocabulario[] {
  return filtrarCamposPorTipo(CAMPOS_VOCABULARIO_DIMENSIONAL, tipos);
}
