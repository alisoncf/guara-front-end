<template>
  <q-page class="q-pa-md">
    <div class="form-container">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="$router.push('/admin/collections')"
          class="q-mr-md"
        />
        <div>
          <h4 class="q-my-none">
            {{ isEditing ? 'Editar Coleção' : 'Nova Coleção' }}
          </h4>
          <p class="text-grey q-mt-sm q-mb-none">
            {{
              isEditing
                ? 'Modifique os dados da coleção'
                : 'Crie uma nova coleção no sistema'
            }}
          </p>
        </div>
      </div>

      <q-card>
        <q-card-section v-if="pageLoading" class="text-center">
          <q-spinner-dots size="40px" color="primary" />
          <p class="q-mt-sm">Carregando dados da coleção...</p>
        </q-card-section>
        <q-card-section v-else>
          <CollectionForm
            :collection="collectionToEdit"
            :loading="loading"
            @submit="handleSubmit"
            @cancel="$router.push('/admin/collections')"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClassStore } from 'stores/class-store';
import { Notify } from 'quasar';
import { storeToRefs } from 'pinia';
import CollectionForm from 'components/Admin/CollectionForm.vue'; // Importa o novo componente

const route = useRoute();
const router = useRouter();
const classStore = useClassStore();

const { classes, loading } = storeToRefs(classStore);
const pageLoading = ref(false);
const collectionToEdit = ref(null);

const isEditing = computed(() => !!route.params.id);

async function loadCollectionForEdit() {
  if (!isEditing.value) return;
  pageLoading.value = true;
  try {
    const collectionUri = decodeURIComponent(route.params.id);
    if (classes.value.length === 0) await classStore.fetchAll();
    const collection = classes.value.find(c => c.uri === collectionUri);
    if (collection) {
      collectionToEdit.value = {
        label: collection.label || '',
        comment: collection.description || '',
        subclassof_localname: collection.subclassOf ? collection.subclassOf.split('#').pop().split('/').pop() : '',
      };
    } else {
      Notify.create({ type: 'negative', message: 'Coleção não encontrada.' });
      router.push('/admin/collections');
    }
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Erro ao carregar coleção: ' + error.message });
  } finally {
    pageLoading.value = false;
  }
}

async function handleSubmit(formData) {
  try {
    let success = false;
    if (isEditing.value) {
      const collectionUri = decodeURIComponent(route.params.id);
      success = await classStore.update({
        class_uri: collectionUri,
        new_label: formData.label,
        new_comment: formData.comment,
        new_subclassof_localname: formData.subclassof_localname,
      });
    } else {
      success = await classStore.create(formData);
    }

    if (success) {
      router.push('/admin/collections');
    } else {
      Notify.create({ type: 'negative', message: 'Falha ao salvar a coleção.' });
    }
  } catch (error) {
    // A notificação de erro já é tratada pela store/interceptor
  }
}

onMounted(() => {
  loadCollectionForEdit();
});
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
