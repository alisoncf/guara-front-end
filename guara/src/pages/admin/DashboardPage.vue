<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div>
        <h4 class="q-my-none">Dashboard</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Bem-vindo ao painel administrativo do Guará
        </p>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="text-h4 text-primary">{{ stats.totalObjects }}</div>
            <div class="text-subtitle2">Total de Objetos</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="text-h4 text-secondary">
              {{ stats.totalCollections }}
            </div>
            <div class="text-subtitle2">Total de Coleções</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="text-h4 text-accent">{{ stats.newSubmissions }}</div>
            <div class="text-subtitle2">Novos Envios</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="text-h4 text-positive">{{ stats.activeUsers }}</div>
            <div class="text-subtitle2">Usuários Ativos</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Ações Rápidas -->
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
            <q-btn
              color="secondary"
              icon="add"
              label="Novo Objeto"
              class="full-width"
              @click="$router.push('/admin/objects/new')"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              color="accent"
              icon="collections"
              label="Gerenciar Coleções"
              class="full-width"
              @click="$router.push('/admin/collections')"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              color="info"
              icon="inventory_2"
              label="Gerenciar Objetos"
              class="full-width"
              @click="$router.push('/admin/objects')"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Lista de Coleções -->
    <q-card>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Minhas Coleções</div>
          <q-btn
            color="primary"
            icon="add"
            label="Nova Coleção"
            @click="$router.push('/admin/collections/new')"
          />
        </div>

        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner-dots size="50px" color="primary" />
          <div class="q-mt-sm">Carregando coleções...</div>
        </div>

        <div v-else-if="collections.length === 0" class="text-center q-pa-lg">
          <q-icon name="collections" size="48px" color="grey-4" />
          <div class="text-grey q-mt-sm">Nenhuma coleção encontrada</div>
          <q-btn
            color="primary"
            label="Criar Primeira Coleção"
            class="q-mt-md"
            @click="$router.push('/admin/collections/new')"
          />
        </div>

        <div v-else class="row q-col-gutter-md">
          <div
            v-for="collection in collections"
            :key="collection.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <q-card
              class="collection-card"
              clickable
              @click="viewCollection(collection)"
            >
              <q-img
                :src="
                  collection.image ||
                  'https://placehold.co/600x400/cccccc/ffffff?text=Sem+Imagem'
                "
                height="200px"
                class="rounded-borders"
              />
              <q-card-section>
                <div class="text-h6">{{ collection.name }}</div>
                <div class="text-subtitle2 text-grey">
                  {{ collection.description }}
                </div>
                <div class="q-mt-sm">
                  <q-chip
                    :label="`${collection.objectsCount || 0} objetos`"
                    color="primary"
                    text-color="white"
                    size="sm"
                  />
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  flat
                  color="primary"
                  label="Gerenciar"
                  @click.stop="manageCollection(collection)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCollectionStore } from 'stores/collection-store';
import { useObjectStore } from 'stores/object-store';
import { Notify } from 'quasar';

const router = useRouter();
const collectionStore = useCollectionStore();
const objectStore = useObjectStore();

const loading = ref(false);
const collections = ref([]);
const stats = ref({
  totalObjects: 0,
  totalCollections: 0,
  newSubmissions: 0,
  activeUsers: 1,
});

async function loadData() {
  loading.value = true;
  try {
    // Carregar coleções
    const collectionsData = await collectionStore.fetchCollections();
    collections.value = collectionsData;

    // Carregar objetos para calcular estatísticas
    const objectsData = await objectStore.fetchAllObjects();

    // Calcular estatísticas
    stats.value = {
      totalObjects: objectsData.length,
      totalCollections: collectionsData.length,
      newSubmissions: 0, // Seria calculado com base em dados de submissão
      activeUsers: 1, // Seria obtido do sistema de usuários
    };

    // Adicionar contagem de objetos para cada coleção
    collections.value = collections.value.map((collection) => ({
      ...collection,
      objectsCount: objectsData.filter(
        (obj) => obj.collectionId === collection.id
      ).length,
    }));
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar dados do dashboard: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

function viewCollection(collection) {
  router.push(`/admin/collections/view/${collection.id}`);
}

function manageCollection(collection) {
  router.push(`/admin/collections/edit/${collection.id}`);
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.collection-card {
  transition: transform 0.2s ease-in-out;
}

.collection-card:hover {
  transform: translateY(-4px);
}
</style>
