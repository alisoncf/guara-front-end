<template>
  <q-page class="q-pa-md">
    <div class="main-container">
      <div class="q-mb-xl">
        <h1 class="text-h4 text-weight-bold text-grey-9">Nosso Acervo</h1>
        <p class="text-subtitle1 text-grey-7">
          Selecione um acervo para começar a explorar suas coleções.
        </p>
      </div>

      <div class="q-mb-xl">
        <q-select
          outlined
          v-model="selectedRepositoryUri"
          :options="allRepositories"
          label="Selecione o Acervo"
          :loading="loadingRepositories"
          emit-value
          map-options
          option-value="uri"
          option-label="nome"
          @update:model-value="onRepositoryChange"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                Nenhum acervo disponível.
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <template v-if="currentRepository">
        <div class="q-mb-xl">
          <q-input
            outlined
            v-model="searchQuery"
            placeholder="Pesquisar nesta coleção..."
            debounce="500"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div v-if="loadingCollections" class="row justify-center q-my-xl">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else class="row q-col-gutter-lg">
          <div
            v-for="collection in filteredCollections"
            :key="collection.uri"
            class="col-xs-12 col-sm-6 col-md-4"
          >
            <CollectionCardPublic
              :collection="collection"
              @click="onCollectionClick(collection)"
            />
          </div>
        </div>

        <div v-if="!loadingCollections && filteredCollections.length === 0" class="text-center q-my-xl">
          <q-icon name="search_off" size="4em" color="grey-5" />
          <p class="text-h6 text-grey-6 q-mt-md">
            {{
              searchQuery
                ? 'Nenhuma coleção encontrada para sua busca.'
                : 'Nenhuma coleção disponível neste acervo.'
            }}
          </p>
        </div>
      </template>

      <div v-else class="text-center q-my-xl text-grey">
        <q-icon name="collections_bookmark" size="4em" />
        <p class="text-h6 q-mt-md">
          Por favor, selecione um acervo acima para ver as coleções.
        </p>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'; // Adicionado 'watch'
import { useClassStore } from 'stores/class-store';
import { useRepositoryStore } from 'stores/repository-store';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import CollectionCardPublic from 'components/public/CollectionCardPublic.vue';

defineOptions({
  name: 'AcervoPage',
});

const searchQuery = ref('');
const classStore = useClassStore();
const repositoryStore = useRepositoryStore();
const router = useRouter();

const { classes: collections, loading: loadingCollections } = storeToRefs(classStore);
const {
  allRepositories,
  loading: loadingRepositories,
  currentRepository
} = storeToRefs(repositoryStore);

// O v-model continuará refletindo o estado atual da store
const selectedRepositoryUri = ref(currentRepository.value?.uri || null);

const filteredCollections = computed(() => {
  // ... (esta computed property não muda)
  if (!searchQuery.value.trim()) {
    return collections.value;
  }
  const q = searchQuery.value.toLowerCase();
  return collections.value.filter(
    (collection) =>
      (collection.label && collection.label.toLowerCase().includes(q)) ||
      (collection.description && collection.description.toLowerCase().includes(q))
  );
});

function onCollectionClick(collection) {
  const encodedId = encodeURIComponent(collection.uri);
  router.push(`/acervo/${encodedId}`);
}

/**
 * 3. (SIMPLIFICADO) Esta função agora apenas atualiza o estado na store.
 * A busca de dados será feita pelo 'watch'.
 */
function onRepositoryChange(repoUri) {
  repositoryStore.selectRepository(repoUri);
}

/**
 * 2. (NOVO) Adicionamos um 'watch' para reagir às mudanças no repositório.
 * Este é o "cérebro" da nossa página agora.
 */
watch(currentRepository, (newRepo, oldRepo) => {
  // Sincroniza o v-model do select com a store
  selectedRepositoryUri.value = newRepo?.uri || null;

  if (newRepo) {
    // Se um novo repositório foi selecionado (e é diferente do antigo),
    // busca as coleções.
    if (newRepo.uri !== oldRepo?.uri) {
      classStore.fetchAll();
    }
  } else {
    // Se o repositório foi limpo, limpa as coleções.
    classStore.clearClasses();
  }
}, { immediate: true });

onMounted(() => {
  if (repositoryStore.allRepositories.length === 0) {
    repositoryStore.fetchAll();
  }
});
</script>
