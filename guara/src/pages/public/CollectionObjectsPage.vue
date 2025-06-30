<template>
  <q-page class="q-pa-md">
    <div class="main-container">
      <!-- Botão para Voltar -->
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Voltar para Coleções"
        to="/acervo"
        class="q-mb-md"
      />

      <!-- Detalhes da Coleção e Busca -->
      <div class="q-mb-xl">
        <!-- Título agora é dinâmico e mostra um esqueleto de carregamento -->
        <h1
          v-if="collectionStore.currentCollection"
          class="text-h4 text-weight-bold text-grey-9"
        >
          Objetos em: {{ collectionStore.currentCollection.name }}
        </h1>
        <q-skeleton v-else type="text" class="text-h4" width="60%" />

        <q-input
          outlined
          v-model="searchQuery"
          placeholder="Pesquisar nesta coleção..."
          debounce="500"
          class="q-mt-md"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Estado de Carregamento dos Objetos -->
      <div v-if="objectStore.loading" class="row justify-center q-my-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <!-- Grid de Objetos -->
      <div v-else-if="filteredObjects.length > 0" class="row q-col-gutter-lg">
        <div
          v-for="obj in filteredObjects"
          :key="obj.id"
          class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card
            class="object-card cursor-pointer"
            flat
            bordered
            @click="onObjectClick(obj.id)"
          >
            <q-img :src="obj.image_url" :ratio="1" class="bg-grey-3">
              <template v-slot:error>
                <div
                  class="absolute-full flex flex-center bg-grey-4 text-white"
                >
                  Sem Imagem
                </div>
              </template>
            </q-img>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold ellipsis">
                {{ obj.titulo }}
              </div>
              <div class="text-body2 text-grey-7 ellipsis">{{ obj.autor }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Mensagem se não houver objetos -->
      <div v-else class="text-center q-my-xl">
        <q-icon name="inventory_2" size="4em" color="grey-5" />
        <p class="text-h6 text-grey-6 q-mt-md">
          {{
            searchQuery
              ? 'Nenhum objeto encontrado para sua busca.'
              : 'Nenhum objeto encontrado nesta coleção.'
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
import { useObjectStore } from 'stores/object-store';
import { useCollectionStore } from 'stores/collection-store'; // Importado
import { useRouter } from 'vue-router'; // Não se esqueça de importar
const router = useRouter(); // E instanciar

const props = defineProps({
  collectionId: {
    type: String,
    required: true,
  },
});

defineOptions({
  name: 'CollectionObjectsPage',
});

const searchQuery = ref('');
const objectStore = useObjectStore();
const collectionStore = useCollectionStore(); // Instanciado

// Computed property para filtrar objetos baseado na busca
const filteredObjects = computed(() => {
  if (!searchQuery.value.trim()) {
    return objectStore.objects;
  }

  const query = searchQuery.value.toLowerCase();
  return objectStore.objects.filter(
    (obj) =>
      obj.titulo.toLowerCase().includes(query) ||
      (obj.autor && obj.autor.toLowerCase().includes(query)) ||
      (obj.descricao && obj.descricao.toLowerCase().includes(query))
  );
});

function onObjectClick(objectId) {
  const encodedId = encodeURIComponent(objectId);
  router.push(`/acervo/objeto/${encodedId}`);
}

onMounted(() => {
  const decodedCollectionId = decodeURIComponent(props.collectionId);
  // Busca tanto os objetos quanto os detalhes da coleção
  objectStore.fetchObjectsByCollection(decodedCollectionId);
  collectionStore.selectCollection(decodedCollectionId);
});
</script>

<style lang="scss" scoped>
.object-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}
.object-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
