<template>
  <q-page class="q-pa-md">
    <div class="main-container">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Voltar"
        @click="$router.go(-1)"
        class="q-mb-md"
      />

      <div v-if="loading" class="q-my-xl">
        <q-card flat>
          <div class="row q-col-gutter-lg">
            <div class="col-12">
              <q-skeleton type="text" class="text-h4" width="70%" /><q-skeleton
              type="text"
              class="text-subtitle1"
              width="40%"
            />
              <q-skeleton type="text" height="150px" class="q-mt-lg" />
            </div>
          </div>
        </q-card>
      </div>

      <ObjectDetails v-else-if="object" :object="object" />

      <div v-else class="text-center q-my-xl">
        <q-icon name="error_outline" size="4em" color="grey-5" />
        <p class="text-h6 text-grey-6 q-mt-md">
          Não foi possível carregar os detalhes deste objeto.
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import { storeToRefs } from 'pinia';
import ObjectDetails from 'components/public/ObjectDetails.vue'; // Importa o novo componente

const props = defineProps({
  objectId: { type: String, required: true },
});

defineOptions({
  name: 'ObjectDetailsPage',
});

const route = useRoute();
const objectStore = useDimensionalObjectStore();

const { objects, loading } = storeToRefs(objectStore);
const object = ref(null);

onMounted(async () => {
  const objectUri = decodeURIComponent(props.objectId);

  // Se os objetos não estiverem na store, busca todos.
  if (objects.value.length === 0) {
    await objectStore.fetchAll();
  }

  // Encontra o objeto específico na lista
  object.value = objects.value.find(obj => obj.id === objectUri) || null;
});
</script>
