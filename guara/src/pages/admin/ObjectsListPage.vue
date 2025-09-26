<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-my-none">Gerenciar Objetos</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Objetos do repositório
          <strong>{{ repositoryStore.currentRepository?.nome || '' }}</strong>
        </p>
      </div>
      <q-btn-dropdown
        split
        color="primary"
        icon="add"
        label="Novo Objeto Físico"
        @click="$router.push('/admin/objects/physical/new')"
      >
        <q-list>
          <q-item clickable v-close-popup @click="$router.push('/admin/objects/dimensional/new')">
            <q-item-section avatar><q-icon name="layers" /></q-item-section>
            <q-item-section>
              <q-item-label>Novo Objeto Dimensional</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input v-model="searchQuery" label="Buscar por título, resumo..." outlined dense clearable>
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select v-model="selectedCollection" :options="collectionOptions" label="Filtrar por coleção" outlined dense clearable emit-value map-options />
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="selectedType" :options="['Físico', 'Dimensional']" label="Filtrar por tipo" outlined dense clearable />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-h6">Objetos ({{ filteredObjects.length }})</div>
      </q-card-section>
      <ObjectTable
        :objects="filteredObjects"
        :loading="loading"
        @edit="editObject"
        @view="viewObject"
        @relations="manageRelations"
        @delete="confirmDelete"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import { usePhysicalObjectStore } from 'stores/physical-object-store';
import { useRepositoryStore } from 'stores/repository-store';
import { useClassStore } from 'stores/class-store';
import { storeToRefs } from 'pinia';
import { Notify, Dialog } from 'quasar';
import ObjectTable from 'components/Admin/ObjectTable.vue'; // Importa o novo componente

const router = useRouter();
const objectStore = useDimensionalObjectStore();
const physicalObjectStore = usePhysicalObjectStore();
const repositoryStore = useRepositoryStore();
const classStore = useClassStore();

const { objects, loading: loadingObjects } = storeToRefs(objectStore);
const { classes: collections } = storeToRefs(classStore);
const loadingPhyiscal = storeToRefs(physicalObjectStore).loading;

const loading = computed(() => loadingObjects.value || loadingPhyiscal.value);

// Filtros
const searchQuery = ref('');
const selectedCollection = ref(null);
const selectedType = ref(null);

const collectionOptions = computed(() => collections.value.map(col => ({ label: col.label, value: col.uri })));

const filteredObjects = computed(() => {
  let filtered = objects.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(obj => obj.titulo.toLowerCase().includes(q) || (obj.resumo && obj.resumo.toLowerCase().includes(q)));
  }
  if (selectedCollection.value) {
    filtered = filtered.filter(obj => obj.colecao === selectedCollection.value);
  }
  if (selectedType.value) {
    filtered = filtered.filter(obj => obj.tipo === selectedType.value);
  }
  return filtered;
});

function editObject(object) {
  const encodedId = encodeURIComponent(object.id);
  if (object.tipo === 'Físico') {
    router.push(`/admin/objects/physical/edit/${encodedId}`);
  } else {
    router.push(`/admin/objects/dimensional/edit/${encodedId}`);
  }
}

function viewObject(object) { router.push(`/admin/objects/view/${encodeURIComponent(object.id)}`); }
function manageRelations(object) { router.push(`/admin/objects/${encodeURIComponent(object.id)}/relations`); }

function confirmDelete(object) {
  Dialog.create({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir o objeto <strong>"${object.titulo}"</strong>?`,
    html: true,
    cancel: true,
  }).onOk(() => deleteObject(object));
}

async function deleteObject(object) {
  const store = object.tipo === 'Físico' ? physicalObjectStore : dimensionalObjectStore;
  const success = await store.remove(object.id);
  if (success) {
    objectStore.fetchAll();
  }
}

onMounted(() => {
  if (repositoryStore.currentRepository) {
    objectStore.fetchAll();
    if (collections.value.length === 0) classStore.fetchAll();
  } else {
    Notify.create({ type: 'warning', message: 'Selecione um repositório para ver os objetos.' });
  }
});
</script>
