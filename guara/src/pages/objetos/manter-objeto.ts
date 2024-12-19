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
