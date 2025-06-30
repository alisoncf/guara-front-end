/**
 * src/services/apiTypes.ts
 *
 * Este arquivo centraliza todas as interfaces TypeScript que
 * representam as estruturas de dados da API, baseadas em apispec_1.json.
 */

// --- Tipos de Repositório ---
export interface Repository {
  uri: string;
  nome: string;
  descricao: string;
  contato: string;
  responsavel: string;
  image?: string; // Adicionamos a imagem opcional para o frontend
}

// --- Tipos de Grafo (para a Home) ---
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'collection' | 'object';
  description?: string;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// --- Tipos de Objeto (Físico e Dimensional) ---
export interface ApiObject {
  id: { type: 'uri', value: string };
  titulo: { type: 'literal', value: string };
  descricao?: { type: 'literal', value: string };
  resumo?: { type: 'literal', value: string };
  // A API retorna mais campos, adicione conforme necessário
}

export interface MappedObject {
  id: string;
  titulo: string;
  descricao?: string;
  resumo?: string;
}

// --- Tipos de Autenticação ---
export interface LoginResponse {
  token: string;
  user: string;
  email: string;
  permissao: string;
  repositorios_associados_nomes: string[];
  validade: string;
}

export interface User {
  username: string;
  email: string;
  permission: string;
  associatedRepositories: string[];
}
