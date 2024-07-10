import { QTableProps } from 'quasar';

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

export type Coluna = ArrElement<QTableProps['columns']>;
export interface ObjetoFisico {
  obj: string; // URI completa do objeto
  id: string; // ID do objeto (final da URI)
  titulo: string;
  tipo: string[];
  resumo: string;
  tipo_id: string; // apenas o final do tipo
  contentUrl: string[];
  descricao: string;
  altura: number;
  largura: number;
  profundidade: number;
  peso: number;
  material: string;
  dataCriacao: string; // Data de criação do objeto
  dataModificacao: string; // Data de modificação do objeto
  classe: string; // URI completa da classe associada ao objeto
  pertence: string; // Ligação à classe do acervo
  type:  string[];

}


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


