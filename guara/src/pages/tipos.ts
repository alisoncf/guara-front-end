import { QTableProps } from 'quasar';

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

export type Coluna = ArrElement<QTableProps['columns']>;
export interface ObjetoFisico {
  obj: string; // URI completa do objeto
  id: string; // ID do objeto (final da URI)
  titulo: string;
  tipo: string;
  resumo: string;
  tipo_id: string; //apenas o final do tipo

}
