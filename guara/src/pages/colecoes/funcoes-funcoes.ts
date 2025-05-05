import { mapearPropriedade, textoAposUltimoChar } from '../funcoes';
import { Coluna } from '../tipos';

export const colunasFisico = [
  { name: '#', label: '#', align: 'left' },
  //{ name: 'id', label: 'Objeto', align: 'left', field: 'id' },
  {
    name: 'colecao',
    label: 'Coleção',
    align: 'left',
    field: (row) => textoAposUltimoChar(row.colecao, '#'),
    sortable: true,
  },
  {
    name: 'titulo',
    label: 'Título',
    align: 'left',
    field: 'titulo',
    sortable: true,
  },
  {
    name: 'resumo',
    label: 'resumo',
    align: 'left',
    field: (row) =>
      row.resumo.length > 200
        ? row.resumo.substring(0, 200) + ' (...)'
        : row.resumo,
  },

  {
    name: 'tipo de coleção',
    label: 'Tipo',
    align: 'left',
    field: (row) => row.tipoFisicoAbreviado.join(', '),
  },

  { name: 'acoes', label: 'Ações', align: 'center' },
] as Coluna[];

export const colunasRelacaoFis = [
  { name: '#', label: '#', align: 'left' },
  {
    name: 'propriedade',
    label: 'Propriedade',
    align: 'left',
    field: (row) =>
      textoAposUltimoChar(mapearPropriedade(row.propriedade?.value), '#') || '',
    sortable: true,
  },
  {
    name: 'valor',
    label: 'Valor',
    align: 'left',
    field: (row) =>
      row.titulo?.value || textoAposUltimoChar(row.valor?.value, '#') || '',
    sortable: true,
  },
  { name: 'acoes', label: 'Ações', align: 'center' },
] as Coluna[];

export const colunasDim = [
  { name: '#', label: '#', align: 'left' },
  //{ name: 'id', label: 'Objeto', align: 'left', field: 'id' },
  { name: 'titulo', label: 'Título', align: 'left', field: 'titulo' },
  { name: 'resumo', label: 'Resumo', align: 'left', field: 'resumo' },
  {
    name: 'dimensao',
    label: 'Dimensão',
    align: 'left',
    field: 'dimensao',
  },

  { name: 'acoes', label: 'Ações', align: 'center' },
] as Coluna[];
