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
          <h4 class="q-my-none">Novo Objeto Físico</h4>
          <p class="text-grey q-mt-sm q-mb-none">
            Crie um novo objeto físico no repositório
            <strong>{{ repositoryStore.currentRepository?.nome }}</strong>
          </p>
        </div>
      </div>

      <q-card>
        <q-card-section>
          <PhysicalObjectForm
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
import { useRouter } from 'vue-router';
import { usePhysicalObjectStore } from 'stores/physical-object-store';
import { useRepositoryStore } from 'stores/repository-store';
import PhysicalObjectForm from 'components/Admin/PhysicalObjectForm.vue';
import { storeToRefs } from 'pinia';

const router = useRouter();
const physicalObjectStore = usePhysicalObjectStore();
const repositoryStore = useRepositoryStore();

const { loading } = storeToRefs(physicalObjectStore);

async function handleSubmit(objectData) {
  const success = await physicalObjectStore.create(objectData);
  if (success) {
    router.push('/admin/objects');
  }
}
</script>

<style scoped>
.form-container {
  max-width: 900px;
  margin: 0 auto;
}
</style>
