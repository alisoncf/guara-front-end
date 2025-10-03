<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-my-none">Gerenciar Coleções</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Visualize e gerencie todas as coleções do repositório
          <strong>{{ repositoryStore.currentRepository?.nome || '' }}</strong>
        </p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nova Coleção"
        @click="$router.push('/admin/collections/new')"
      />
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <q-input
          v-model="searchQuery"
          label="Buscar coleções..."
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-h6">Coleções ({{ filteredCollections.length }})</div>
      </q-card-section>

      <q-table
        :rows="filteredCollections"
        :columns="columns"
        row-key="uri"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        flat
        bordered
      >
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

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-lg">
            <div class="text-center">
              <q-icon name="collections" size="48px" color="grey-4" />
              <div class="text-grey q-mt-sm">Nenhuma coleção encontrada neste repositório.</div>
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Exclusão</div>
        </q-card-section>
        <q-card-section>
          <p>
            Tem certeza que deseja excluir a coleção
            <strong>"{{ collectionToDelete?.label }}"</strong>?
          </p>
          <p class="text-caption text-grey">
            Esta ação não pode ser desfeita.
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
import { useClassStore } from 'stores/class-store';
import { useRepositoryStore } from 'stores/repository-store';
import { storeToRefs } from 'pinia';
import { Notify, Dialog } from 'quasar';

const router = useRouter();
const classStore = useClassStore();
const repositoryStore = useRepositoryStore();

// Estados reativos da store
const { classes: collections, loading } = storeToRefs(classStore);

// Estado local
const deleting = ref(false);
const searchQuery = ref('');
const showDeleteDialog = ref(false);
const collectionToDelete = ref(null);

// Computed para filtrar coleções
const filteredCollections = computed(() => {
  if (!searchQuery.value) {
    return collections.value;
  }
  const query = searchQuery.value.toLowerCase();
  return collections.value.filter(
    (col) =>
      (col.label && col.label.toLowerCase().includes(query)) ||
      (col.description && col.description.toLowerCase().includes(query))
  );
});

// Colunas da tabela
const columns = [
  { name: 'label', label: 'Nome', field: 'label', align: 'left', sortable: true },
  { name: 'description', label: 'Descrição', field: 'description', align: 'left', sortable: false, classes: 'ellipsis' },
  { name: 'uri', label: 'URI', field: 'uri', align: 'left', sortable: true, classes: 'ellipsis' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center', sortable: false },
];

// Métodos
function editCollection(collection) {
  const encodedId = encodeURIComponent(collection.uri);
  router.push(`/admin/collections/edit/${encodedId}`);
}

function viewCollection(collection) {
  const encodedId = encodeURIComponent(collection.uri);
  router.push(`/admin/collections/view/${encodedId}`);
}

function confirmDelete(collection) {
  collectionToDelete.value = collection;
  showDeleteDialog.value = true;
}

async function deleteCollection() {
  if (!collectionToDelete.value) return;

  deleting.value = true;
  try {
    const success = await classStore.remove(collectionToDelete.value.uri);
    if (success) {
      // A store já remove da lista local e exibe notificação.
    } else {
      Notify.create({
        type: 'negative',
        message: 'Erro ao excluir coleção.',
      });
    }
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
    collectionToDelete.value = null;
  }
}

// Lifecycle
onMounted(() => {
  if (repositoryStore.currentRepository) {
    classStore.fetchAll();
  } else {
    Notify.create({ type: 'warning', message: 'Selecione um repositório para ver as coleções.' });
  }
});
</script>
