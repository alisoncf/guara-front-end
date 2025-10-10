/**
 * src/stores/dimensional-object-store.ts
 *
 * Gerencia o estado e as ações para os Objetos Dimensionais
 * e a listagem geral de objetos.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useRepositoryStore } from './repository-store';
import {
  listAllObjects,
  createDimensionalObject,
  updateDimensionalObject,
  deleteDimensionalObject,
} from '../services/dimensionalObjectService';
import type {
  MappedObject,
  CreateDimensionalObjectPayload,
  UpdateDimensionalObjectPayload,
} from '../types/apiTypes';

export const useDimensionalObjectStore = defineStore('dimensionalObject', () => {
  // --- STATE ---
  const objects = ref<MappedObject[]>([]);
  const loading = ref(false);

  // --- ACTIONS ---

  /**
   * Busca todos os objetos (físicos e dimensionais) de um repositório.
   * @param keyword - Termo de busca opcional.
   * @param repositoryUrl - URL do repositório a ser consultado (opcional). Se não for fornecido, usa o repositório ativo da store.
   */
  async function fetchAll(keyword = '', repositoryUrl: string | null = null) {
    const repoStore = useRepositoryStore();
    const targetRepository = repositoryUrl || repoStore.currentRepositoryQueryUrl;

    if (!targetRepository) {
      Notify.create({ type: 'warning', message: 'Nenhum repositório especificado para a busca.' });
      return;
    }

    loading.value = true;
    objects.value = []; // Limpa a lista antes de uma nova busca
    try {
      objects.value = await listAllObjects(
        targetRepository,
        keyword
      );
    } catch (error) {
      console.error('Erro ao buscar objetos:', error);
      // A notificação de erro já é tratada no serviço/interceptor
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cria um novo objeto dimensional.
   */
  async function create(
    payload: Omit<
      CreateDimensionalObjectPayload,
      'repository_update_url' | 'repository_base_uri'
    >
  ) {
    const repoStore = useRepositoryStore();
    if (
      !repoStore.currentRepositoryUpdateUrl ||
      !repoStore.currentRepositoryBaseUri
    ) {
      Notify.create({ type: 'negative', message: 'Nenhum repositório selecionado.' });
      return false;
    }

    loading.value = true;
    try {
      const fullPayload: CreateDimensionalObjectPayload = {
        ...payload,
        repository_update_url: repoStore.currentRepositoryUpdateUrl,
        repository_base_uri: repoStore.currentRepositoryBaseUri,
      };
      await createDimensionalObject(fullPayload);
      Notify.create({ type: 'positive', message: 'Objeto dimensional criado com sucesso!' });
      return true;
    } catch (error) {
      console.error('Erro ao criar objeto dimensional:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Atualiza um objeto dimensional.
   */
  async function update(
    payload: Omit<UpdateDimensionalObjectPayload, 'repository_update_url'>
  ) {
    const repoStore = useRepositoryStore();
    if (!repoStore.currentRepositoryUpdateUrl) {
      Notify.create({ type: 'negative', message: 'Nenhum repositório selecionado.' });
      return false;
    }
    loading.value = true;
    try {
      const fullPayload: UpdateDimensionalObjectPayload = {
        ...payload,
        repository_update_url: repoStore.currentRepositoryUpdateUrl,
      };
      await updateDimensionalObject(fullPayload);
      Notify.create({ type: 'positive', message: 'Objeto dimensional atualizado com sucesso!' });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar objeto dimensional:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Apaga um objeto dimensional.
   */
  async function remove(objectUri: string) {
    const repoStore = useRepositoryStore();
    if (
      !repoStore.currentRepositoryUpdateUrl ||
      !repoStore.currentRepositoryBaseUri
    ) {
      Notify.create({ type: 'negative', message: 'Nenhum repositório selecionado.' });
      return false;
    }
    loading.value = true;
    try {
      await deleteDimensionalObject(
        objectUri,
        repoStore.currentRepositoryUpdateUrl,
        repoStore.currentRepositoryBaseUri
      );
      Notify.create({ type: 'positive', message: 'Objeto dimensional removido com sucesso!' });
      return true;
    } catch (error) {
      console.error('Erro ao remover objeto dimensional:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    objects,
    loading,
    // Actions
    fetchAll,
    create,
    update,
    remove,
  };
});
