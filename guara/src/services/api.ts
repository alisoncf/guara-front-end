
// src/services/api.js

import axios from 'axios';
import apiConfig from '../apiConfig';
import { ObjetoFisico } from '../pages/objetos/manter-objeto'
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { ClassQueryResult, RepoQueryResult, Repositorio } from 'src/pages/tipos';
import { ref } from 'vue';
const router = useRouter();
const api = axios.create({
  baseURL: apiConfig.baseURL
});

// Exemplo de chamada a um endpoint específico
export const getClassData = () => {
  return api.get(apiConfig.endpoints.classapi);
};

export const getSparqData = () => {
  return api.get(apiConfig.endpoints.sparqapi);
};

export function gravarObjetoFisico(objeto: ObjetoFisico) {
  fetch(apiConfig.baseURL + apiConfig.endpoints.objectapi + '/adicionar_objeto_fisico', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(objeto),
  })
    .then(async (response) => {
      if (!response.ok) {

        const errorMessage = await response.text(); // Lê o corpo da resposta para detalhes do erro
        throw new Error(`Erro ${response.status}: ${errorMessage || 'Não foi possível gravar o objeto.'}`);
      }
      return response.json(); // Se tudo estiver OK, parseia o JSON
    })
    .then((data) => {
      Notify.create({
        type: 'positive',
        message: 'Objeto criado com sucesso!',
        timeout: 3000,
      }); // Mostra notificação de sucesso
      router.push(`/objetos/${data.id}/midias`); // Redireciona para a página de mídias do objeto
    })
    .catch((error) => {
      console.error('Erro ao criar objeto:', error);
      Notify.create({
        type: 'negative',
        message: `Erro ao criar objeto: ${error.message}`,
        timeout: 5000,
      }); // Mostra notificação de erro
    });
}

export async function listarRepositorios(){
  const listaRepo = ref<Repositorio[]>([]);

  try {
    const response = await axios.post<RepoQueryResult>(
      'http://localhost:5000/classapi/listar_classes'

    );

    listaRepo.value = [];
    response.data.results.bindings.forEach((item) => {
      const repoItem: Repositorio = {
        uri: item.uri.value,
        contato: item.contato ? item.contato.value : '',
        descricao: item.descricao? item.descricao.value : '',
        responsavel: item.responsavel ? item.responsavel.value : '-',
        nome: item.nome ? item.nome.value : '-',
      };
      listaRepo.value.push(repoItem);
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }


  return listaRepo;
}

export default api;
