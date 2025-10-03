<template>
  <q-page class="q-pa-md">
    <div class="form-container">
      <div class="row items-center q-mb-lg">
        <q-btn flat round icon="arrow_back" @click="$router.push('/admin/objects')" class="q-mr-md" />
        <div>
          <h4 class="q-my-none">Editar Objeto Dimensional</h4>
          <p class="text-grey q-mt-sm q-mb-none">Modifique os dados do objeto selecionado.</p>
        </div>
      </div>
      <q-card>
        <q-card-section v-if="pageLoading || !objectToEdit" class="text-center">
          <q-spinner-dots color="primary" size="40px" />
          <p>Carregando objeto...</p>
        </q-card-section>
        <q-card-section v-else>
          <DimensionalObjectForm :object="objectToEdit" :loading="loading" @submit="handleSubmit" @cancel="$router.push('/admin/objects')" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import { Notify } from 'quasar';
import DimensionalObjectForm from 'components/Admin/DimensionalObjectForm.vue';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const dimensionalObjectStore = useDimensionalObjectStore();
const { objects, loading } = storeToRefs(dimensionalObjectStore);
const objectToEdit = ref(null);
const pageLoading = ref(false);

async function loadObject() {
  pageLoading.value = true;
  try {
    const objectUri = decodeURIComponent(route.params.id);
    if (objects.value.length === 0) await dimensionalObjectStore.fetchAll();
    const foundObject = objects.value.find(obj => obj.id === objectUri);
    if (foundObject) {
      objectToEdit.value = foundObject;
    } else {
      Notify.create({ type: 'negative', message: 'Objeto não encontrado.' });
      router.push('/admin/objects');
    }
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Erro ao carregar objeto: ' + error.message });
  } finally {
    pageLoading.value = false;
  }
}

async function handleSubmit(objectData) {
  const objectUri = decodeURIComponent(route.params.id);
  const payload = { object_uri_to_update: objectUri, ...objectData };
  const success = await dimensionalObjectStore.update(payload);
  if (success) {
    await dimensionalObjectStore.fetchAll();
    router.push('/admin/objects');
  }
}

onMounted(() => loadObject());
</script>

<style scoped>.form-container { max-width: 900px; margin: 0 auto; }</style>
