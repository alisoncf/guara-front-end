/**
 * src/services/repositoryService.ts
 *
 * Serviço para interagir com os endpoints de Repositórios da API (/repositorios).
 */
import { api } from '../boot/axios';
import apiConfig from '../config/apiConfig';
import type {
  Repository,
  SparqlQueryResponse,
  SparqlResult,
  AddRepositoryPayload,
  CreateDatasetPayload,
} from '../types/apiTypes';
import { Notify } from 'quasar';

/**
 * Mapeia um resultado SPARQL para uma interface de Repositório limpa.
 * @param binding - O objeto de binding da resposta SPARQL.
 * @returns Um objeto Repository.
 */
function mapBindingToRepository(binding: SparqlResult): Repository {
  return {
    uri: binding.uri?.value || '',
    nome: binding.nome?.value || 'Nome Indisponível',
    descricao: binding.descricao?.value || '',
    contato: binding.contato?.value || '',
    responsavel: binding.responsavel?.value || '',
  };
}

/**
 * Busca a lista de todos os repositórios de metadados disponíveis.
 * @returns Uma Promise com um array de Repositórios.
 */
export async function fetchAllRepositories(): Promise<Repository[]> {
  try {
    const response = await api.get<SparqlQueryResponse>(
      apiConfig.endpoints.repositorios.list
    );
    return response.data.results.bindings.map(mapBindingToRepository);
  } catch (error) {
    console.error('Erro ao buscar todos os repositórios:', error);
    // O interceptor do axios já notificará o usuário.
    throw new Error('Falha ao carregar os repositórios.');
  }
}

/**
 * Busca a lista de repositórios associados ao usuário autenticado.
 * Requer um token de autenticação válido.
 * @returns Uma Promise com um array de Repositórios do usuário.
 */
export async function fetchMyRepositories(): Promise<Repository[]> {
  try {
    // Este endpoint retorna os dados já num formato mais direto, não SPARQL JSON
    const response = await api.get<{ repositorios: Repository[] }>(
      apiConfig.endpoints.repositorios.myRepos
    );
    return response.data.repositorios || [];
  } catch (error) {
    console.error('Erro ao buscar os repositórios do usuário:', error);
    throw new Error('Falha ao carregar seus repositórios.');
  }
}

/**
 * Adiciona os metadados de um novo repositório ao sistema Guará.
 * @param payload - Os dados do repositório a ser adicionado.
 */
export async function addRepository(payload: AddRepositoryPayload) {
  try {
    const { data } = await api.post(
      apiConfig.endpoints.repositorios.addRepo,
      payload
    );
    Notify.create({
      type: 'positive',
      message: data.message || 'Repositório adicionado com sucesso!',
    });
    return data;
  } catch (error) {
    console.error('Erro ao adicionar repositório:', error);
    throw error;
  }
}

/**
 * Cria um novo dataset diretamente no Apache Fuseki.
 * Esta é uma operação de administração.
 * @param payload - Os dados do dataset a ser criado.
 */
export async function createFusekiDataset(payload: CreateDatasetPayload) {
  try {
    const { data } = await api.post(
      apiConfig.endpoints.repositorios.createDataset,
      payload
    );
    Notify.create({
      type: 'positive',
      message: data.message || `Dataset '${payload.nome_dataset}' criado com sucesso!`,
    });
    return data;
  } catch (error) {
    console.error('Erro ao criar dataset no Fuseki:', error);
    throw error;
  }
}
