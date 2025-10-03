<template>
  <q-page class="q-pa-md">
    <div class="form-container">
      <div class="row items-center q-mb-lg">
        <q-btn flat round icon="arrow_back" @click="$router.push('/admin/objects')" class="q-mr-md" />
        <div>
          <h4 class="q-my-none">Novo Objeto Dimensional</h4>
          <p class="text-grey q-mt-sm q-mb-none">Crie uma nova Pessoa, Lugar, Evento ou Tempo.</p>
        </div>
      </div>
      <q-card>
        <q-card-section>
          <DimensionalObjectForm :loading="loading" @submit="handleSubmit" @cancel="$router.push('/admin/objects')" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import DimensionalObjectForm from 'components/Admin/DimensionalObjectForm.vue';
import { storeToRefs } from 'pinia';

const router = useRouter();
const dimensionalObjectStore = useDimensionalObjectStore();
const { loading } = storeToRefs(dimensionalObjectStore);

async function handleSubmit(objectData) {
  const success = await dimensionalObjectStore.create(objectData);
  if (success) {
    router.push('/admin/objects');
  }
}
</script>

<style scoped>.form-container { max-width: 900px; margin: 0 auto; }</style>
