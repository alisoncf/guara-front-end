<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-my-none">Gerenciar Objetos</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Visualize e gerencie todos os objetos do sistema
        </p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Novo Objeto"
        @click="$router.push('/admin/objects/new')"
      />
    </div>

    <!-- Filtros e busca -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              label="Buscar objetos..."
              outlined
              dense
              clearable
              @update:model-value="filterObjects"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="selectedCollection"
              :options="collectionOptions"
              label="Filtrar por coleção"
              outlined
              dense
              clearable
              @update:model-value="filterObjects"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="selectedType"
              :options="typeOptions"
              label="Filtrar por tipo"
              outlined
              dense
              clearable
              @update:model-value="filterObjects"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabela de objetos -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Objetos ({{ filteredObjects.length }})</div>
      </q-card-section>

      <q-table
        :rows="filteredObjects"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 15 }"
        flat
        bordered
      >
        <!-- Coluna de imagem -->
        <template v-slot:body-cell-image="props">
          <q-td :props="props">
            <q-avatar size="40px">
              <q-img
                :src="
                  props.row.image ||
                  'https://placehold.co/100x100/cccccc/ffffff?text=Sem+Imagem'
                "
                :alt="props.row.titulo"
              />
            </q-avatar>
          </q-td>
        </template>

        <!-- Coluna de título -->
        <template v-slot:body-cell-titulo="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.titulo }}</div>
            <div class="text-caption text-grey">
              {{ props.row.autor || 'Autor desconhecido' }}
            </div>
          </q-td>
        </template>

        <!-- Coluna de coleção -->
        <template v-slot:body-cell-collection="props">
          <q-td :props="props">
            <q-chip
              :label="props.row.collectionName"
              color="primary"
              text-color="white"
              size="sm"
            />
          </q-td>
        </template>

        <!-- Coluna de ações -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                size="sm"
                @click="editObject(props.row)"
                title="Editar"
              />
              <q-btn
                flat
                round
                color="secondary"
                icon="visibility"
                size="sm"
                @click="viewObject(props.row)"
                title="Visualizar"
              />
              <q-btn
                flat
                round
                color="info"
                icon="link"
                size="sm"
                @click="manageRelations(props.row)"
                title="Gerenciar Relações"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="confirmDelete(props.row)"
                title="Excluir"
              />
            </div>
          </q-td>
        </template>

        <!-- Estado vazio -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-lg">
            <div class="text-center">
              <q-icon name="inventory_2" size="48px" color="grey-4" />
              <div class="text-grey q-mt-sm">Nenhum objeto encontrado</div>
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog de confirmação de exclusão -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Exclusão</div>
        </q-card-section>

        <q-card-section>
          <p>
            Tem certeza que deseja excluir o objeto
            <strong>"{{ objectToDelete?.titulo }}"</strong>?
          </p>
          <p class="text-caption text-grey">
            Esta ação não pode ser desfeita e todas as relações serão removidas.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            :loading="deleting"
            @click="deleteObject"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useObjectStore } from 'stores/object-store';
import { useCollectionStore } from 'stores/collection-store';
import { Notify } from 'quasar';

const router = useRouter();
const objectStore = useObjectStore();
const collectionStore = useCollectionStore();

// Estado
const loading = ref(false);
const deleting = ref(false);
const searchQuery = ref('');
const selectedCollection = ref(null);
const selectedType = ref(null);
const showDeleteDialog = ref(false);
const objectToDelete = ref(null);
const objects = ref([]);
const collections = ref([]);

// Computed
const filteredObjects = computed(() => {
  let filtered = objects.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (obj) =>
        obj.titulo.toLowerCase().includes(query) ||
        (obj.autor && obj.autor.toLowerCase().includes(query)) ||
        (obj.descricao && obj.descricao.toLowerCase().includes(query))
    );
  }

  if (selectedCollection.value) {
    filtered = filtered.filter(
      (obj) => obj.collectionId === selectedCollection.value
    );
  }

  if (selectedType.value) {
    filtered = filtered.filter((obj) => obj.tipo === selectedType.value);
  }

  return filtered;
});

const collectionOptions = computed(() => {
  return collections.value.map((col) => ({
    label: col.name,
    value: col.id,
  }));
});

const typeOptions = computed(() => {
  const types = [...new Set(objects.value.map((obj) => obj.tipo))];
  return types.map((type) => ({ label: type, value: type }));
});

// Colunas da tabela
const columns = [
  {
    name: 'image',
    label: 'Imagem',
    field: 'image',
    align: 'center',
    sortable: false,
  },
  {
    name: 'titulo',
    label: 'Título / Autor',
    field: 'titulo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'collection',
    label: 'Coleção',
    field: 'collectionName',
    align: 'center',
    sortable: true,
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'data',
    label: 'Data',
    field: 'data',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'center',
    sortable: false,
  },
];

// Métodos
async function loadData() {
  loading.value = true;
  try {
    // Carregar coleções
    const collectionsData = await collectionStore.fetchCollections();
    collections.value = collectionsData;

    // Carregar objetos
    const objectsData = await objectStore.fetchAllObjects();

    // Mapear objetos com informações da coleção
    objects.value = objectsData.map((obj) => {
      // Tenta encontrar a coleção de diferentes formas
      let collection = collectionsData.find(
        (col) => col.id === obj.collectionId
      );

      // Se não encontrou, tenta buscar pelo local_id
      if (!collection) {
        collection = collectionsData.find(
          (col) => col.local_id === obj.collectionId
        );
      }

      return {
        ...obj,
        collectionName: collection?.name || 'Coleção desconhecida',
      };
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar dados: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

function filterObjects() {
  // Filtro é aplicado automaticamente pelo computed
}

function editObject(object) {
  router.push(`/admin/objects/edit/${object.id}`);
}

function viewObject(object) {
  router.push(`/admin/objects/view/${object.id}`);
}

function manageRelations(object) {
  router.push(`/admin/objects/${object.id}/relations`);
}

function confirmDelete(object) {
  objectToDelete.value = object;
  showDeleteDialog.value = true;
}

async function deleteObject() {
  if (!objectToDelete.value) return;

  deleting.value = true;
  try {
    await objectStore.deleteObject(objectToDelete.value.id);
    Notify.create({
      type: 'positive',
      message: 'Objeto excluído com sucesso!',
    });
    await loadData();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao excluir objeto: ' + error.message,
    });
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
    objectToDelete.value = null;
  }
}

// Lifecycle
onMounted(() => {
  loadData();
});
</script>
