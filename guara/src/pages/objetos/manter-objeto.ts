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
  associatedMedia:  string[];
  repositorio: string;

}
