/**
 * src/services/dimensionalObjectService.ts
 *
 * Serviço para interagir com os endpoints de Objetos Dimensionais (/dim).
 */
import { api } from '../boot/axios';
import apiConfig from '../config/apiConfig';
import type {
  MappedObject,
  SparqlQueryResponse,
  SparqlResult,
  CreateDimensionalObjectPayload,
  UpdateDimensionalObjectPayload,
} from '../types/apiTypes';

/**
 * Mapeia um resultado SPARQL genérico para um objeto de frontend limpo.
 * @param binding - O objeto de binding da resposta SPARQL.
 * @returns Um objeto MappedObject.
 */
function mapSparqlResultToObject(binding: SparqlResult): MappedObject {
  return {
    id: binding.id?.value || binding.obj?.value || '', // A API usa 'id' ou 'obj'
    titulo: binding.titulo?.value || 'Objeto Sem Título',
    descricao: binding.descricao?.value,
    resumo: binding.resumo?.value || binding.assunto?.value,
    tipo: (binding.tipo?.value as 'Físico' | 'Dimensional') || undefined,
    dimensao: binding.dimensao?.value,
    colecao: binding.colecao?.value,
    tiposFisicos: binding.tipos?.value ? binding.tipos.value.split(', ') : [],
  };
}

/**
 * Busca todos os objetos (físicos e dimensionais) de um repositório.
 * Utiliza o endpoint /dim/listall da API.
 * @param repositoryEndpointUrl - A URL de consulta SPARQL do repositório.
 * @param keyword - Termo de busca opcional.
 * @returns Uma Promise com um array de MappedObjects.
 */
export async function listAllObjects(
  repositoryEndpointUrl: string,
  keyword = ''
): Promise<MappedObject[]> {
  try {
    const response = await api.post<SparqlQueryResponse>(
      apiConfig.endpoints.dimensional.listAll,
      {
        repository: repositoryEndpointUrl,
        keyword: keyword,
      }
    );
    return response.data.results.bindings.map(mapSparqlResultToObject);
  } catch (error) {
    console.error(`Erro ao buscar todos os objetos:`, error);
    return []; // Retorna array vazio em caso de erro para não quebrar a UI
  }
}

/**
 * Cria um novo objeto dimensional (Pessoa, Evento, Lugar, Tempo).
 */
export async function createDimensionalObject(
  payload: CreateDimensionalObjectPayload
) {
  const { data } = await api.post(
    apiConfig.endpoints.dimensional.create,
    payload
  );
  return data;
}

/**
 * Atualiza um objeto dimensional existente.
 */
export async function updateDimensionalObject(
  payload: UpdateDimensionalObjectPayload
) {
  const { data } = await api.put(
    apiConfig.endpoints.dimensional.update,
    payload
  );
  return data;
}

/**
 * Apaga um objeto dimensional.
 * @param objectUriToDelete - A URI completa do objeto a ser apagado.
 * @param repositoryUpdateUrl - A URL de update do repositório.
 * @param repositoryBaseUri - A URI base do repositório.
 */
export async function deleteDimensionalObject(
  objectUriToDelete: string,
  repositoryUpdateUrl: string,
  repositoryBaseUri: string
) {
  const { data } = await api.delete(apiConfig.endpoints.dimensional.delete, {
    data: {
      object_uri_to_delete: objectUriToDelete,
      repository_update_url: repositoryUpdateUrl,
      repository_base_uri: repositoryBaseUri,
    },
  });
  return data;
}
