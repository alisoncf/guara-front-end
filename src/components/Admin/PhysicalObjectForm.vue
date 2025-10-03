<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <q-select
      v-model="form.colecao_id"
      :options="collectionOptions"
      label="Selecionar Coleção *"
      outlined
      :rules="[(val) => !!val || 'Coleção é obrigatória']"
      :loading="loadingCollections"
      emit-value
      map-options
      hint="O objeto pertencerá a esta coleção."
    />

    <div class="text-h6 q-mb-md q-mt-lg">Informações Básicas</div>
    <q-input
      v-model="form.titulo"
      label="Título *"
      outlined
      :rules="[(val) => !!val || 'Título é obrigatório']"
    />
    <q-input
      v-model="form.resumo"
      label="Resumo (Assunto) *"
      type="textarea"
      rows="3"
      outlined
      :rules="[(val) => !!val || 'Resumo é obrigatório']"
      hint="Um resumo conciso do objeto. Mapeado para dc:subject."
    />

    <q-input
      v-model="form.descricao"
      label="Descrição"
      type="textarea"
      rows="4"
      outlined
      class="q-mt-md"
      hint="Descrição mais detalhada. Mapeado para dc:description."
    />

    <q-select
      v-model="form.tipoFisicoAbreviado"
      :options="collectionOptions"
      label="Tipos Físicos"
      multiple
      outlined
      use-chips
      stack-label
      emit-value
      map-options
      class="q-mt-md"
      hint="Classifique o objeto em um ou mais tipos (ex: Mobiliário, Documento)."
    />

    <div class="row q-gutter-md q-mt-lg">
      <q-btn
        label="Cancelar"
        color="grey"
        flat
        @click="$emit('cancel')"
        class="col-auto"
        :disable="loading"
      />
      <q-space />
      <q-btn
        :label="isEditing ? 'Atualizar Objeto' : 'Criar Objeto'"
        type="submit"
        color="primary"
        :loading="loading"
        class="col-auto"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useClassStore } from 'stores/class-store';
import { Notify } from 'quasar';
import { storeToRefs } from 'pinia';

const props = defineProps({
  object: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['submit', 'cancel']);

const classStore = useClassStore();
const { classes: collections, loading: loadingCollections } = storeToRefs(classStore);

const isEditing = computed(() => !!props.object);

const collectionOptions = computed(() => {
  // O option-value será o nome local da classe (ex: "Fotografia")
  // O option-label será o nome legível (ex: "Fotografia")
  return collections.value.map((col) => ({
    label: col.label || col.uri.split('#').pop(),
    value: col.uri.split('#').pop(),
  }));
});

const form = ref({
  colecao_id: null,
  titulo: '',
  resumo: '',
  descricao: '',
  tipoFisicoAbreviado: [],
});

function handleSubmit() {
  // Emite o formulário no formato esperado pela `physicalObjectStore`
  emit('submit', { ...form.value });
}

// Observa o objeto passado por props para preencher o formulário no modo de edição
watch(
  () => props.object,
  (newObject) => {
    if (newObject) {
      form.value = {
        // O ID da coleção é o nome local da classe/URI
        colecao_id: newObject.colecao ? newObject.colecao.split('#').pop() : null,
        titulo: newObject.titulo || '',
        resumo: newObject.resumo || '',
        descricao: newObject.descricao || '',
        // Os tipos físicos também são os nomes locais
        tipoFisicoAbreviado: newObject.tiposFisicos || [],
      };
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  // Carrega as coleções (classes) se ainda não estiverem na store
  if (collections.value.length === 0) {
    classStore.fetchAll();
  }
});
</script>
