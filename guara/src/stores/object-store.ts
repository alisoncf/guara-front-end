import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import { useCollectionStore } from './collection-store';

// Tipos
interface ObjectItem {
  id: string;
  titulo: string;
  autor?: string;
  descricao?: string;
  resumo?: string;
  tipo?: string;
  data?: string;
  image_url?: string;
  dimensoes?: string;
  material?: string;
  estado_conservacao?: string;
  localizacao?: string;
  tags?: string;
  categoria?: string;
  procedencia?: string;
  aquisicao?: string;
  collectionId: string;
  collectionName?: string;
  rawProperties?: any[];
}

interface ObjectData {
  collectionId: string;
  titulo: string;
  autor?: string;
  tipo?: string;
  data?: string;
  descricao?: string;
  resumo?: string;
  image_url?: string;
  dimensoes?: string;
  material?: string;
  estado_conservacao?: string;
  localizacao?: string;
  tags?: string;
  categoria?: string;
  procedencia?: string;
  aquisicao?: string;
}

// Função auxiliar para encontrar uma propriedade pelo final da sua URI
const findProp = (props: any[], key: string): string => {
  const prop = props.find((p) => p.predicate.endsWith(key));
  return prop ? prop.value : '';
};

export const useObjectStore = defineStore('objects', () => {
  const $q = useQuasar();

  // State
  const objects = ref<ObjectItem[]>([]);
  const currentObject = ref<ObjectItem | null>(null);
  const loading = ref(false);

  async function fetchObjectsByCollection(
    collectionId: string
  ): Promise<ObjectItem[]> {
    loading.value = true;
    objects.value = [];
    try {
      // Busca a coleção para obter os dados do repositório
      const collectionStore = useCollectionStore();
      const collections = await collectionStore.fetchCollections();

      // Tenta encontrar a coleção de diferentes formas
      let collection = collections.find((c) => c.id === collectionId);
      if (!collection) {
        collection = collections.find(
          (c) => c.repository_query_url === collectionId
        );
      }
      if (!collection) {
        collection = collections.find((c) => c.local_id === collectionId);
      }
      if (!collection) {
        throw new Error('Coleção não encontrada');
      }

      // Chamada correta ao endpoint /fis/list
      // keyword pode ser vazio para listar todos
      const response = await api.post('/fis/list', {
        keyword: '',
        repository_sparql_endpoint: collection.repository_query_url,
      });

      if (
        response.data &&
        response.data.results &&
        response.data.results.bindings
      ) {
        objects.value = response.data.results.bindings.map((item: any) => ({
          id: item.obj?.value || '',
          titulo: item.titulo?.value || 'Objeto sem título',
          autor: 'Autor desconhecido', // Não está na consulta atual
          descricao: item.descricao?.value || '',
          resumo: item.resumo?.value || '',
          tipo: item.tipos?.value || '',
          data: '', // Não está na consulta atual
          image_url: `https://placehold.co/600x600/cccccc/ffffff?text=${encodeURIComponent(
            item.titulo?.value || 'Obj'
          )}`,
          dimensoes: '',
          material: '',
          estado_conservacao: '',
          localizacao: '',
          tags: '',
          categoria: '',
          procedencia: '',
          aquisicao: '',
          collectionId: collection.id,
          collectionName: collection.name,
        }));
      }
      return objects.value;
    } catch (error) {
      console.error(
        'Erro ao buscar objetos da coleção (ou a coleção está vazia):',
        error
      );
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchObjectById(objectId: string): Promise<ObjectItem | null> {
    loading.value = true;
    currentObject.value = null;
    try {
      const response = await api.post('/relation/list', {
        id_objeto: objectId,
        repository_sparql_endpoint:
          'http://localhost:3030/festas_populares/sparql', // Ajuste este endpoint conforme necessário
      });

      if (
        response.data &&
        response.data.results &&
        response.data.results.bindings.length > 0
      ) {
        const properties = response.data.results.bindings.map((prop: any) => ({
          predicate: prop.propriedade.value,
          value: prop.valor.value,
          type: prop.tipo_recurso.value,
        }));

        // Monta um objeto mais estruturado
        const details: ObjectItem = {
          id: objectId,
          titulo:
            findProp(properties, '#title') ||
            findProp(properties, '/titulo') ||
            findProp(properties, 'title') ||
            'Objeto sem Título',
          descricao:
            findProp(properties, '#description') ||
            findProp(properties, '/descricao') ||
            findProp(properties, 'description') ||
            findProp(properties, 'resumo'),
          autor:
            findProp(properties, '#creator') ||
            findProp(properties, '/author') ||
            findProp(properties, 'creator') ||
            findProp(properties, 'autor'),
          data:
            findProp(properties, '#date') ||
            findProp(properties, 'date') ||
            findProp(properties, 'data'),
          tipo:
            findProp(properties, '#type') ||
            findProp(properties, 'type') ||
            findProp(properties, 'tipo'),
          dimensoes:
            findProp(properties, 'dimensoes') ||
            findProp(properties, 'dimensions'),
          material: findProp(properties, 'material'),
          estado_conservacao:
            findProp(properties, 'estado_conservacao') ||
            findProp(properties, 'conservation'),
          localizacao:
            findProp(properties, 'localizacao') ||
            findProp(properties, 'location'),
          procedencia:
            findProp(properties, 'procedencia') ||
            findProp(properties, 'provenance'),
          aquisicao:
            findProp(properties, 'aquisicao') ||
            findProp(properties, 'acquisition'),
          // A imagem pode vir de uma propriedade como 'depiction' ou 'image'
          image_url:
            findProp(properties, '#depiction') ||
            findProp(properties, '/image') ||
            findProp(properties, 'image') ||
            findProp(properties, 'depiction') ||
            `https://placehold.co/800x1000/cccccc/ffffff?text=${encodeURIComponent(
              findProp(properties, '#title') || 'Obj'
            )}`,
          collectionId: '', // Será preenchido se necessário
          // Adiciona as propriedades brutas para exibição completa
          rawProperties: properties,
        };

        currentObject.value = details;
        return details;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar detalhes do objeto:', error);
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Falha ao carregar os detalhes do objeto.',
        icon: 'report_problem',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Busca todos os objetos de todas as coleções.
   */
  async function fetchAllObjects(): Promise<ObjectItem[]> {
    loading.value = true;
    try {
      // Busca todas as coleções primeiro
      const collectionStore = useCollectionStore();
      const collections = await collectionStore.fetchCollections();

      const allObjects: ObjectItem[] = [];

      // Para cada coleção, busca seus objetos
      for (const collection of collections) {
        try {
          // Chamada correta ao endpoint /fis/list
          const response = await api.post('/fis/list', {
            keyword: '',
            repository_sparql_endpoint: collection.repository_query_url,
          });

          if (
            response.data &&
            response.data.results &&
            response.data.results.bindings
          ) {
            const collectionObjects = response.data.results.bindings.map(
              (item: any) => ({
                id: item.obj?.value || '',
                titulo: item.titulo?.value || 'Objeto sem título',
                autor: 'Autor desconhecido',
                descricao: item.descricao?.value || '',
                resumo: item.resumo?.value || '',
                tipo: item.tipos?.value || '',
                data: '',
                image_url: `https://placehold.co/600x600/cccccc/ffffff?text=${encodeURIComponent(
                  item.titulo?.value || 'Obj'
                )}`,
                dimensoes: '',
                material: '',
                estado_conservacao: '',
                localizacao: '',
                tags: '',
                categoria: '',
                procedencia: '',
                aquisicao: '',
                collectionId: collection.id,
                collectionName: collection.name,
              })
            );
            allObjects.push(...collectionObjects);
          }
        } catch (error) {
          console.error(
            `Erro ao buscar objetos da coleção ${collection.name}:`,
            error
          );
        }
      }

      objects.value = allObjects;
      return allObjects;
    } catch (error) {
      console.error('Erro ao buscar todos os objetos:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Busca um objeto específico pelo ID.
   */
  async function getObject(objectId: string): Promise<ObjectItem | null> {
    // Primeiro tenta encontrar na lista local
    let object: ObjectItem | null =
      objects.value.find((o) => o.id === objectId) || null;

    if (!object) {
      // Se não encontrar, busca na API
      try {
        object = await fetchObjectById(objectId);
      } catch (error) {
        console.error('Erro ao buscar objeto:', error);
        throw new Error('Objeto não encontrado');
      }
    }

    return object;
  }

  /**
   * Cria um novo objeto.
   */
  async function createObject(objectData: ObjectData): Promise<any> {
    loading.value = true;
    try {
      // Busca a coleção para obter os dados do repositório
      const collectionStore = useCollectionStore();
      const collections = await collectionStore.fetchCollections();

      const collection = collections.find(
        (c) => c.local_id === objectData.collectionId
      );

      if (!collection) {
        throw new Error('Coleção não encontrada');
      }

      // Log do objeto que será enviado
      const objetoParaEnviar = {
        titulo: objectData.titulo,
        resumo: objectData.resumo || '',
        colecao_id: objectData.collectionId,
        repository_update_url:
          collection.repository_update_url || collection.id + '/update',
        repository_base_uri: collection.id + '#',
        autor: objectData.autor || '',
        descricao: objectData.descricao || '',
        tipo: objectData.tipo || '',
        data: objectData.data || '',
        dimensoes: objectData.dimensoes || '',
        material: objectData.material || '',
        estado_conservacao: objectData.estado_conservacao || '',
        localizacao: objectData.localizacao || '',
        tags: objectData.tags || '',
        categoria: objectData.categoria || '',
        procedencia: objectData.procedencia || '',
        aquisicao: objectData.aquisicao || '',
        image_url: objectData.image_url || '',
      };

      const response = await api.post('/fis/create', objetoParaEnviar);

      // Adiciona o novo objeto à lista local
      const newObject: ObjectItem = {
        id: response.data.id || response.data.object_uri,
        titulo: objectData.titulo,
        autor: objectData.autor || '',
        descricao: objectData.descricao || '',
        resumo: objectData.resumo || '',
        tipo: objectData.tipo || '',
        data: objectData.data || '',
        image_url: objectData.image_url || '',
        dimensoes: objectData.dimensoes || '',
        material: objectData.material || '',
        estado_conservacao: objectData.estado_conservacao || '',
        localizacao: objectData.localizacao || '',
        tags: objectData.tags || '',
        categoria: objectData.categoria || '',
        procedencia: objectData.procedencia || '',
        aquisicao: objectData.aquisicao || '',
        collectionId: objectData.collectionId,
        collectionName: collection.name,
      };

      objects.value.push(newObject);

      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Objeto criado com sucesso!',
        icon: 'check_circle',
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao criar objeto:', error);
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Falha ao criar o objeto.',
        icon: 'report_problem',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Atualiza um objeto existente.
   */
  async function updateObject(
    objectId: string,
    objectData: ObjectData
  ): Promise<any> {
    loading.value = true;
    try {
      // Busca a coleção para obter os dados do repositório
      const collectionStore = useCollectionStore();
      const collections = await collectionStore.fetchCollections();
      const collection = collections.find(
        (c) => c.local_id === objectData.collectionId
      );

      if (!collection) {
        throw new Error('Coleção não encontrada');
      }

      const response = await api.put('/fis/alterar', {
        object_uri_to_update: objectId,
        titulo: objectData.titulo,
        resumo: objectData.resumo || '',
        repository_update_url:
          collection.repository_update_url || collection.id + '/update',
        autor: objectData.autor || '',
        descricao: objectData.descricao || '',
        tipo: objectData.tipo || '',
        data: objectData.data || '',
        dimensoes: objectData.dimensoes || '',
        material: objectData.material || '',
        estado_conservacao: objectData.estado_conservacao || '',
        localizacao: objectData.localizacao || '',
        tags: objectData.tags || '',
        categoria: objectData.categoria || '',
        procedencia: objectData.procedencia || '',
        aquisicao: objectData.aquisicao || '',
        image_url: objectData.image_url || '',
      });

      // Atualiza o objeto na lista local
      const index = objects.value.findIndex((o) => o.id === objectId);
      if (index !== -1) {
        objects.value[index] = {
          ...objects.value[index],
          titulo: objectData.titulo,
          autor: objectData.autor || objects.value[index].autor,
          descricao: objectData.descricao || objects.value[index].descricao,
          resumo: objectData.resumo || objects.value[index].resumo,
          tipo: objectData.tipo || objects.value[index].tipo,
          data: objectData.data || objects.value[index].data,
          image_url: objectData.image_url || objects.value[index].image_url,
          dimensoes: objectData.dimensoes || objects.value[index].dimensoes,
          material: objectData.material || objects.value[index].material,
          estado_conservacao:
            objectData.estado_conservacao ||
            objects.value[index].estado_conservacao,
          localizacao:
            objectData.localizacao || objects.value[index].localizacao,
          tags: objectData.tags || objects.value[index].tags,
          categoria: objectData.categoria || objects.value[index].categoria,
          procedencia:
            objectData.procedencia || objects.value[index].procedencia,
          aquisicao: objectData.aquisicao || objects.value[index].aquisicao,
        };
      }

      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Objeto atualizado com sucesso!',
        icon: 'check_circle',
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar objeto:', error);
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Falha ao atualizar o objeto.',
        icon: 'report_problem',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Exclui um objeto.
   */
  async function deleteObject(objectId: string): Promise<void> {
    loading.value = true;
    try {
      // Busca o objeto para obter o repositório
      const object = objects.value.find((o) => o.id === objectId);
      if (!object) {
        throw new Error('Objeto não encontrado');
      }

      // Busca a coleção para obter os dados do repositório
      const collectionStore = useCollectionStore();
      const collections = await collectionStore.fetchCollections();
      const collection = collections.find((c) => c.id === object.collectionId);

      if (!collection) {
        throw new Error('Coleção não encontrada');
      }

      await api.delete('/fis/delete', {
        data: {
          object_uri_to_delete: objectId,
          repository_update_url:
            collection.repository_update_url || collection.id + '/update',
        },
      });

      // Remove o objeto da lista local
      objects.value = objects.value.filter((o) => o.id !== objectId);

      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Objeto excluído com sucesso!',
        icon: 'check_circle',
      });
    } catch (error) {
      console.error('Erro ao excluir objeto:', error);
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Falha ao excluir o objeto.',
        icon: 'report_problem',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    objects,
    currentObject,
    loading,
    fetchObjectsByCollection,
    fetchObjectById,
    fetchAllObjects,
    getObject,
    createObject,
    updateObject,
    deleteObject,
  };
});
