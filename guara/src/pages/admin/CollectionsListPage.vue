<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-my-none">Gerenciar Coleções</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Visualize e gerencie todas as coleções do sistema
        </p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nova Coleção"
        @click="$router.push('/admin/collections/new')"
      />
    </div>

    <!-- Filtros e busca -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="searchQuery"
              label="Buscar coleções..."
              outlined
              dense
              clearable
              @update:model-value="filterCollections"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="selectedRepository"
              :options="repositoryOptions"
              label="Filtrar por repositório"
              outlined
              dense
              clearable
              @update:model-value="filterCollections"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabela de coleções -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Coleções ({{ filteredCollections.length }})</div>
      </q-card-section>

      <q-table
        :rows="filteredCollections"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        flat
        bordered
      >
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
                @click="editCollection(props.row)"
                title="Editar"
              />
              <q-btn
                flat
                round
                color="secondary"
                icon="visibility"
                size="sm"
                @click="viewCollection(props.row)"
                title="Visualizar"
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

        <!-- Coluna de imagem -->
        <template v-slot:body-cell-image="props">
          <q-td :props="props">
            <q-avatar size="40px">
              <q-img
                :src="
                  props.row.image ||
                  'https://placehold.co/100x100/cccccc/ffffff?text=Sem+Imagem'
                "
                :alt="props.row.name"
              />
            </q-avatar>
          </q-td>
        </template>

        <!-- Estado vazio -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-lg">
            <div class="text-center">
              <q-icon name="collections" size="48px" color="grey-4" />
              <div class="text-grey q-mt-sm">Nenhuma coleção encontrada</div>
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
            Tem certeza que deseja excluir a coleção
            <strong>"{{ collectionToDelete?.name }}"</strong>?
          </p>
          <p class="text-caption text-grey">
            Esta ação não pode ser desfeita e todos os objetos associados serão
            removidos.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            :loading="deleting"
            @click="deleteCollection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCollectionStore } from 'stores/collection-store';
import { Notify } from 'quasar';

const router = useRouter();
const collectionStore = useCollectionStore();

// Estado
const loading = ref(false);
const deleting = ref(false);
const searchQuery = ref('');
const selectedRepository = ref(null);
const showDeleteDialog = ref(false);
const collectionToDelete = ref(null);
const collections = ref([]);

// Computed
const filteredCollections = computed(() => {
  let filtered = collections.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (col) =>
        col.name.toLowerCase().includes(query) ||
        col.description.toLowerCase().includes(query)
    );
  }

  if (selectedRepository.value) {
    filtered = filtered.filter(
      (col) => col.repository === selectedRepository.value
    );
  }

  return filtered;
});

const repositoryOptions = computed(() => {
  const repos = [...new Set(collections.value.map((col) => col.repository))];
  return repos.map((repo) => ({ label: repo, value: repo }));
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
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'description',
    label: 'Descrição',
    field: 'description',
    align: 'left',
    sortable: false,
  },
  {
    name: 'repository',
    label: 'Repositório',
    field: 'repository',
    align: 'left',
    sortable: true,
  },
  {
    name: 'objectsCount',
    label: 'Objetos',
    field: 'objectsCount',
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
async function loadCollections() {
  loading.value = true;
  try {
    const data = await collectionStore.fetchCollections();
    collections.value = data.map((col) => ({
      ...col,
      objectsCount: 0, // Seria calculado com base nos objetos
    }));
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar coleções: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

function filterCollections() {
  // Filtro é aplicado automaticamente pelo computed
}

function editCollection(collection) {
  router.push(`/admin/collections/edit/${collection.id}`);
}

function viewCollection(collection) {
  router.push(`/admin/collections/view/${collection.id}`);
}

function confirmDelete(collection) {
  collectionToDelete.value = collection;
  showDeleteDialog.value = true;
}

async function deleteCollection() {
  if (!collectionToDelete.value) return;

  deleting.value = true;
  try {
    await collectionStore.deleteCollection(collectionToDelete.value.id);
    Notify.create({
      type: 'positive',
      message: 'Coleção excluída com sucesso!',
    });
    await loadCollections();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao excluir coleção: ' + error.message,
    });
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
    collectionToDelete.value = null;
  }
}

// Lifecycle
onMounted(() => {
  loadCollections();
});
</script>
