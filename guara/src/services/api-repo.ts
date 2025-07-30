// src/services/api.js

import axios from 'axios';
import apiConfig from '../apiConfig';

import { RepoQueryResult, Repositorio } from 'src/pages/tipos';
import { ref } from 'vue';
import { Notify } from 'quasar';

const api = axios.create({
  baseURL: apiConfig.baseURL,
});
export const repositorioSelecionado = ref({ nome: '' } as Repositorio);
// Exemplo de chamada a um endpoint específico

export async function listarRepositorios(
  name?: string
): Promise<Repositorio[]> {
  const listaRepo = ref([] as Repositorio[]);
  const url = apiConfig.endpoints.listar_repo;

  try {
    const response = await axios.get<RepoQueryResult>(url, {
      params: name ? { name } : {}, // Envia name como parâmetro, se informado
    });

    listaRepo.value = response.data.results.bindings.map((item) => ({
      uri: item.uri.value,
      descricao: item.descricao?.value || '',
      contato: item.contato?.value || '',
      nome: item.nome?.value || '',
      responsavel: item.responsavel?.value || '',
      imagem: item.imagem?.value,
    }));
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    Notify.create({
      type: 'negative',
      message: 'Erro ao buscar os repositórios. Tente novamente.',
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
  const url = `${apiConfig.endpoints.listar_repo}?name=${encodeURIComponent(
    nome
  )}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
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
    }

    const data = await response.json();

    if (
      !data.results ||
      !data.results.bindings ||
      data.results.bindings.length === 0
    ) {
      Notify.create({
        type: 'warning',
        message: 'Nenhum repositório encontrado.',
      });
    }

    const item = data.results.bindings[0];

    repo.value.uri = item.uri;
    repo.value.contato = item?.contato || '';
    repo.value.descricao = item?.descricao || '';
    repo.value.nome = item?.nome || '';
    repo.value.responsavel = item?.responsavel || '';

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
