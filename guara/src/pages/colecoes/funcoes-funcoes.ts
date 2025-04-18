import { Coluna } from '../tipos';

export const colunasFisico = [
  { name: '#', label: '#', align: 'left' },
  { name: 'id', label: 'Objeto', align: 'left', field: 'id' },
  { name: 'titulo', label: 'Título', align: 'left', field: 'titulo' },
  {
    name: 'tipo de coleção',
    label: 'Tipo',
    align: 'left',
    field: (row) => row.tipoFisicoAbreviado.join(', '),
  },

  { name: 'acoes', label: 'Ações', align: 'center' },
] as Coluna[];

export const colunasDim = [
  { name: '#', label: '#', align: 'left' },
  { name: 'id', label: 'Objeto', align: 'left', field: 'id' },
  { name: 'titulo', label: 'Título', align: 'left', field: 'titulo' },
  {
    name: 'dimensao',
    label: 'Dimensão',
    align: 'left',
    field: 'dimensao',
  },

  { name: 'acoes', label: 'Ações', align: 'center' },
] as Coluna[];
