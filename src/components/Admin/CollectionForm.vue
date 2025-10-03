<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <div class="text-h6 q-mb-md">Informações Básicas</div>

    <q-input
      v-model="form.label"
      label="Nome da Coleção (Label) *"
      outlined
      :rules="[(val) => !!val || 'Nome é obrigatório']"
      hint="Nome legível que aparecerá para os usuários."
    />

    <q-input
      v-model="form.comment"
      label="Descrição (Comment) *"
      type="textarea"
      rows="3"
      outlined
      :rules="[(val) => !!val || 'Descrição é obrigatória']"
      hint="Descrição detalhada sobre o que esta coleção representa."
    />

    <q-input
      v-model="form.subclassof_localname"
      label="Superclasse (Nome Local) *"
      outlined
      :rules="[(val) => !!val || 'Superclasse é obrigatória']"
      hint="Nome da classe pai, sem a URI base. Ex: ObjetoFisico, Documento."
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
        :label="isEditing ? 'Atualizar' : 'Criar'"
        type="submit"
        color="primary"
        :loading="loading"
        class="col-auto"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  collection: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['submit', 'cancel']);

const isEditing = computed(() => !!props.collection);

const form = ref({
  label: '',
  comment: '',
  subclassof_localname: '',
});

function handleSubmit() {
  emit('submit', { ...form.value });
}

// Observa o objeto passado por props para preencher o formulário no modo de edição
watch(
  () => props.collection,
  (newCollection) => {
    if (newCollection) {
      form.value = {
        label: newCollection.label || '',
        comment: newCollection.comment || '',
        subclassof_localname: newCollection.subclassof_localname || '',
      };
    }
  },
  { immediate: true, deep: true }
);
</script>
