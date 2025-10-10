/**
 * src/stores/physical-object-store.ts
 *
 * Gerencia o estado e as ações para os Objetos Físicos.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useRepositoryStore } from './repository-store';
import {
  createPhysicalObject,
  updatePhysicalObject,
  deletePhysicalObject,
} from '../services/physicalObjectService';
import {
  CreatePhysicalObjectPayload,
  UpdatePhysicalObjectPayload,
} from '../types/apiTypes';

export const usePhysicalObjectStore = defineStore('physicalObject', () => {
  // --- STATE ---
  // Não precisamos de uma lista aqui, pois a busca geral já está no dimensional store.
  // Esta store foca nas operações de escrita (Criar, Atualizar, Apagar).
  const loading = ref(false);

  // --- ACTIONS ---

  /**
   * Cria um novo objeto físico no repositório atualmente selecionado.
   * @param payload - Dados do objeto, sem as URLs do repositório.
   */
  async function create(
    payload: Omit<
      CreatePhysicalObjectPayload,
      'repository_update_url' | 'repository_base_uri'
    >
  ) {
    const repoStore = useRepositoryStore();
    if (
      !repoStore.currentRepository ||
      !repoStore.currentRepositoryUpdateUrl ||
      !repoStore.currentRepositoryBaseUri
    ) {
      Notify.create({ type: 'negative', message: 'Nenhum repositório selecionado para a criação do objeto.' });
      return false;
    }

    loading.value = true;
    try {
      const fullPayload: CreatePhysicalObjectPayload = {
        ...payload,
        repository_update_url: repoStore.currentRepositoryUpdateUrl,
        repository_base_uri: repoStore.currentRepositoryBaseUri,
      };

      await createPhysicalObject(fullPayload);

      Notify.create({ type: 'positive', message: 'Objeto físico criado com sucesso!' });
      return true;
    } catch (error) {
      console.error('Erro ao criar objeto físico:', error);
      // Notificação de erro já é tratada pelo interceptor do axios
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Atualiza um objeto físico existente.
   * @param payload - Dados de atualização do objeto.
   */
  async function update(
    payload: Omit<
      UpdatePhysicalObjectPayload,
      'repository_update_url' | 'repository_base_uri'
    >
  ) {
    const repoStore = useRepositoryStore();
    if (
      !repoStore.currentRepository ||
      !repoStore.currentRepositoryUpdateUrl ||
      !repoStore.currentRepositoryBaseUri
    ) {
      Notify.create({ type: 'negative', message: 'Nenhum repositório selecionado para a atualização.' });
      return false;
    }
    loading.value = true;
    try {
      const fullPayload: UpdatePhysicalObjectPayload = {
        ...payload,
        repository_update_url: repoStore.currentRepositoryUpdateUrl,
        repository_base_uri: repoStore.currentRepositoryBaseUri,
      };
      await updatePhysicalObject(fullPayload);
      Notify.create({ type: 'positive', message: 'Objeto físico atualizado com sucesso!' });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar objeto físico:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Apaga um objeto físico.
   * @param objectUri - A URI completa do objeto a ser apagado.
   */
  async function remove(objectUri: string) {
    const repoStore = useRepositoryStore();
    if (!repoStore.currentRepositoryUpdateUrl) {
      Notify.create({ type: 'negative', message: 'Nenhum repositório selecionado para a exclusão.' });
      return false;
    }
    loading.value = true;
    try {
      await deletePhysicalObject(objectUri, repoStore.currentRepositoryUpdateUrl);
      Notify.create({ type: 'positive', message: 'Objeto físico removido com sucesso!' });
      return true;
    } catch (error) {
      console.error('Erro ao remover objeto físico:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    create,
    update,
    remove,
  };
});
