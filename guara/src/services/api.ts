// src/services/api.js

import axios from 'axios';
import apiConfig from '../apiConfig';
import { ObjetoFisico } from '../pages/objetos/manter-objeto';
import { useRouter } from 'vue-router';
import { Dialog, Notify } from 'quasar';
import {
  ClasseComum,
  ClassQueryResult,
  RepoQueryResult,
  Repositorio,
} from 'src/pages/tipos';
import { ref } from 'vue';
import { textoAposUltimoChar } from 'src/pages/funcoes';

import { useAuthStore } from 'src/stores/auth-store';
import { useDadosRepositorio } from 'src/stores/repositorio-store';
const authStore = useAuthStore();
const repoStore = useDadosRepositorio();
const router = useRouter();
const api = axios.create({
  baseURL: apiConfig.baseURL,
});

// Exemplo de chamada a um endpoint específico
export const getClassData = () => {
  return api.get(apiConfig.endpoints.classapi);
};

export const getSparqData = () => {
  return api.get(apiConfig.endpoints.sparqapi);
};

export async function listarRepositorios(nome: string | null) {
  const listaRepo = ref<Repositorio[]>([]);

  try {
    const response = await axios.get<RepoQueryResult>(
      'http://localhost:5000/repositorios/listar_repositorios?name=' + nome
    );

    listaRepo.value = [];
    response.data.results.bindings.forEach((item) => {
      const classItem: Repositorio = {
        uri: item.uri.value,
        descricao: item.descricao ? item.descricao.value : '',
        contato: item.contato ? item.contato.value : '',
        nome: item.nome ? item.nome.value : '',

        responsavel: item.responsavel ? item.responsavel.value : '',
      };
      listaRepo.value.push(classItem);
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }

  return listaRepo.value;
}

export async function listarClasses(keyword: string) {
  // Aguarda o authStore ser inicializado corretamente
  const uri = authStore.repositorio_conectado?.uri;

  if (!uri) {
    Notify.create({
      type: 'negative',
      message: 'Selecione o repositório antes de buscar classes',
      timeout: 5000,
    });
    return [];
  }

  const listaClasses = ref<ClasseComum[]>([]);

  try {
    const response = await axios.post<ClassQueryResult>(
      'http://localhost:5000/classapi/listar_classes',
      {
        keyword: keyword,
        repository: uri,
        orderby: 'subclassof',
      }
    );

    listaClasses.value = [];
    response.data.results.bindings.forEach((item) => {
      const classItem: ClasseComum = {
        uri: item.class.value,
        label: item.label ? item.label.value : '',
        description: item.description ? item.description.value : '',
        subclassof: item.subclassof ? item.subclassof.value : '-',
        mae_curta: textoAposUltimoChar(
          item.subclassof ? item.subclassof.value : '-',
          '#'
        ),
        nome_curto: textoAposUltimoChar(item.class.value, '#'),
      };
      listaClasses.value.push(classItem);
    });
  } catch (error) {
    console.error('Erro ao buscar classes:', error);
    Notify.create({
      type: 'negative',
      message: 'Erro ao buscar classes',
      timeout: 5000,
    });
  }

  return listaClasses.value;
}

export async function listarClasses2(keyword: string) {
  const uri = authStore.get.repositorio_conectado.uri;
  const listaClasses = ref<ClasseComum[]>([]);
  try {
    if (uri == '') {
      Notify.create({
        type: 'negative',
        message: 'selecione o repositório',
        timeout: 5000,
      });
      return [];
    }

    const response = await axios.post<ClassQueryResult>(
      'http://localhost:5000/classapi/listar_classes',
      {
        keyword: keyword,
        repository: uri,
        orderby: 'subclassof',
      }
    );

    listaClasses.value = [];
    response.data.results.bindings.forEach((item) => {
      const classItem: ClasseComum = {
        uri: item.class.value,
        label: item.label ? item.label.value : '',
        description: item.description ? item.description.value : '',
        subclassof: item.subclassof ? item.subclassof.value : '-',
        mae_curta: textoAposUltimoChar(
          item.subclassof ? item.subclassof.value : '-',
          '#'
        ),
        nome_curto: textoAposUltimoChar(item.class.value, '#'),
      };
      listaClasses.value.push(classItem);
    });
  } catch (error) {
    console.log('erro', error);
    Notify.create({
      type: 'negative',
      message: 'Erro ao buscar classes',
      timeout: 5000,
    }); // Mostra notificação de erro
  }

  return listaClasses.value;
}
export async function listarClassesFetch(keyword: string) {
  console.log('Iniciando requisição com Fetch...');

  try {
    const response = await fetch(
      'http://localhost:5000/classapi/listar_classes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword,
          repository: repoStore.get.uri,
          orderby: 'subclassof',
        }),
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(
        `Erro ${response.status}: ${errorMessage || 'Falha ao buscar classes'}`
      );
    }

    const data = await response.json();
    console.log('Resposta recebida:', data);
  } catch (error) {
    console.error('Erro capturado pelo catch:', error);
  }
}

export default api;
