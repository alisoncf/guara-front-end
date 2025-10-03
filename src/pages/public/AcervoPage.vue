<template>
  <q-page class="q-pa-md">
    <div class="main-container">
      <div class="q-mb-xl">
        <h1 class="text-h4 text-weight-bold text-grey-9">Nosso Acervo</h1>
        <p class="text-subtitle1 text-grey-7">
          Navegue pelas coleções ou utilize a busca para encontrar o que procura.
        </p>
      </div>

      <div class="q-mb-xl">
        <q-input
          outlined
          v-model="searchQuery"
          placeholder="Pesquisar em todo o acervo..."
          debounce="500"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div v-if="loading" class="row justify-center q-my-xl">
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

      <div v-if="!loading && filteredCollections.length === 0" class="text-center q-my-xl">
        <q-icon name="search_off" size="4em" color="grey-5" />
        <p class="text-h6 text-grey-6 q-mt-md">
          {{
            searchQuery
              ? 'Nenhuma coleção encontrada para sua busca.'
              : 'Nenhuma coleção disponível.'
          }}
        </p>
        <q-btn
          v-if="searchQuery"
          flat
          color="primary"
          label="Limpar busca"
          @click="searchQuery = ''"
          class="q-mt-md"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useClassStore } from 'stores/class-store';
import { useRepositoryStore } from 'stores/repository-store';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import CollectionCardPublic from 'components/public/CollectionCardPublic.vue'; // Importa o novo componente

defineOptions({
  name: 'AcervoPage',
});

const searchQuery = ref('');
const classStore = useClassStore();
const repositoryStore = useRepositoryStore();
const router = useRouter();

const { classes: collections, loading } = storeToRefs(classStore);

const filteredCollections = computed(() => {
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

onMounted(() => {
  if (!repositoryStore.currentRepository && repositoryStore.allRepositories.length > 0) {
    repositoryStore.selectRepository(repositoryStore.allRepositories[0].uri);
  }
  classStore.fetchAll();
});
</script>
