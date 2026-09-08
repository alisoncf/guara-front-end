import {
  ObjetoDigital,
  ObjetoDimensional,
  ObjetoFisico,
  Tripla,
} from '../pages/objetos/manter-objeto';
import { useAuthStore } from 'src/stores/auth-store';

import axios from 'axios';
import apiConfig from '../apiConfig';


import { Dialog, Notify } from 'quasar';

import { ref } from 'vue';
import { textoAposUltimoChar } from 'src/pages/funcoes';
import { useDadosRepositorio } from 'src/stores/repositorio-store';

const authStore = useAuthStore();
const repoStore = useDadosRepositorio();

export const id_novo_objeto_dim_gravado = ref('' as string);
export function gravarObjetoDim(objeto: ObjetoDimensional) {
  const url =
    objeto.id == ''
      ? apiConfig.endpoints.dimensional.create
      : apiConfig.endpoints.dimensional.update;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + authStore.token,
    },
    body: JSON.stringify({
      ...objeto,
      repository: authStore.get.repositorio_conectado.uri,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorMessage = await response.text();
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
      //console.log(data);
      id_novo_objeto_dim_gravado.value = data['id'];
      return data;
    })
    .catch((error) => {
      console.error('Erro ao criar objeto:', error);
      Notify.create({
        type: 'negative',
        message: `Erro ao criar objeto: ${error.message}`,
        timeout: 5000,
      }); // Mostra notificação de erro
      throw error; // repropaga: quem chamou (await gravarObjetoDim(...)) precisa
                   // saber que falhou, senão segue como se tivesse dado certo
    });
}

export function addRelacao(tripla: Tripla) {
  const url = apiConfig.endpoints.relacao.add;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + authStore.token,
    },
    body: JSON.stringify({
      ...tripla,
      repository: authStore.get.repositorio_conectado.uri,
    }),
  })
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
        message: 'relação adiciona!',
        timeout: 3000,
      }); // Mostra notificação de sucesso
    })
    .catch((error) => {
      console.error('Erro ao criar objeto:', error);
      Notify.create({
        type: 'negative',
        message: `Erro ao criar relação: ${error.message}`,
        timeout: 5000,
      }); // Mostra notificação de erro
    });
}

export async function removerRelacao(tripla: Tripla): Promise<boolean> {
  try {
    const response = await fetch(apiConfig.endpoints.relacao.remove, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authStore.token,
      },
      body: JSON.stringify({
        ...tripla,
        repository: authStore.get.repositorio_conectado.uri,
      }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Não foi possível remover a relação.');
    }

    Notify.create({
      type: 'positive',
      message: 'Relação removida com sucesso!',
      timeout: 3000,
    });
    return true;
  } catch (error: any) {
    console.error('Erro ao remover relação:', error);
    Notify.create({
      type: 'negative',
      message: `Erro ao remover relação: ${error.message}`,
      timeout: 5000,
    });
    return false;
  }
}

