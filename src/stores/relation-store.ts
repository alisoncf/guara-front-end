/**
 * src/stores/relation-store.ts
 *
 * Gerencia o estado das relações (triplas RDF) para um objeto específico.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useRepositoryStore } from './repository-store';
import {
  fetchObjectRelations,
  addRelation as addRelationService,
  removeSpecificRelation,
} from '../services/relationService';
import type { Relation, AddRelationPayload, RemoveSpecificRelationPayload } from '../types/apiTypes';

export const useRelationStore = defineStore('relation', () => {
  // --- STATE ---
  const relations = ref<Relation[]>([]);
  const loading = ref(false);
  const currentObjectUri = ref<string | null>(null);

  // --- ACTIONS ---

  /**
   * Busca e armazena as relações para uma URI de objeto específica.
   * @param objectUri - A URI completa do objeto a ser consultado.
   */
  async function fetchRelations(objectUri: string) {
    const repoStore = useRepositoryStore();
    if (!repoStore.currentRepositoryQueryUrl) {
      Notify.create({ type: 'warning', message: 'Nenhum repositório selecionado.' });
      return;
    }

    loading.value = true;
    relations.value = [];
    try {
      currentObjectUri.value = objectUri;
      relations.value = await fetchObjectRelations(
        objectUri,
        repoStore.currentRepositoryQueryUrl
      );
    } catch (error) {
      // O service já exibe notificação
      console.error(`Erro ao buscar relações para ${objectUri}:`, error);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Adiciona uma nova relação.
   */
  async function addRelation(
    payload: Omit<AddRelationPayload, 'repository_update_url' | 'repository_base_uri' | 'sujeito_id_local'>
  ) {
    const repoStore = useRepositoryStore();
    if (!repoStore.currentRepositoryUpdateUrl || !repoStore.currentRepositoryBaseUri || !currentObjectUri.value) {
      Notify.create({ type: 'negative', message: 'Contexto do repositório ou objeto inválido.' });
      return false;
    }

    loading.value = true;
    try {
      const fullPayload: AddRelationPayload = {
        ...payload,
        // O sujeito é o objeto que estamos editando
        sujeito_id_local: currentObjectUri.value.split('#').pop() || '',
        repository_update_url: repoStore.currentRepositoryUpdateUrl,
        repository_base_uri: repoStore.currentRepositoryBaseUri,
      };
      await addRelationService(fullPayload);
      // Recarrega as relações para mostrar a nova
      await fetchRelations(currentObjectUri.value);
      return true;
    } catch (error) {
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Remove uma relação específica.
   * @param relation - O objeto da relação a ser removida.
   */
  async function removeRelation(relation: Relation) {
    const repoStore = useRepositoryStore();
    if (!repoStore.currentRepositoryUpdateUrl || !currentObjectUri.value) {
      Notify.create({ type: 'negative', message: 'Contexto do repositório ou objeto inválido.' });
      return false;
    }

    loading.value = true;
    try {
      const payload: RemoveSpecificRelationPayload = {
        s: `<${currentObjectUri.value}>`,
        p: `<${relation.property}>`,
        // Formata o objeto (valor) corretamente, seja ele uma URI ou um literal
        o: relation.valueType === 'uri' ? `<${relation.value}>` : `"${relation.value}"`,
        repository_update_url: repoStore.currentRepositoryUpdateUrl,
      };

      await removeSpecificRelation(payload);
      // Recarrega a lista
      await fetchRelations(currentObjectUri.value);
      return true;
    } catch (error) {
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    relations,
    loading,
    currentObjectUri,
    // Actions
    fetchRelations,
    addRelation,
    removeRelation,
  };
});
