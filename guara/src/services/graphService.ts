/**
 * src/services/graphService.ts
 *
 * Serviço para interagir com o endpoint de grafo da API (/graph).
 */
import { api } from 'boot/axios';
import apiConfig from 'src/config/apiConfig';
import type {
  GraphData,
  GraphNode,
  GraphLink,
  SparqlResult,
} from 'src/types/apiTypes';
import { Notify } from 'quasar';

/**
 * Busca os dados consolidados para o grafo da página inicial.
 * Utiliza o endpoint otimizado /graph/main_data da API.
 * @returns Uma Promise com os nós e links prontos para a visualização.
 */
export async function fetchGraphData(): Promise<GraphData> {
  try {
    // Faz uma ÚNICA chamada para o endpoint otimizado do backend
    const response = await api.get<{
      collections: SparqlResult[];
      objects: SparqlResult[];
      loaded_from: string;
    }>(apiConfig.endpoints.graph.mainData);

    const { collections: collectionBindings, objects: objectBindings } =
      response.data;

    // 1. Mapear coleções (repositórios) para nós do tipo 'collection'
    const collectionNodes: GraphNode[] = collectionBindings.map((binding) => ({
      id: binding.uri.value,
      name: binding.nome.value,
      type: 'collection',
      description: binding.descricao?.value,
    }));

    // 2. Mapear objetos para nós do tipo 'object'
    const objectNodes: GraphNode[] = objectBindings.map((binding) => ({
      id: binding.id.value, // A query get_sparq_all retorna 'id'
      name: binding.titulo?.value || 'Objeto Sem Título',
      type: 'object',
      description: binding.descricao?.value,
    }));

    // 3. Criar os links dos objetos para suas respectivas coleções
    const links: GraphLink[] = objectBindings
      .filter((binding) => binding.colecao?.value) // Garante que o objeto tem uma coleção
      .map((binding) => ({
        source: binding.id.value,
        target: binding.colecao.value,
      }));

    return {
      nodes: [...collectionNodes, ...objectNodes], // Junta os dois tipos de nós
      links,
    };
  } catch (error) {
    console.error('Erro ao buscar dados para o grafo:', error);
    // A notificação de erro já será tratada pelo interceptor do axios.
    // Lançar o erro permite que a store saiba que a chamada falhou.
    throw new Error('Não foi possível carregar os dados do acervo principal.');
  }
}
