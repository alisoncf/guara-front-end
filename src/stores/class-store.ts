/**
 * src/stores/class-store.ts
 *
 * Gerencia o estado das classes da ontologia para o repositório selecionado.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useRepositoryStore } from './repository-store';
import {
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
} from 'src/services/classService';
import type {
  OntologyClass,
  CreateClassPayload,
  UpdateClassPayload,
} from 'src/types/apiTypes';

export const useClassStore = defineStore('class', () => {
  // --- STATE ---
  const classes = ref<OntologyClass[]>([]);
  const loading = ref(false);

  // --- ACTIONS ---

  /**
   * Busca e armazena a lista de classes do repositório atualmente selecionado.
   */
  async function fetchAll() {
    const repoStore = useRepositoryStore();
    if (!repoStore.currentRepositoryQueryUrl) {
      Notify.create({ type: 'warning', message: 'Por favor, selecione um repositório primeiro.' });
      return;
    }

    loading.value = true;
    try {
      classes.value = await fetchClasses(repoStore.currentRepositoryQueryUrl);
    } catch (error) {
      console.error('Erro ao buscar classes da ontologia:', error);
      Notify.create({ type: 'negative', message: 'Não foi possível carregar as classes do repositório.' });
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cria uma nova classe.
   * A store preenche automaticamente os dados do repositório.
   */
  async function create(payload: Omit<CreateClassPayload, 'repository_update_url' | 'repository_base_uri'>) {
    const repoStore = useRepositoryStore();
    if (!repoStore.currentRepositoryUpdateUrl || !repoStore.currentRepositoryBaseUri) {
      Notify.create({ type: 'negative', message: 'Nenhum repositório selecionado.' });
      return false;
    }

    loading.value = true;
    try {
      const fullPayload: CreateClassPayload = {
        ...payload,
        repository_update_url: repoStore.currentRepositoryUpdateUrl,
        repository_base_uri: repoStore.currentRepositoryBaseUri,
      };
      await createClass(fullPayload);
      Notify.create({ type: 'positive', message: 'Classe criada com sucesso!' });
      await fetchAll(); // Atualiza a lista de classes
      return true;
    } catch (error) {
      console.error('Erro ao criar classe:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Atualiza uma classe existente.
   */
  async function update(payload: Omit<UpdateClassPayload, 'repository_update_url' | 'repository_base_uri'>) {
    const repoStore = useRepositoryStore();
    if (!repoStore.currentRepositoryUpdateUrl || !repoStore.currentRepositoryBaseUri) {
      Notify.create({ type: 'negative', message: 'Nenhum repositório selecionado.' });
      return false;
    }

    loading.value = true;
    try {
      const fullPayload: UpdateClassPayload = {
        ...payload,
        repository_update_url: repoStore.currentRepositoryUpdateUrl,
        repository_base_uri: repoStore.currentRepositoryBaseUri,
      };
      await updateClass(fullPayload);
      Notify.create({ type: 'positive', message: 'Classe atualizada com sucesso!' });
      await fetchAll(); // Atualiza a lista
      return true;
    } catch (error) {
      console.error('Erro ao atualizar classe:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Exclui uma classe.
   */
  async function remove(classUri: string) {
    const repoStore = useRepositoryStore();
    if (!repoStore.currentRepositoryUpdateUrl || !repoStore.currentRepositoryQueryUrl) {
      Notify.create({ type: 'negative', message: 'Nenhum repositório selecionado.' });
      return false;
    }
    loading.value = true;
    try {
      await deleteClass(classUri, repoStore.currentRepositoryUpdateUrl, repoStore.currentRepositoryQueryUrl);
      Notify.create({ type: 'positive', message: 'Classe removida com sucesso!' });
      // Remove da lista local para uma atualização instantânea da UI
      classes.value = classes.value.filter(c => c.uri !== classUri);
      return true;
    } catch (error) {
      console.error('Erro ao remover classe:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }


  return {
    // State
    classes,
    loading,
    // Actions
    fetchAll,
    create,
    update,
    remove,
  };
});
