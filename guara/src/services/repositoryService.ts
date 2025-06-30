/**
 * src/services/repositoryService.ts
 *
 * Serviço para interagir com os endpoints de Repositórios da API.
 */
import { api } from 'boot/axios';
import type { Repository } from './apiTypes';

/**
 * Mapeia a resposta bruta da API para um formato mais limpo para o frontend.
 * @param item - Objeto 'binding' da resposta SPARQL.
 * @returns Objeto Repository formatado.
 */
const mapApiToRepository = (item: any): Repository => ({
  uri: item.uri.value,
  nome: item.nome.value,
  descricao: item.descricao.value,
  contato: item.contato.value,
  responsavel: item.responsavel.value,
  // Gera uma imagem de placeholder para a UI
  image: `https://placehold.co/600x400/1e293b/ffffff?text=${encodeURIComponent(item.nome.value)}`
});

/**
 * Busca a lista de todos os repositórios (coleções).
 * @returns Uma promessa que resolve para um array de Repositórios.
 */
export const fetchAllRepositories = async (): Promise<Repository[]> => {
  try {
    const response = await api.get('/repositorios/listar_repositorios');
    if (response.data?.results?.bindings) {
      return response.data.results.bindings.map(mapApiToRepository);
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar repositórios:', error);
    throw new Error('Falha ao carregar os repositórios.');
  }
};
