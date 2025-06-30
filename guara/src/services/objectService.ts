/**
 * src/services/objectService.ts
 *
 * Serviço para interagir com os endpoints de Objetos Dimensionais (/dim) e Físicos (/fis).
 */
import { api } from 'boot/axios';
// Importa o helper isAxiosError para checar o tipo do erro de forma segura.
import { isAxiosError } from 'axios';
import type { ApiObject, MappedObject } from './apiTypes';

/**
 * Mapeia um objeto da API para um formato mais limpo para o frontend.
 * @param apiObject - O objeto vindo da API.
 * @returns Um objeto formatado para a UI.
 */
const mapApiToObject = (apiObject: ApiObject): MappedObject => ({
  id: apiObject.id.value,
  titulo: apiObject.titulo.value,
  descricao: apiObject.descricao?.value,
  resumo: apiObject.resumo?.value,
});

/**
 * Busca todos os objetos de um repositório específico.
 * Trata erros 404 de forma silenciosa para não quebrar a montagem do grafo.
 *
 * @param repositoryEndpointUrl - A URL completa do endpoint SPARQL do repositório a ser consultado.
 * @returns Uma promessa que resolve para um array de Objetos.
 */
export const fetchAllObjectsByRepository = async (repositoryEndpointUrl: string): Promise<MappedObject[]> => {
  try {
    if (!repositoryEndpointUrl) {
      throw new Error("A URL do endpoint do repositório não foi fornecida.");
    }

    // A API /dim/listall precisa saber em qual repositório buscar.
    const response = await api.post('/dim/listall', {
      repository: repositoryEndpointUrl, // Usa a URL dinâmica passada como parâmetro
    });

    if (response.data?.results?.bindings) {
      return response.data.results.bindings.map(mapApiToObject);
    }
    return [];
  } catch (error) {
    // Tratamento de erro aprimorado
    if (isAxiosError(error) && error.response?.status === 404) {
      // Se o erro for um 404 (Not Found), significa que o repositório específico
      // não foi encontrado. Isso não é um erro fatal para a aplicação.
      // Apenas registramos uma mensagem informativa no console, sem ser um "erro".
      console.log(`Repositório não encontrado ou sem objetos (404): ${repositoryEndpointUrl}`);
    } else {
      // Para todos os outros tipos de erro (ex: 500, erro de rede),
      // registramos como um erro para facilitar a depuração.
      console.error(`Erro ao buscar objetos para o repositório ${repositoryEndpointUrl}:`, error);
    }

    // Em TODOS os casos de erro, retornamos um array vazio.
    // Isso garante que o Promise.all na store não falhe e o grafo
    // possa ser montado com os dados dos repositórios que funcionaram.
    return [];
  }
};