export async function pesquisarRelacoes(obj_uri: string) {
  const lista = ref([] as Tripla[]);

  if (
    !authStore.get.repositorio_conectado ||
    authStore.get.repositorio_conectado.uri == '' ||
    authStore.get.repositorio_conectado.uri == undefined
  ) {
    Notify.create({
      type: 'negative',
      message: 'selecione um repositório',
      timeout: 5000,
    });
    return [];
  }
  try {
    const response = await axios.post(apiConfig.endpoints.relacao.list, {
      keyword: '',
      type: '',
      id: obj_uri,
      repository: authStore.get.repositorio_conectado.uri,
    });

    lista.value = (await response.data.results.bindings.map((item: any) => ({
      prefixo: '',
      id: item.id,
      propriedade: item.propriedade,
      valor: item.valor,
      complemento: '',
      titulo: item.titulo,
      propriedade_abreviada: textoAposUltimoChar(item.propriedade.value, '#'),
      tipoDimensao:  item.tipoDimensao ? item.tipoDimensao.value : '',
      objAssociado: item.objAssociado ? item.objAssociado.value : '',
      tipo_recurso: item.tipo_recurso ? item.tipo_recurso.value : '',
      direcao: item.direcao ? item.direcao.value : '',
    }))) as Tripla[];

    return lista.value;
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao buscar objetos: ' + error,
      timeout: 5000,
    });
    return [];
  }
}
export async function pesquisarObjetosDim(obj: ObjetoDimensional) {
  const lista = ref([] as ObjetoDimensional[]);

  if (
    !authStore.get.repositorio_conectado ||
    authStore.get.repositorio_conectado.uri == '' ||
    authStore.get.repositorio_conectado.uri == undefined
  ) {
    Notify.create({
      type: 'negative',
      message: 'selecione um repositório',
      timeout: 5000,
    });
    return [];
  }
  try {
    const response = await axios.post(apiConfig.endpoints.dimensional.list, {
      keyword: obj.descricao,
      type: obj.tipo != undefined ? obj.tipo.tipo : '',
      repository: authStore.get.repositorio_conectado.uri,
    });

    lista.value = response.data.results.bindings.map((item: any) => ({
      obj: item.obj.value,
      titulo: item.titulo.value,
      resumo: item.resumo.value,
      descricao: item.descricao.value,
      colecao: item.colecoes?.value ? item.colecoes.value.split(', ') : [],
      colecao_curta: item.colecoes?.value
        ? item.colecoes.value
            .split(', ')
            .map((colecao: string) => textoAposUltimoChar(colecao, '#'))
        : [],
      dimensao: item.dimensao.value,
      tipo: item.dimensao.value,
      lat: item.lat ? item.lat.value : '',
      lon: item.lon ? item.lon.value : '',
      coordenadas:
        item.lat && item.lon ? item.lat.value + ', ' + item.lon.value : '',
      repositorio: authStore.get.repositorio_conectado.uri,
      id: textoAposUltimoChar(item.obj.value, '#'),
    })) as ObjetoDimensional[];

    return lista.value;
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao buscar objetos: ' + error,
      timeout: 5000,
    });
    return [];
  }
}
export async function pesquisarObjetos(obj: ObjetoDigital) {
  const lista = ref([] as ObjetoDigital[]);

  if (
    !authStore.get.repositorio_conectado ||
    authStore.get.repositorio_conectado.uri == '' ||
    authStore.get.repositorio_conectado.uri == undefined
  ) {
    Notify.create({
      type: 'negative',
      message: 'selecione um repositório',
      timeout: 5000,
    });
    return [];
  }
  try {
    const response = await axios.post(apiConfig.endpoints.dimensional.listAll, {
      keyword: obj.keyword,
      type: obj.tipo != undefined ? obj.tipo : '',
      repository: authStore.get.repositorio_conectado.uri,
    });

    lista.value = response.data.results.bindings.map((item: any) => ({
      obj: item.id.value,
      titulo: item.titulo.value,
      resumo: item.assunto.value,
      descricao: item.descricao.value,
      dimensao: item.dimensao ? item.dimensao.value : '',
      tipo: item.tipo.value,
      repositorio: authStore.get.repositorio_conectado.uri,
      id: textoAposUltimoChar(item.id.value, '#'),
      tipoFisico: item.descricao.value,
    })) as ObjetoDigital[];

    return lista.value;
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
    const id = textoAposUltimoChar(objeto.id, '#');
    console.log('id-', id);
    fetch(`${apiConfig.endpoints.fisico.delete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authStore.token,
      },
      body: JSON.stringify({ id: id, repository: repoStore.get.uri }),
    })
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
    persistent: true,
  })
    .onOk(() => {
      objeto.id = textoAposUltimoChar(objeto.id, '#');
      fetch(apiConfig.endpoints.fisico.update, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + authStore.token,
        },
        body: JSON.stringify({ ...objeto, repository: repoStore.get.uri }),
      })
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


export async function buscarSugestoesSemanticas(objeto: { id: string; titulo: string; descricao: string }) {
  const lista = ref([] as any[]);

  if (
    !authStore.get.repositorio_conectado ||
    authStore.get.repositorio_conectado.uri == '' ||
    authStore.get.repositorio_conectado.uri == undefined
  ) {
    Notify.create({
      type: 'negative',
      message: 'selecione um repositório',
      timeout: 5000,
    });
    return [];
  }
  try {
    const response = await axios.post(
      apiConfig.endpoints.recomendacao.sugerir,
      {
        titulo: objeto.titulo,
        descricao: objeto.descricao,
        repository: authStore.get.repositorio_conectado.uri,
      },
      {
        headers: { Authorization: 'Bearer ' + authStore.token },
      }
    );
    lista.value = response.data.sugestoes;
    return lista.value;
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao buscar sugestões semânticas: ' + error,
      timeout: 5000,
    });
    return [];
  }
}
