export type PromessaOuSemRetorno = void | Promise<void> | never;

export interface AcoesRequisicao {
  noSucesso(json: object | string): PromessaOuSemRetorno;
  naRespostaVazia?(): PromessaOuSemRetorno;
  noErro?(resultado: Response): PromessaOuSemRetorno;
  noErroDeRede?(erro: Error): PromessaOuSemRetorno;
}

export interface OpcoesRequisicao extends AcoesRequisicao {
  endpoint: string;
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  tipoRetorno?: 'json' | 'arquivo' | 'html';
  body?: string | FormData | URLSearchParams;
  headers?: Headers;
}

