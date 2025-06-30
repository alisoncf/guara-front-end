// src/services/collectionService.ts
import { api } from 'boot/axios'; // Usamos a instância configurada do Axios

// Tipos baseados na sua API spec para garantir a consistência
interface Collection {
  id: string;
  name: string;
  description: string;
  contact: string;
  responsible: string;
  image: string;
}

interface GraphData {
  nodes: { id: string; name: string; type: 'collection' | 'object'; description?: string }[];
  links: { source: string; target: string }[];
}

/**
 * Busca a lista de todos os repositórios (coleções).
 */
export const fetchCollections = async (): Promise<Collection[]> => {
  try {
    // Endpoint real da sua API, conforme apispec_1.json
    const response = await api.get('/repositorios/listar_repositorios');
    // Mapeia a resposta para o formato que o frontend espera
    return response.data.results.bindings.map((item: any) => ({
      id: item.uri.value,
      name: item.nome.value,
      description: item.descricao.value,
      contact: item.contato.value,
      responsible: item.responsavel.value,
      // Usando um placeholder para a imagem como antes
      image: `https://placehold.co/600x400/1e293b/ffffff?text=${encodeURIComponent(item.nome.value)}`
    }));
  } catch (error) {
    console.error('Erro ao buscar coleções:', error);
    // Lança o erro para que o chamador (a store) possa tratá-lo
    throw new Error('Falha ao carregar as coleções.');
  }
};

/**
 * Busca os dados para montar o gráfico da página inicial.
 * Esta função combina chamadas para buscar coleções e os objetos de cada uma.
 */
export const fetchGraphData = async (): Promise<GraphData> => {
  console.log("Buscando dados reais para o grafo...");
  const collections = await fetchCollections();

  const nodes: GraphData['nodes'] = [];
  const links: GraphData['links'] = [];
  const collectionSet = new Set();

  // Adiciona nós de coleções
  for (const col of collections) {
    if (!collectionSet.has(col.id)) {
      nodes.push({
        id: col.id,
        name: col.name,
        type: 'collection',
        description: col.description,
      });
      collectionSet.add(col.id);
    }

    // Busca objetos para esta coleção (repositório) - Usando o endpoint /dim/listall da sua API
    try {
      const objectsResponse = await api.post('/dim/listall', {
        repository: col.id // Assumindo que a API aceita a URI da coleção
      });

      if (objectsResponse.data && objectsResponse.data.results.bindings) {
        for (const obj of objectsResponse.data.results.bindings) {
          const objectId = obj.id.value;
          nodes.push({
            id: objectId,
            name: obj.titulo?.value || 'Objeto Sem Título',
            type: 'object',
            description: obj.descricao?.value,
          });
          links.push({ source: objectId, target: col.id });
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar objetos para a coleção ${col.name}:`, error);
      // Continua mesmo se uma coleção falhar
    }
  }

  return { nodes, links };
};
