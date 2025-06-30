import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

// Tipos
interface Collection {
  id: string;
  local_id?: string;
  name: string;
  description: string;
  contact?: string;
  responsible?: string;
  image?: string;
  tags?: string;
  repository_update_url?: string;
  repository_query_url?: string;
}

interface CollectionData {
  label: string;
  comment: string;
  subclassof_localname: string;
  repository_base_uri: string;
  repository_update_url: string;
  contact?: string;
  responsible?: string;
  image_url?: string;
  tags?: string;
}

export const useCollectionStore = defineStore('collections', () => {
  const $q = useQuasar();

  // --- STATE ---
  const collections = ref<Collection[]>([]);
  const currentCollection = ref<Collection | null>(null);
  const loading = ref(false);

  // --- ACTIONS ---

  /**
   * Busca as coleções (repositórios) da API.
   */
  async function fetchCollections(): Promise<Collection[]> {
    loading.value = true;
    try {
      const response = await api.get('/repositorios/listar_repositorios');
      collections.value = response.data.results.bindings.map((item: any) => ({
        id: item.uri.value,
        local_id: item.uri.value.split('/').pop(),
        name: item.nome.value,
        description: item.descricao.value,
        contact: item.contato.value,
        responsible: item.responsavel.value,
        image: `https://placehold.co/600x400/1e293b/ffffff?text=${encodeURIComponent(
          item.nome.value
        )}`,
        repository_query_url: item.uri.value + '/sparql',
        repository_update_url: item.uri.value + '/update',
        repository_base_uri: item.uri.value + '#',
      }));
      return collections.value;
    } catch (error) {
      console.error('Erro ao buscar coleções:', error);
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Falha ao carregar as coleções.',
        icon: 'report_problem',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Encontra uma coleção pelo ID e a define como a atual.
   * @param {string} collectionId - A URI da coleção a ser selecionada.
   */
  async function selectCollection(collectionId: string): Promise<void> {
    // Garante que as coleções foram carregadas antes de tentar encontrar uma
    if (collections.value.length === 0) {
      await fetchCollections();
    }

    // Tenta encontrar a coleção de diferentes formas
    let collection = collections.value.find((c) => c.id === collectionId);

    // Se não encontrou, tenta buscar pela URL do endpoint SPARQL
    if (!collection) {
      collection = collections.value.find(
        (c) => c.repository_query_url === collectionId
      );
    }

    // Se ainda não encontrou, tenta buscar pelo local_id
    if (!collection) {
      collection = collections.value.find((c) => c.local_id === collectionId);
    }

    currentCollection.value = collection || null;
  }

  /**
   * Busca uma coleção específica pelo ID.
   * @param {string} collectionId - O ID da coleção.
   */
  async function getCollection(collectionId: string): Promise<Collection> {
    // Primeiro tenta encontrar na lista local de diferentes formas
    let collection = collections.value.find((c) => c.id === collectionId);

    // Se não encontrou, tenta buscar pela URL do endpoint SPARQL
    if (!collection) {
      collection = collections.value.find(
        (c) => c.repository_query_url === collectionId
      );
    }

    // Se ainda não encontrou, tenta buscar pelo local_id
    if (!collection) {
      collection = collections.value.find((c) => c.local_id === collectionId);
    }

    if (!collection) {
      // Se não encontrar, busca na API
      try {
        const response = await api.get(
          `/classapi/get_collection/${collectionId}`
        );
        collection = response.data as Collection;

        if (!collection) {
          throw new Error('Coleção não encontrada');
        }
      } catch (error) {
        console.error('Erro ao buscar coleção:', error);
        throw new Error('Coleção não encontrada');
      }
    }

    return collection;
  }

  /**
   * Cria uma nova coleção.
   * @param {object} collectionData - Dados da coleção.
   */
  async function createCollection(
    collectionData: CollectionData
  ): Promise<any> {
    loading.value = true;
    try {
      const response = await api.post('/classapi/adicionar_classe', {
        label: collectionData.label,
        comment: collectionData.comment,
        subclassof_localname: collectionData.subclassof_localname,
        repository_base_uri: collectionData.repository_base_uri,
        repository_update_url: collectionData.repository_update_url,
      });

      // Adiciona a nova coleção à lista local
      const newCollection: Collection = {
        id: response.data.class_uri,
        name: response.data.label,
        description: collectionData.comment,
        contact: collectionData.contact || '',
        responsible: collectionData.responsible || '',
        image:
          collectionData.image_url ||
          `https://placehold.co/600x400/1e293b/ffffff?text=${encodeURIComponent(
            response.data.label
          )}`,
        tags: collectionData.tags || '',
      };

      collections.value.push(newCollection);

      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Coleção criada com sucesso!',
        icon: 'check_circle',
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao criar coleção:', error);
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Falha ao criar a coleção.',
        icon: 'report_problem',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Atualiza uma coleção existente.
   * @param {string} collectionId - O ID da coleção.
   * @param {object} collectionData - Novos dados da coleção.
   */
  async function updateCollection(
    collectionId: string,
    collectionData: CollectionData
  ): Promise<any> {
    loading.value = true;
    try {
      // Busca a coleção para obter o ID real
      let collection = collections.value.find((c) => c.id === collectionId);

      // Se não encontrou, tenta buscar pela URL do endpoint SPARQL
      if (!collection) {
        collection = collections.value.find(
          (c) => c.repository_query_url === collectionId
        );
      }

      // Se ainda não encontrou, tenta buscar pelo local_id
      if (!collection) {
        collection = collections.value.find((c) => c.local_id === collectionId);
      }

      if (!collection) {
        throw new Error('Coleção não encontrada');
      }

      const response = await api.post('/classapi/alterar_classe', {
        class_uri: collection.id, // Usa o ID real da coleção
        new_label: collectionData.label,
        new_comment: collectionData.comment,
        new_subclassof_localname: collectionData.subclassof_localname,
        repository_base_uri: collectionData.repository_base_uri,
        repository_update_url: collectionData.repository_update_url,
      });

      // Atualiza a coleção na lista local
      const index = collections.value.findIndex((c) => c.id === collection.id);
      if (index !== -1) {
        collections.value[index] = {
          ...collections.value[index],
          name: collectionData.label,
          description: collectionData.comment,
          contact: collectionData.contact || collections.value[index].contact,
          responsible:
            collectionData.responsible || collections.value[index].responsible,
          image: collectionData.image_url || collections.value[index].image,
          tags: collectionData.tags || collections.value[index].tags,
        };
      }

      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Coleção atualizada com sucesso!',
        icon: 'check_circle',
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar coleção:', error);
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Falha ao atualizar a coleção.',
        icon: 'report_problem',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Exclui uma coleção.
   * @param {string} collectionId - O ID da coleção.
   */
  async function deleteCollection(collectionId: string): Promise<void> {
    loading.value = true;
    try {
      // Busca a coleção para obter as URLs necessárias de diferentes formas
      let collection = collections.value.find((c) => c.id === collectionId);

      // Se não encontrou, tenta buscar pela URL do endpoint SPARQL
      if (!collection) {
        collection = collections.value.find(
          (c) => c.repository_query_url === collectionId
        );
      }

      // Se ainda não encontrou, tenta buscar pelo local_id
      if (!collection) {
        collection = collections.value.find((c) => c.local_id === collectionId);
      }

      if (!collection) {
        throw new Error('Coleção não encontrada');
      }

      await api.delete('/classapi/excluir_classe', {
        data: {
          class_uri_to_delete: collection.id, // Usa o ID real da coleção
          repository_update_url:
            collection.repository_update_url ||
            'http://localhost:3030/dataset/update',
          repository_query_url:
            collection.repository_query_url ||
            'http://localhost:3030/dataset/sparql',
        },
      });

      // Remove a coleção da lista local
      collections.value = collections.value.filter(
        (c) => c.id !== collection.id
      );

      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Coleção excluída com sucesso!',
        icon: 'check_circle',
      });
    } catch (error) {
      console.error('Erro ao excluir coleção:', error);
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Falha ao excluir a coleção.',
        icon: 'report_problem',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // --- RETURN ---
  return {
    collections,
    currentCollection,
    loading,
    fetchCollections,
    selectCollection,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
  };
});
