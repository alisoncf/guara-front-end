<template>
  <q-page class="q-pa-md">
    <div class="main-container">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Voltar para Coleções"
        to="/acervo"
        class="q-mb-md"
      />

      <div class="q-mb-xl">
        <h1 v-if="collection" class="text-h4 text-weight-bold text-grey-9">
          Objetos em: {{ collection.label }}
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

      <div v-if="loading" class="row justify-center q-my-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

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
            <q-img :src="obj.image_url || 'https://placehold.co/300x300/cccccc/ffffff?text=Sem+Imagem'" :ratio="1" class="bg-grey-3">
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-4 text-white">
                  Sem Imagem
                </div>
              </template>
            </q-img>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold ellipsis">
                {{ obj.titulo }}
              </div>
              <div class="text-body2 text-grey-7 ellipsis">{{ obj.resumo }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div v-else class="text-center q-my-xl">
        <q-icon name="inventory_2" size="4em" color="grey-5" />
        <p class="text-h6 text-grey-6 q-mt-md">
          {{
            searchQuery
              ? 'Nenhum objeto encontrado para sua busca.'
              : 'Nenhum objeto encontrado nesta coleção.'
          }}
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import { useClassStore } from 'stores/class-store';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

const props = defineProps({
  collectionId: { type: String, required: true },
});

defineOptions({
  name: 'CollectionObjectsPage',
});

const router = useRouter();
const objectStore = useDimensionalObjectStore();
const classStore = useClassStore();

const { objects, loading } = storeToRefs(objectStore);
const { classes } = storeToRefs(classStore);

const searchQuery = ref('');
const collection = ref(null);

const filteredObjects = computed(() => {
  if (!searchQuery.value.trim()) {
    // Filtra os objetos para mostrar apenas os da coleção correta
    return objects.value.filter(obj => obj.colecao === decodeURIComponent(props.collectionId));
  }
  const query = searchQuery.value.toLowerCase();
  return objects.value.filter(
    (obj) =>
      obj.colecao === decodeURIComponent(props.collectionId) &&
      (obj.titulo.toLowerCase().includes(query) ||
        (obj.resumo && obj.resumo.toLowerCase().includes(query)) ||
        (obj.descricao && obj.descricao.toLowerCase().includes(query)))
  );
});

function onObjectClick(objectId) {
  const encodedId = encodeURIComponent(objectId);
  router.push(`/acervo/objeto/${encodedId}`);
}

onMounted(async () => {
  const collectionUri = decodeURIComponent(props.collectionId);

  // Busca os detalhes da coleção para exibir o nome
  if (classes.value.length === 0) {
    await classStore.fetchAll();
  }
  collection.value = classes.value.find(c => c.uri === collectionUri);

  // Busca TODOS os objetos do repositório. O computed property fará o filtro.
  // Isso é eficiente se o usuário navega do acervo para cá.
  if (objectStore.objects.length === 0) {
    await objectStore.fetchAll();
  }
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
