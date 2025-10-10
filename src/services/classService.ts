/**
 * src/services/classService.ts
 *
 * Serviço para interagir com os endpoints de Classes da Ontologia (/classapi).
 */
import { api } from '../boot/axios';
import apiConfig from '../config/apiConfig';
import type {
  SparqlQueryResponse,
  SparqlResult,
  OntologyClass,
  CreateClassPayload,
  UpdateClassPayload,
} from '../types/apiTypes';

/**
 * Mapeia um resultado SPARQL para uma interface de OntologyClass limpa.
 */
function mapBindingToClass(binding: SparqlResult): OntologyClass {
  return {
    uri: binding.class?.value || '',
    label: binding.label?.value,
    description: binding.description?.value,
    subclassOf: binding.subclassof?.value,
  };
}

/**
 * Busca a lista de todas as classes de um repositório.
 * @param repositoryEndpointUrl - A URL de consulta SPARQL do repositório.
 * @param keyword - Termo de busca opcional.
 * @returns Uma Promise com um array de OntologyClass.
 */
export async function fetchClasses(
  repositoryEndpointUrl: string,
  keyword = ''
): Promise<OntologyClass[]> {
  const response = await api.post<SparqlQueryResponse>(
    apiConfig.endpoints.classapi.list,
    {
      repository: repositoryEndpointUrl,
      keyword: keyword,
    }
  );
  return response.data.results.bindings.map(mapBindingToClass);
}

/**
 * Cria uma nova classe na ontologia.
 */
export async function createClass(payload: CreateClassPayload) {
  const { data } = await api.post(apiConfig.endpoints.classapi.add, payload);
  return data;
}

/**
 * Altera uma classe existente na ontologia.
 */
export async function updateClass(payload: UpdateClassPayload) {
  const { data } = await api.post(apiConfig.endpoints.classapi.update, payload);
  return data;
}

/**
 * Exclui uma classe da ontologia.
 */
export async function deleteClass(
  classUri: string,
  repositoryUpdateUrl: string,
  repositoryQueryUrl: string
) {
  const { data } = await api.delete(apiConfig.endpoints.classapi.delete, {
    data: {
      class_uri_to_delete: classUri,
      repository_update_url: repositoryUpdateUrl,
      repository_query_url: repositoryQueryUrl,
    },
  });
  return data;
}
