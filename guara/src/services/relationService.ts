/**
 * src/services/relationService.ts
 *
 * Serviço para gerenciar as relações (triplas RDF) dos objetos.
 */
import { api } from 'boot/axios';
import apiConfig from 'src/config/apiConfig';
import type {
  Relation,
  SparqlQueryResponse,
  SparqlResult,
  AddRelationPayload,
  RemoveSpecificRelationPayload,
  UpdateObjectPropertiesPayload,
} from 'src/types/apiTypes';
import { Notify } from 'quasar';

/**
 * Mapeia um resultado SPARQL para uma interface de Relação limpa.
 * @param binding - O objeto de binding da resposta SPARQL.
 * @returns Um objeto Relation.
 */
function mapBindingToRelation(binding: SparqlResult): Relation {
  return {
    id: binding.id,
    property: binding.propriedade?.value || '',
    value: binding.valor?.value || '',
    valueType:
      binding.tipo_recurso?.value?.toLowerCase() === 'literal'
        ? 'literal'
        : 'uri',
    valueTitle: binding.titulo?.value,
  };
}

/**
 * Busca todas as relações (propriedades e valores) para uma URI de objeto específica.
 * @param objectUri - A URI completa do objeto (sujeito) a ser consultado.
 * @param repositoryEndpointUrl - A URL do endpoint SPARQL do repositório.
 * @returns Uma promessa que resolve para um array de Relações.
 */
export async function fetchObjectRelations(
  objectUri: string,
  repositoryEndpointUrl: string
): Promise<Relation[]> {
  try {
    const response = await api.post<SparqlQueryResponse>(
      apiConfig.endpoints.relacao.list,
      {
        id_objeto: objectUri,
        repository_sparql_endpoint: repositoryEndpointUrl,
      }
    );
    return response.data.results.bindings.map(mapBindingToRelation);
  } catch (error) {
    console.error(`Erro ao buscar relações para o objeto ${objectUri}:`, error);
    Notify.create({
      type: 'warning',
      message: 'Não foi possível carregar as relações do objeto.',
    });
    return []; // Retorna array vazio em caso de erro.
  }
}

/**
 * Adiciona uma nova relação (tripla s-p-o) a um repositório.
 * @param payload - Os dados da relação a ser adicionada.
 */
export async function addRelation(payload: AddRelationPayload) {
  try {
    const { data } = await api.post(apiConfig.endpoints.relacao.add, payload);
    Notify.create({
      type: 'positive',
      message: data.message || 'Relação adicionada com sucesso!',
    });
    return data;
  } catch (error) {
    console.error('Erro ao adicionar relação:', error);
    // O interceptor do axios já notificará o erro.
    throw error;
  }
}

/**
 * Remove uma relação RDF específica (uma única tripla s-p-o).
 * @param payload - A tripla a ser removida.
 */
export async function removeSpecificRelation(
  payload: RemoveSpecificRelationPayload
) {
  try {
    // O endpoint da API usa o método DELETE
    const { data } = await api.delete(apiConfig.endpoints.relacao.remove, {
      data: payload, // No axios, o corpo de uma requisição DELETE vai na chave 'data'
    });
    Notify.create({
      type: 'positive',
      message: data.message || 'Relação removida com sucesso!',
    });
    return data;
  } catch (error) {
    console.error('Erro ao remover relação:', error);
    throw error;
  }
}

/**
 * Atualiza as propriedades dc:title, dc:description e dc:subject de um objeto.
 * @param payload - Os novos dados do objeto.
 */
export async function updateObjectProperties(
  payload: UpdateObjectPropertiesPayload
) {
  try {
    // O endpoint da API usa PUT ou POST, vamos usar PUT que é mais semântico para update
    const { data } = await api.put(
      apiConfig.endpoints.relacao.updateProperties,
      payload
    );
    Notify.create({
      type: 'positive',
      message: data.message || 'Propriedades atualizadas com sucesso!',
    });
    return data;
  } catch (error) {
    console.error('Erro ao atualizar propriedades:', error);
    throw error;
  }
}
