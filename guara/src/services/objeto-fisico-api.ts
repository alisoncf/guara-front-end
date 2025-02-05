import { ObjetoFisico } from './../pages/objetos/manter-objeto';
import { useAuthStore  } from 'src/stores/auth-store';
// src/services/api.js

import axios from 'axios';
import apiConfig from '../apiConfig';

import { useRouter } from 'vue-router';
import { Dialog, Notify } from 'quasar';

import { ref } from 'vue';
import { textoAposUltimoChar } from 'src/pages/funcoes';


const authStore = useAuthStore();
const router = useRouter();


export function gravarObjetoFisico(objeto: ObjetoFisico) {
  fetch(
    apiConfig.baseURL +
      apiConfig.endpoints.objectapi +
      '/adicionar_objeto_fisico',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...objeto, repository: authStore.get.repositorio_conectado.uri }),
    }
  )
    .then(async (response) => {
      if (!response.ok) {
        const errorMessage = await response.text(); // Lê o corpo da resposta para detalhes do erro
        throw new Error(
          `Erro ${response.status}: ${
            errorMessage || 'Não foi possível gravar o objeto.'
          }`
        );
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

export async function pesquisarObjetosFisicos(obj: ObjetoFisico) {
  const listaObj = ref([] as ObjetoFisico[]);
  if(!authStore.get.repositorio_conectado){
    Notify.create({
      type: 'negative',
      message: 'selecione um repositório',
      timeout: 5000,
    });
    return [];
  }
  try {
    const response = await axios.post(
      apiConfig.baseURL + apiConfig.endpoints.objectapi + '/listar_objetos',
      {
        keyword: obj.descricao,
        type: 'fisico',
        repository: authStore.get.repositorio_conectado.uri,
      }
    );



    listaObj.value = response.data.results.bindings.map((item: any) => ({
      obj: item.obj.value,
      titulo: item.titulo.value,
      resumo: item.resumo.value,
      colecao: item.colecao && item.colecao.value ? item.colecao.value : '',
      descricao: item.descricao.value,
      tipoFisico: item.tipos?.value ? item.tipos.value.split(', ') : [],
      repositorio: authStore.get.repositorio_conectado.uri,
      tipoFisicoAbreviado: item.tipos?.value
        ? item.tipos.value
            .split(', ')
            .map((tipo: string) => textoAposUltimoChar(tipo, '#'))
        : [],
      id: textoAposUltimoChar(item.obj.value, '#'),
    })) as ObjetoFisico[];

    return listaObj.value;
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao buscar objetos: ' + error,
      timeout: 5000,
    });
    return [];
  }
}

export function deletarObjetoFisico(objeto: ObjetoFisico) {

  Dialog.create({
    title: 'Confirmação',
    message:
      'Tem certeza que deseja excluir o objeto físico ' +
      objeto.id +
      ' ' +
      objeto.titulo +
      '?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
     const id = textoAposUltimoChar(objeto.id,'#');
     console.log('id-',id);
    fetch(
      `${apiConfig.baseURL}${apiConfig.endpoints.objectapi}/excluir_objeto_fisico`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id, repository: repoStore.get.uri }),
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(
            `Erro ${response.status}: ${
              errorMessage || 'Não foi possível excluir o objeto.'
            }`
          );
        }
        return response.json();
      })
      .then(() => {
        Notify.create({
          type: 'positive',
          message: 'Objeto excluído com sucesso!',
          timeout: 3000,
        });

      })
      .catch((error) => {
        console.error('Erro ao excluir objeto:', error);
        Notify.create({
          type: 'negative',
          message: `Erro ao excluir objeto: ${error.message}`,
          timeout: 5000,
        });
      });
  });
}

export function atualizarObjetoFisico(objeto: ObjetoFisico) {
  Dialog.create({
    title: 'Confirmação',
    message: 'Tem certeza que deseja atualizar este objeto?',
    cancel: true,
    persistent: true
  })
    .onOk(() => {
      objeto.id=textoAposUltimoChar(objeto.id,'#');
      fetch(
        apiConfig.baseURL +
          apiConfig.endpoints.objectapi +
          '/atualizar_objeto_fisico',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...objeto, repository: repoStore.get.uri }),
        }
      )
        .then(async (response) => {
          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(
              `Erro ${response.status}: ${
                errorMessage || 'Não foi possível atualizar o objeto.'
              }`
            );
          }
          return response.json();
        })
        .then(() => {
          Notify.create({
            type: 'positive',
            message: 'Objeto atualizado com sucesso!',
            timeout: 3000,
          });
        })
        .catch((error) => {
          console.error('Erro ao atualizar objeto:', error);
          Notify.create({
            type: 'negative',
            message: `Erro ao atualizar objeto: ${error.message}`,
            timeout: 5000,
          });
        });
    })
    .onCancel(() => {
      Notify.create({
        type: 'info',
        message: 'Atualização cancelada.',
      });
    });
}

