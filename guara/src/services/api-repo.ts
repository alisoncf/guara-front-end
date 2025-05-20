// src/services/api.js

import axios from 'axios';
import apiConfig from '../apiConfig';

import { RepoQueryResult, Repositorio } from 'src/pages/tipos';
import { ref } from 'vue';
import { Notify } from 'quasar';

const api = axios.create({
  baseURL: apiConfig.baseURL,
});
export const repositorioSelecionado = ref({} as Repositorio);
// Exemplo de chamada a um endpoint específico

export async function listarRepositorios(
  name?: string
): Promise<Repositorio[]> {
  const listaRepo = ref<Repositorio[]>([]);
  const url = `${apiConfig.baseURL}/sparqapi`;
  console.log('Tentando acessar URL:', url);

  try {
    console.log('Iniciando requisição POST para:', url);
    const response = await axios.post(
      url,
      {
        query: `
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          SELECT DISTINCT ?s ?nome ?descricao ?contato ?responsavel
          WHERE {
            ?s rdf:type <http://guara.ueg.br/ontologias/v1/objetos#Repositorio> .
            OPTIONAL { ?s rdfs:label ?nome }
            OPTIONAL { ?s <http://guara.ueg.br/ontologias/v1/objetos#descricao> ?descricao }
            OPTIONAL { ?s <http://guara.ueg.br/ontologias/v1/objetos#contato> ?contato }
            OPTIONAL { ?s <http://guara.ueg.br/ontologias/v1/objetos#responsavel> ?responsavel }
          }
        `,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        validateStatus: function (status) {
          return status < 500; // Aceita qualquer status menor que 500
        },
      }
    );

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', response.headers);
    console.log('Resposta da API:', response.data);

    if (response.status === 500) {
      console.error('Erro interno do servidor:', response.data);
      throw new Error('Erro interno do servidor ao listar repositórios');
    }

    // Verifica se a resposta tem o formato esperado
    if (response.data?.results?.bindings) {
      listaRepo.value = response.data.results.bindings.map((item: any) => ({
        uri: item.s?.value || '',
        descricao: item.descricao?.value || '',
        contato: item.contato?.value || '',
        nome: item.nome?.value || '',
        responsavel: item.responsavel?.value || '',
      }));
    } else if (Array.isArray(response.data)) {
      // Se a resposta for um array direto
      listaRepo.value = response.data.map((item: any) => ({
        uri: item.uri || '',
        descricao: item.descricao || '',
        contato: item.contato || '',
        nome: item.nome || '',
        responsavel: item.responsavel || '',
      }));
    } else {
      console.error('Formato de resposta inesperado:', response.data);
      throw new Error('Formato de resposta inesperado da API');
    }

    console.log('Repositórios processados:', listaRepo.value);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro Axios:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
    }
    Notify.create({
      type: 'negative',
      message:
        'Erro ao buscar os repositórios. Por favor, verifique se o servidor está rodando.',
    });
  }

  return listaRepo.value;
}

export async function buscarRepositorio(nome: string): Promise<Repositorio> {
  const repo = ref({
    contato: '',
    descricao: '',
    nome: '',
    responsavel: '',
    uri: '',
  } as Repositorio);

  const url = `${apiConfig.baseURL}${
    apiConfig.endpoints.listar_repo
  }?name=${encodeURIComponent(nome)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Erro ao buscar os dados do repositório (${response.status}): ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (jsonError) {
        console.warn(
          'Falha ao processar a mensagem de erro do backend',
          jsonError
        );
      }

      Notify.create({ type: 'negative', message: errorMessage });
      return repo.value;
    }

    const data = await response.json();
    console.log('Resposta da API (buscarRepositorio):', data);

    if (
      !data.results ||
      !data.results.bindings ||
      data.results.bindings.length === 0
    ) {
      Notify.create({
        type: 'warning',
        message: 'Nenhum repositório encontrado.',
      });
      return repo.value;
    }

    const item = data.results.bindings[0];

    repo.value.uri = item.uri?.value || '';
    repo.value.contato = item.contato?.value || '';
    repo.value.descricao = item.descricao?.value || '';
    repo.value.nome = item.nome?.value || '';
    repo.value.responsavel = item.responsavel?.value || '';

    return repo.value;
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    Notify.create({
      type: 'negative',
      message: 'Erro ao buscar os dados do repositório - ' + error,
    });
    return repo.value;
  }
}

export default api;
