<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        @click="$router.push('/admin/collections')"
        class="q-mr-md"
      />
      <div>
        <h4 class="q-my-none">Visualizar Coleção</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Detalhes da coleção selecionada
        </p>
      </div>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm">Carregando dados...</div>
    </div>

    <div v-else-if="collection" class="row q-col-gutter-lg">
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">{{ collection.label }}</div>
            <p class="text-body1">{{ collection.description }}</p>

            <div class="q-mt-md">
              <div class="text-subtitle2 text-grey">URI</div>
              <div class="text-caption ellipsis">{{ collection.uri }}</div>
            </div>
            <div class="q-mt-md">
              <div class="text-subtitle2 text-grey">Superclasse</div>
              <div class="text-caption ellipsis">{{ collection.subclassOf }}</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="q-mt-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                Objetos da Coleção ({{ objects.length }})
              </div>
              <q-btn
                color="primary"
                icon="add"
                label="Adicionar Objeto"
                @click="
                  $router.push(
                    `/admin/objects/new?collectionId=${encodeURIComponent(collection.uri)}`
                  )
                "
              />
            </div>

            <q-table
              :rows="objects"
              :columns="objectColumns"
              row-key="id"
              :loading="loadingObjects"
              flat
              bordered
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    color="secondary"
                    icon="visibility"
                    size="sm"
                    @click="viewObject(props.row)"
                    title="Visualizar"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Ações</div>
            <div class="q-gutter-sm">
              <q-btn
                label="Editar Coleção"
                icon="edit"
                color="primary"
                class="full-width"
                @click="
                  $router.push(`/admin/collections/edit/${encodeURIComponent(collection.uri)}`)
                "
              />
              <q-btn
                label="Excluir Coleção"
                icon="delete"
                color="negative"
                class="full-width"
                @click="confirmDelete"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else class="text-center q-pa-lg text-grey">
      <q-icon name="error_outline" size="48px" />
      <p>Coleção não encontrada ou não foi possível carregar os dados.</p>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClassStore } from 'stores/class-store';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import { Notify, Dialog } from 'quasar';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const classStore = useClassStore();
const objectStore = useDimensionalObjectStore();

const { classes, loading: loadingClasses } = storeToRefs(classStore);
const { objects, loading: loadingObjects } = storeToRefs(objectStore);

const collection = ref(null);
const pageLoading = ref(false);

const loading = computed(() => pageLoading.value || loadingClasses.value);

const objectColumns = [
  { name: 'titulo', label: 'Título', field: 'titulo', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' },
  { name: 'actions', label: 'Ações', align: 'center' }
];

async function loadData() {
  pageLoading.value = true;
  try {
    const collectionUri = decodeURIComponent(route.params.id);

    // Carrega todas as classes se ainda não estiverem na store
    if (classes.value.length === 0) {
      await classStore.fetchAll();
    }
    // Encontra a coleção específica na lista
    collection.value = classes.value.find(c => c.uri === collectionUri) || null;

    if (collection.value) {
      // Busca objetos filtrando pela URI da coleção
      await objectStore.fetchAll(collection.value.uri);
    } else {
      Notify.create({ type: 'negative', message: 'Coleção não encontrada.' });
    }
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Erro ao carregar dados da coleção: ' + error.message });
  } finally {
    pageLoading.value = false;
  }
}

function viewObject(object) {
  const encodedId = encodeURIComponent(object.id);
  router.push(`/admin/objects/view/${encodedId}`);
}

function confirmDelete() {
  Dialog.create({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir a coleção <strong>"${collection.value?.label}"</strong>? Esta ação não pode ser desfeita.`,
    html: true,
    cancel: true,
    persistent: true,
  }).onOk(deleteCollection);
}

async function deleteCollection() {
  if (!collection.value) return;

  const success = await classStore.remove(collection.value.uri);
  if (success) {
    router.push('/admin/collections');
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.object-card {
  transition: transform 0.2s ease-in-out;
}
.object-card:hover {
  transform: translateY(-4px);
}
</style>
