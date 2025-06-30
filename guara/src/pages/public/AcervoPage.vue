<template>
  <q-page class="q-pa-md">
    <div class="main-container">
      <!-- Cabeçalho da Página -->
      <div class="q-mb-xl">
        <h1 class="text-h4 text-weight-bold text-grey-9">Nosso Acervo</h1>
        <p class="text-subtitle1 text-grey-7">
          Navegue pelas coleções ou utilize a busca para encontrar o que
          procura.
        </p>
      </div>

      <!-- Barra de Busca -->
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

      <!-- Seção de Carregamento (Loading) -->
      <div v-if="collectionStore.loading" class="row justify-center q-my-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <!-- Grid de Coleções -->
      <div v-else class="row q-col-gutter-lg">
        <div
          v-for="collection in filteredCollections"
          :key="collection.id"
          class="col-xs-12 col-sm-6 col-md-4"
        >
          <q-card
            class="collection-card cursor-pointer"
            flat
            bordered
            @click="onCollectionClick(collection.repository_query_url)"
          >
            <q-img :src="collection.image" :ratio="16 / 9">
              <template v-slot:error>
                <div
                  class="absolute-full flex flex-center bg-grey-4 text-white"
                >
                  Imagem Indisponível
                </div>
              </template>
            </q-img>

            <q-card-section>
              <div class="text-h6 text-weight-bold text-grey-9">
                {{ collection.name }}
              </div>
              <p class="text-body2 text-grey-7 q-mt-sm">
                {{ collection.description }}
              </p>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Mensagem quando não há resultados -->
      <div
        v-if="!collectionStore.loading && filteredCollections.length === 0"
        class="text-center q-my-xl"
      >
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
import { useCollectionStore } from 'stores/collection-store';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'AcervoPage',
});

const searchQuery = ref('');
const collectionStore = useCollectionStore();
const router = useRouter();

// Computed property para filtrar coleções baseado na busca
const filteredCollections = computed(() => {
  return collectionStore.collections.filter(
    (collection) =>
      collection.repository_query_url && // só mostra se tem endpoint
      (!searchQuery.value.trim() ||
        collection.name
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        collection.description
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()))
  );
});

/**
 * Função chamada quando um card de coleção é clicado.
 * Codifica a URI para que ela seja segura para uso em uma URL.
 */
function onCollectionClick(collectionId) {
  const encodedId = encodeURIComponent(collectionId);
  router.push(`/acervo/${encodedId}`);
}

onMounted(() => {
  collectionStore.fetchCollections();
});
</script>

<style lang="scss" scoped>
.collection-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.collection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
