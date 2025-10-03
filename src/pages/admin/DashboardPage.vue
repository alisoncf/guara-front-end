<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div>
        <h4 class="q-my-none">Dashboard</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Bem-vindo ao painel administrativo do Guará. Repositório ativo:
          <strong>{{ repositoryStore.currentRepository?.nome || 'Nenhum' }}</strong>
        </p>
      </div>
    </div>

    <q-card v-if="!repositoryStore.currentRepository" class="bg-warning text-white">
      <q-card-section>
        <div class="text-h6">Nenhum repositório selecionado</div>
        <div>Por favor, selecione um repositório no menu superior para começar a gerenciar os dados.</div>
      </q-card-section>
    </q-card>

    <template v-else>
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="text-center">
            <q-card-section>
              <q-skeleton v-if="loading" type="text" width="50px" class="q-mx-auto" />
              <div v-else class="text-h4 text-primary">{{ stats.totalObjects }}</div>
              <div class="text-subtitle2">Total de Objetos</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="text-center">
            <q-card-section>
              <q-skeleton v-if="loading" type="text" width="50px" class="q-mx-auto" />
              <div v-else class="text-h4 text-secondary">{{ stats.totalCollections }}</div>
              <div class="text-subtitle2">Total de Coleções</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="text-center">
            <q-card-section>
              <div class="text-h4 text-accent">{{ stats.newSubmissions }}</div>
              <div class="text-subtitle2">Novos Envios (mock)</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="text-center">
            <q-card-section>
              <div class="text-h4 text-positive">{{ stats.activeUsers }}</div>
              <div class="text-subtitle2">Usuários Ativos (mock)</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Ações Rápidas</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3">
              <q-btn
                color="primary"
                icon="add"
                label="Nova Coleção"
                class="full-width"
                @click="$router.push('/admin/collections/new')"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-btn-dropdown
                split
                color="secondary"
                icon="add"
                label="Novo Objeto Físico"
                class="full-width"
                @click="$router.push('/admin/objects/physical/new')"
              >
                <q-list>
                  <q-item clickable v-close-popup @click="$router.push('/admin/objects/dimensional/new')">
                    <q-item-section>
                      <q-item-label>Novo Objeto Dimensional</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Coleções no Repositório</div>
            <q-btn
              flat
              color="primary"
              label="Ver Todas"
              @click="$router.push('/admin/collections')"
            />
          </div>

          <div v-if="loading" class="text-center q-pa-lg">
            <q-spinner-dots size="50px" color="primary" />
            <div class="q-mt-sm">Carregando coleções...</div>
          </div>

          <div v-else-if="collections.length === 0" class="text-center q-pa-lg">
            <q-icon name="collections" size="48px" color="grey-4" />
            <div class="text-grey q-mt-sm">Nenhuma coleção encontrada neste repositório.</div>
            <q-btn
              color="primary"
              label="Criar Primeira Coleção"
              class="q-mt-md"
              @click="$router.push('/admin/collections/new')"
            />
          </div>

          <div v-else class="row q-col-gutter-md">
            <div
              v-for="collection in collections.slice(0, 3)"
              :key="collection.uri"
              class="col-12 col-md-4"
            >
              <CollectionCardAdmin
                :collection="collection"
                @view="viewCollection"
                @manage="manageCollection"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRepositoryStore } from 'stores/repository-store';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import { useClassStore } from 'stores/class-store';
import { storeToRefs } from 'pinia';
import CollectionCardAdmin from 'components/Admin/CollectionCardAdmin.vue'; // Importa o novo componente

const router = useRouter();
const repositoryStore = useRepositoryStore();
const objectStore = useDimensionalObjectStore();
const classStore = useClassStore();

const { classes: collections, loading: loadingCollections } = storeToRefs(classStore);
const { objects, loading: loadingObjects } = storeToRefs(objectStore);

const loading = computed(() => loadingCollections.value || loadingObjects.value);

const stats = ref({
  totalObjects: 0,
  totalCollections: 0,
  newSubmissions: 0,
  activeUsers: 1,
});

async function loadData() {
  if (!repositoryStore.currentRepository) {
    return;
  }
  await Promise.all([
    classStore.fetchAll(),
    objectStore.fetchAll()
  ]);

  stats.value = {
    totalObjects: objects.value.length,
    totalCollections: collections.value.length,
    newSubmissions: 0,
    activeUsers: 1,
  };
}

function viewCollection(collection) {
  const encodedId = encodeURIComponent(collection.uri);
  router.push(`/admin/collections/view/${encodedId}`);
}

function manageCollection(collection) {
  const encodedId = encodeURIComponent(collection.uri);
  router.push(`/admin/collections/edit/${encodedId}`);
}

watch(() => repositoryStore.currentRepository, (newRepo) => {
  if (newRepo) {
    loadData();
  }
}, { immediate: true });
</script>
