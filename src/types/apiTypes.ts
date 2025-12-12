/**
 * src/types/apiTypes.ts
 *
 * Centraliza todas as interfaces TypeScript que representam as
 * estruturas de dados da API Guará-Py.
 */

// --- Tipos Genéricos para Respostas SPARQL ---

// Representa um único valor (binding) em uma resposta SPARQL JSON
export interface SparqlBindingValue {
  type: 'uri' | 'literal' | 'bnode';
  value: string;
  datatype?: string; // Ex: "http://www.w3.org/2001/XMLSchema#integer"
  'xml:lang'?: string; // Ex: "pt-BR"
}

// Representa uma linha de resultado, mapeando nomes de variáveis para seus valores
export type SparqlResult = Record<string, SparqlBindingValue>;

// Estrutura completa de uma resposta de consulta SPARQL
export interface SparqlQueryResponse {
  head: {
    vars: string[];
  };
  results: {
    bindings: SparqlResult[];
  };
}

// --- Tipos de Autenticação ---

// Resposta completa do endpoint de login
export interface LoginResponse {
  token: string;
  user: string; // username
  email: string;
  permissao: string;
  repositorios_associados_nomes: string[];
  validade: string; // Formato ISO de data
}

// Representa os dados do usuário logado, para serem armazenados no Pinia store
export interface AuthenticatedUser {
  username: string;
  email: string;
  permission: string;
  associatedRepositories: string[];
}

// --- Tipos de Repositório ---

// Representa os detalhes de um repositório
export interface Repository {
  uri: string;
  nome: string;
  descricao: string;
  contato: string;
  responsavel: string;
}

// Payload para adicionar os metadados de um novo repositório
export interface AddRepositoryPayload {
  id_local_repo: string;
  nome: string;
  contato: string;
  descricao: string;
  responsavel: string;
}

// Payload para criar um novo dataset no Apache Fuseki
export interface CreateDatasetPayload {
  nome_dataset: string;
  tipo_dataset?: 'tdb2' | 'mem'; // tdb2 é o padrão
}

// --- Tipos de Objetos (Físicos e Dimensionais) ---

// Mapeia um objeto vindo da API para um formato mais amigável para o frontend
export interface MappedObject {
  id: string; // A URI do objeto
  titulo: string;
  descricao?: string;
  resumo?: string;
  tipo?: 'Físico' | 'Dimensional';
  dimensao?: string;
  colecao?: string;
  tiposFisicos?: string[];
}

// Payloads para Objetos Físicos
export interface CreatePhysicalObjectPayload {
  titulo: string;
  resumo: string;
  colecao_id: string;
  repository_update_url: string;
  repository_base_uri: string;
  descricao?: string;
  temRelacao?: string[];
  associatedMedia?: string[];
  tipoFisicoAbreviado?: string[];
}

export interface UpdatePhysicalObjectPayload {
  object_uri_to_update: string;
  titulo: string;
  resumo: string;
  repository_update_url: string;
  repository_base_uri: string;
  descricao?: string;
  colecao_id?: string;
  tipoFisicoAbreviado?: string[];
}

// Payloads para Objetos Dimensionais
export interface CreateDimensionalObjectPayload {
  titulo: string;
  resumo: string;
  tipo_uri: string;
  repository_update_url: string;
  repository_base_uri: string;
  descricao?: string;
  coordenadas?: string;
  temRelacao?: string[];
  associatedMedia?: string[];
}

export interface UpdateDimensionalObjectPayload {
  object_uri_to_update: string;
  titulo: string;
  resumo: string;
  repository_update_url: string;
  descricao?: string;
  coordenadas?: string;
}

// --- Tipos de Relações ---

export interface Relation {
  id?: { value: string };
  property: string;
  value: string;
  valueType: 'uri' | 'literal';
  valueTitle?: string;
}

export interface AddRelationPayload {
  sujeito_id_local: string;
  predicado_uri: string;
  valor_objeto: string;
  tipo_valor_objeto: 'URI' | 'Literal';
  repository_update_url: string;
  repository_base_uri: string;
  literal_datatype_uri?: string;
  literal_lang_tag?: string;
}

export interface RemoveSpecificRelationPayload {
  s: string;
  p: string;
  o: string;
  repository_update_url: string;
}

export interface UpdateObjectPropertiesPayload {
  object_uri_to_update: string;
  titulo: string;
  resumo: string;
  repository_update_url: string;
  descricao?: string;
}

// --- Tipos de Mídia ---

export interface UploadResponse {
  message: string;
  objeto_uri: string;
  associacoes_sucesso: string[];
  associacoes_falha: { media_identificador: string; erro: string }[];
}

export interface RemoveMediaResponse {
  message: string;
  media_uri_removida: string;
  ficheiro_movido?: string;
}

export interface MediaFile {
  nome_arquivo_local: string;
  uri_sparql_correspondente: string | null;
  presente_localmente: boolean;
  presente_sparql: boolean;
}

export interface ListMediaResponse {
  objeto_id_consultado: string;
  path_pasta_uploads: string;
  arquivos_locais: string[];
  midias_associadas_sparql: {
    media_uri: string;
    objeto_associado_uri: string;
  }[];
  arquivos_combinados: MediaFile[];
}

// --- Tipos de Grafo (para a Home/Visualização) ---
export interface GraphNode {
  id: string; // URI do recurso
  name: string;
  type: 'collection' | 'object' | 'repository';
  description?: string;
}

export interface GraphLink {
  source: string; // URI do objeto de origem
  target: string; // URI do objeto ou coleção de destino
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// --- Tipos de Classes (Ontologia) ---

// Representa uma classe ontológica mapeada para o frontend
export interface OntologyClass {
  uri: string;
  label?: string;
  description?: string;
  subclassOf?: string;
}

// Payload para criar uma nova classe
export interface CreateClassPayload {
  label: string;
  comment: string;
  subclassof_localname: string;
  repository_update_url: string;
  repository_base_uri: string;
}

// Payload para alterar uma classe existente
export interface UpdateClassPayload {
  class_uri: string;
  new_label: string;
  new_comment: string;
  new_subclassof_localname: string;
  repository_update_url: string;
  repository_base_uri: string;
}
