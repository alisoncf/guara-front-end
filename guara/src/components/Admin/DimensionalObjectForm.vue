<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <div class="text-h6 q-mb-md q-mt-lg">Informações Básicas</div>

    <q-select
      v-model="form.tipo_uri"
      :options="dimensionTypeOptions"
      label="Tipo Dimensional *"
      outlined
      emit-value
      map-options
      :rules="[val => !!val || 'O tipo é obrigatório']"
      hint="Define a classificação principal do objeto (Pessoa, Lugar, etc.)"
    />

    <q-input
      v-model="form.titulo"
      label="Título *"
      outlined
      :rules="[val => !!val || 'Título é obrigatório']"
    />

    <q-input
      v-model="form.resumo"
      label="Resumo *"
      type="textarea"
      rows="3"
      outlined
      :rules="[val => !!val || 'Resumo é obrigatório']"
    />

    <div class="text-h6 q-mb-md q-mt-lg">Informações Adicionais</div>

    <q-input
      v-model="form.descricao"
      label="Descrição"
      type="textarea"
      rows="4"
      outlined
    />

    <q-input
      v-if="isPlace"
      v-model="form.coordenadas"
      label="Coordenadas Geográficas"
      outlined
      placeholder="-16.3285,-48.9534"
      hint="Formato: latitude,longitude"
    />

    <div class="row q-gutter-md q-mt-lg">
      <q-btn label="Cancelar" color="grey" flat @click="$emit('cancel')" :disable="loading" />
      <q-space />
      <q-btn :label="isEditing ? 'Atualizar Objeto' : 'Criar Objeto'" type="submit" color="primary" :loading="loading" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import apiConfig from 'src/config/apiConfig';

const props = defineProps({
  object: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['submit', 'cancel']);

const isEditing = computed(() => !!props.object);

const form = ref({
  tipo_uri: null,
  titulo: '',
  resumo: '',
  descricao: '',
  coordenadas: '',
});

// Opções para o select de tipo, baseadas na sua configuração central
const dimensionTypeOptions = Object.entries(apiConfig.dimensionTypes).map(([key, value]) => ({
  label: key,
  value: value
}));

// Computed property para mostrar o campo de coordenadas apenas se o tipo for "Lugar"
const isPlace = computed(() => form.value.tipo_uri === apiConfig.dimensionTypes.Lugar);

function handleSubmit() {
  const payload = { ...form.value };
  // Garante que não enviaremos coordenadas para objetos que não são do tipo Lugar
  if (!isPlace.value) {
    delete payload.coordenadas;
  }
  emit('submit', payload);
}

// Preenche o formulário quando estiver no modo de edição
watch(() => props.object, (newObject) => {
  if (newObject) {
    form.value = {
      tipo_uri: newObject.tipo_uri || null,
      titulo: newObject.titulo || '',
      resumo: newObject.resumo || '',
      descricao: newObject.descricao || '',
      coordenadas: newObject.coordenadas || '',
    };
  }
}, { immediate: true, deep: true });
</script>
