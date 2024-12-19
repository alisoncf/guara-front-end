import { QTableProps } from 'quasar';

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

export type Coluna = ArrElement<QTableProps['columns']>;


export interface ClasseComum {
  uri: string; // URI completa da classe
  label: string;
  description: string;
  subclassof: string;
  nome_curto: string;
  mae_curta: string;
}
export interface TreeNode {
  label: string;
  avatar?: string;
  icon?: string;
  img?: string;
  disabled?: boolean;
  children?: TreeNode[];
  displayLabel: string;
  classData: ClasseComum;
}


export interface ClassQueryResult {
  head: {
    vars: string[];
  };
  results: {
    bindings: ClasseQuery[];
  };
}

export interface ClasseQuery {
  class: {
    type: string;
    value: string;
  };
  label: {
    type: string;
    value: string;
  };
  description?: {
    type: string;
    value: string;
  };
  subclassof?: {
    type: string;
    value: string;
  };
}

export interface Head {
  vars: string[];
}

export interface BindingValue {
  type: string;
  value: string;
}

export interface BindingClass {
  class?: BindingValue;
  label?: BindingValue;
  description?: BindingValue;
  subclassof?: BindingValue;
}

export interface ClassResults {
  bindings: BindingClass[];
}

export interface ApiResponse {
  head: Head;
  results: ClassResults;
}


