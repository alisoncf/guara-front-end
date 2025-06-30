<template>
  <q-page class="q-pa-md">
    <div class="form-container">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="$router.go(-1)"
          class="q-mr-md"
        />
        <div>
          <h4 class="q-my-none">
            {{ isEditing ? 'Editar Objeto' : 'Novo Objeto' }}
          </h4>
          <p class="text-grey q-mt-sm q-mb-none">
            {{
              isEditing
                ? 'Modifique os dados do objeto'
                : 'Crie um novo objeto no sistema'
            }}
          </p>
        </div>
      </div>

      <q-card>
        <q-card-section>
          <ObjectForm
            :object="object"
            :loading="loading"
            @submit="handleSubmit"
            @cancel="$router.go(-1)"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useObjectStore } from 'stores/object-store';
import { Notify } from 'quasar';
import ObjectForm from 'components/Admin/ObjectForm.vue';

const route = useRoute();
const router = useRouter();
const objectStore = useObjectStore();

// Estado
const loading = ref(false);
const object = ref(null);

// Computed
const isEditing = computed(() => !!route.params.id);

// Métodos
async function loadObject() {
  if (!isEditing.value) return;

  loading.value = true;
  try {
    const data = await objectStore.getObject(route.params.id);
    object.value = data;
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar objeto: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

async function handleSubmit(objectData) {
  loading.value = true;
  try {
    if (isEditing.value) {
      await objectStore.updateObject(route.params.id, objectData);
      Notify.create({
        type: 'positive',
        message: 'Objeto atualizado com sucesso!',
      });
    } else {
      await objectStore.createObject(objectData);
      Notify.create({
        type: 'positive',
        message: 'Objeto criado com sucesso!',
      });
    }

    router.push('/admin/objects');
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao salvar objeto: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  await loadObject();
});
</script>

<style scoped>
.form-container {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 32px;
  padding-left: 32px;
  padding-right: 32px;
}

.q-card {
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .form-container {
    max-width: 100%;
    padding-left: 8px;
    padding-right: 8px;
  }
}
</style>
