<template>
  <q-page class="q-pa-md">
    <div class="form-container">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="$router.push('/admin/objects')"
          class="q-mr-md"
        />
        <div>
          <h4 class="q-my-none">Editar Objeto Físico</h4>
          <p class="text-grey q-mt-sm q-mb-none">
            Modifique os dados do objeto selecionado
          </p>
        </div>
      </div>

      <q-card>
        <q-card-section v-if="pageLoading" class="text-center">
          <q-spinner-dots color="primary" size="40px" />
          <p>Carregando objeto...</p>
        </q-card-section>
        <q-card-section v-else>
          <PhysicalObjectForm
            :object="objectToEdit"
            :loading="loading"
            @submit="handleSubmit"
            @cancel="$router.push('/admin/objects')"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import { usePhysicalObjectStore } from 'stores/physical-object-store';
import { Notify } from 'quasar';
import PhysicalObjectForm from 'components/Admin/PhysicalObjectForm.vue';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const objectStore = useDimensionalObjectStore(); // Para buscar dados
const physicalObjectStore = usePhysicalObjectStore(); // Para atualizar

const { objects, loading: loadingObjects } = storeToRefs(objectStore);
const { loading: loadingPhysical } = storeToRefs(physicalObjectStore);

const objectToEdit = ref(null);
const pageLoading = ref(false);

const loading = computed(() => loadingObjects.value || loadingPhysical.value);

async function loadObject() {
  pageLoading.value = true;
  try {
    const objectUri = decodeURIComponent(route.params.id);

    // Se os objetos ainda não foram carregados, busca todos
    if (objects.value.length === 0) {
      await objectStore.fetchAll();
    }

    // Encontra o objeto na lista
    const foundObject = objects.value.find(obj => obj.id === objectUri);

    if (foundObject) {
      objectToEdit.value = foundObject;
    } else {
      Notify.create({ type: 'negative', message: 'Objeto não encontrado.' });
      router.push('/admin/objects');
    }
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Erro ao carregar objeto: ' + (error.message || error) });
  } finally {
    pageLoading.value = false;
  }
}

async function handleSubmit(objectData) {
  const objectUri = decodeURIComponent(route.params.id);

  const payload = {
    object_uri_to_update: objectUri,
    ...objectData
  };

  const success = await physicalObjectStore.update(payload);

  if (success) {
    // Atualiza a lista geral para refletir a mudança
    await objectStore.fetchAll();
    router.push('/admin/objects');
  }
}

onMounted(() => {
  loadObject();
});
</script>

<style scoped>
.form-container {
  max-width: 900px;
  margin: 0 auto;
}
</style>
