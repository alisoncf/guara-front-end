/**
 * src/services/relationService.ts
 *
 * Serviço para buscar as relações de um objeto específico.
 */
import { api } from 'boot/axios';
import { isAxiosError } from 'axios';

// Interface para representar uma relação (uma tripla RDF)
export interface Relation {
  property: string; // O predicado (P)
  value: string;    // O objeto (O)
  valueType: 'uri' | 'literal';
  valueTitle?: string; // O título do objeto, se for uma URI e tiver um
}

/**
 * Busca todas as relações (propriedades e valores) para uma URI de objeto específica.
 * @param objectUri - A URI completa do objeto (sujeito) a ser consultado.
 * @param repositoryEndpointUrl - A URL do endpoint SPARQL do repositório onde a consulta será executada.
 * @returns Uma promessa que resolve para um array de Relações.
 */
export const fetchObjectRelations = async (objectUri: string, repositoryEndpointUrl: string): Promise<Relation[]> => {
  try {
    if (!objectUri || !repositoryEndpointUrl) {
      throw new Error("URI do objeto e endpoint do repositório são necessários.");
    }

    const response = await api.post('/relation/list', {
      id_objeto: objectUri,
      repository_sparql_endpoint: repositoryEndpointUrl,
    });

    if (response.data?.results?.bindings) {
      return response.data.results.bindings.map((binding: any): Relation => ({
        property: binding.propriedade?.value,
        value: binding.valor?.value,
        valueType: binding.tipo_recurso?.value === 'Literal' ? 'literal' : 'uri',
        valueTitle: binding.titulo?.value,
      }));
    }
    return [];
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      console.log(`Nenhuma relação encontrada para o objeto ${objectUri} no repositório ${repositoryEndpointUrl}`);
    } else {
      console.error(`Erro ao buscar relações para o objeto ${objectUri}:`, error);
    }
    return []; // Retorna array vazio em caso de erro para não quebrar a aplicação.
  }
};
