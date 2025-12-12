<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div>
        <h4 class="q-my-none">Dashboard</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Bem-vindo ao painel administrativo do Guará.
          Repositorio ativo: <strong>{{ repositoryStore.currentRepository?.nome || 'Nenhum' }}</strong>
        </p>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6">
        <q-card bordered class="status-card">
          <q-item>
            <q-item-section avatar>
              <q-icon name="dns" color="primary" size="lg" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">API MemoriA</q-item-label>
              <q-item-label caption>Backend de Inteligência (Porta Diferente)</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip
                :color="memoriaOnline ? 'positive' : 'negative'"
                text-color="white"
                :icon="memoriaOnline ? 'check_circle' : 'error'"
              >
                {{ memoriaOnline ? 'Online' : 'Offline' }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-card>
      </div>

      <div class="col-12 col-sm-6">
        <q-card bordered class="status-card">
          <q-item>
            <q-item-section avatar>
              <q-icon name="visibility" color="accent" size="lg" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">Oculus (OCR)</q-item-label>
              <q-item-label caption>Extração de Texto</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip
                :color="oculusStatus.status === 'ok' ? 'positive' : 'negative'"
                text-color="white"
                :icon="oculusStatus.status === 'ok' ? 'check_circle' : 'error'"
              >
                {{ oculusStatus.status || 'Verificando...' }}
              </q-chip>
            </q-item-section>
          </q-item>
          <q-separator v-if="oculusStatus.detail" />
          <q-card-section v-if="oculusStatus.detail" class="text-caption text-grey">
            {{ oculusStatus.detail }}
          </q-card-section>
        </q-card>
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
import CollectionCardAdmin from 'components/Admin/CollectionCardAdmin.vue';

// --- IMPORTAÇÃO DOS NOVOS SERVIÇOS ---
import { checkMemoriaStatus, checkOculusStatus } from 'src/services/statusService';

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

// --- ESTADOS REATIVOS PARA OS STATUS ---
const memoriaOnline = ref(false);
const oculusStatus = ref({ status: '...', detail: '' });

// --- FUNÇÃO PARA CHECAR SERVIÇOS ---
async function checkServices() {
  // Verifica MemoriA
  memoriaOnline.value = await checkMemoriaStatus();

  // Verifica Oculus
  oculusStatus.value = await checkOculusStatus();
}

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

// Watchers e Hooks existentes
watch(() => repositoryStore.currentRepository, (newRepo) => {
  if (newRepo) {
    loadData();
  }
}, { immediate: true });

onMounted(() => {
  // Chama a verificação assim que a página carrega
  checkServices();
});
</script>

<style scoped>
.status-card {
  height: 100%;
  transition: transform 0.2s;
}
.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>
