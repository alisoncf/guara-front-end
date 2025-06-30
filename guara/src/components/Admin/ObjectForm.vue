<template>
  <q-form @submit="handleSubmit" class="q-gutter-md">
    <!-- Seleção de coleção -->
    <div class="text-h6 q-mb-md">Coleção *</div>
    <q-select
      v-model="form.collectionId"
      :options="collectionOptions"
      label="Selecionar Coleção"
      outlined
      :rules="[(val) => !!val || 'Coleção é obrigatória']"
      :loading="loadingCollections"
      required
      option-value="local_id"
      option-label="label"
      emit-value
    />

    <!-- Campos obrigatórios -->
    <div class="text-h6 q-mb-md q-mt-lg">Informações Básicas</div>
    <q-input
      v-model="form.titulo"
      label="Título *"
      outlined
      :rules="[(val) => !!val || 'Título é obrigatório']"
      required
    />
    <q-input
      v-model="form.resumo"
      label="Resumo *"
      type="textarea"
      rows="3"
      outlined
      :rules="[(val) => !!val || 'Resumo é obrigatório']"
      required
    />

    <!-- Botão para mostrar campos avançados -->
    <q-btn
      flat
      color="primary"
      :label="
        showAdvanced ? 'Ocultar campos avançados' : 'Mostrar campos avançados'
      "
      @click="showAdvanced = !showAdvanced"
      class="q-mt-md"
    />

    <!-- Campos opcionais -->
    <q-slide-transition>
      <div v-if="showAdvanced" class="q-mt-md">
        <q-input
          v-model="form.descricao"
          label="Descrição"
          type="textarea"
          rows="4"
          outlined
        />
        <q-input
          v-model="mediaInput"
          label="Adicionar mídia (URL)"
          outlined
          @keyup.enter="addMedia"
        />
        <div class="q-mb-md">
          <q-chip
            v-for="(media, idx) in form.associatedMedia"
            :key="media + idx"
            removable
            @remove="removeMedia(idx)"
            class="q-mr-sm"
          >
            {{ media }}
          </q-chip>
        </div>
        <q-input
          v-model="tipoFisicoInput"
          label="Adicionar tipo físico abreviado"
          outlined
          @keyup.enter="addTipoFisico"
        />
        <div class="q-mb-md">
          <q-chip
            v-for="(tipo, idx) in form.tipoFisicoAbreviado"
            :key="tipo + idx"
            removable
            @remove="removeTipoFisico(idx)"
            class="q-mr-sm"
          >
            {{ tipo }}
          </q-chip>
        </div>
        <q-input
          v-model="relacaoInput"
          label="Adicionar relação (URI)"
          outlined
          @keyup.enter="addRelacao"
        />
        <div class="q-mb-md">
          <q-chip
            v-for="(rel, idx) in form.temRelacao"
            :key="rel + idx"
            removable
            @remove="removeRelacao(idx)"
            class="q-mr-sm"
          >
            {{ rel }}
          </q-chip>
        </div>
      </div>
    </q-slide-transition>

    <!-- Botões de ação -->
    <div class="row q-gutter-md q-mt-lg">
      <q-btn
        label="Cancelar"
        color="grey"
        @click="$emit('cancel')"
        class="col-auto"
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
import { ref, computed, onMounted, watch } from 'vue';
import { useCollectionStore } from 'stores/collection-store';
import { Notify } from 'quasar';

const props = defineProps({
  object: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['submit', 'cancel']);
const collectionStore = useCollectionStore();
const loadingCollections = ref(false);
const collections = ref([]);
const isEditing = computed(() => !!props.object);
const showAdvanced = ref(false);

const collectionOptions = computed(() => {
  return collections.value.map((col) => ({
    label: col.name,
    local_id: col.local_id,
    repository_update_url: col.repository_update_url,
    repository_base_uri: col.repository_base_uri,
  }));
});

const form = ref({
  collectionId: '',
  titulo: '',
  resumo: '',
  descricao: '',
  associatedMedia: [],
  tipoFisicoAbreviado: [],
  temRelacao: [],
});

const mediaInput = ref('');
const tipoFisicoInput = ref('');
const relacaoInput = ref('');

function addMedia() {
  if (
    mediaInput.value &&
    !form.value.associatedMedia.includes(mediaInput.value)
  ) {
    form.value.associatedMedia.push(mediaInput.value);
    mediaInput.value = '';
  }
}
function removeMedia(idx) {
  form.value.associatedMedia.splice(idx, 1);
}
function addTipoFisico() {
  if (
    tipoFisicoInput.value &&
    !form.value.tipoFisicoAbreviado.includes(tipoFisicoInput.value)
  ) {
    form.value.tipoFisicoAbreviado.push(tipoFisicoInput.value);
    tipoFisicoInput.value = '';
  }
}
function removeTipoFisico(idx) {
  form.value.tipoFisicoAbreviado.splice(idx, 1);
}
function addRelacao() {
  if (
    relacaoInput.value &&
    !form.value.temRelacao.includes(relacaoInput.value)
  ) {
    form.value.temRelacao.push(relacaoInput.value);
    relacaoInput.value = '';
  }
}
function removeRelacao(idx) {
  form.value.temRelacao.splice(idx, 1);
}

async function loadCollections() {
  loadingCollections.value = true;
  try {
    const data = await collectionStore.fetchCollections();
    collections.value = data;
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar coleções: ' + error.message,
    });
  } finally {
    loadingCollections.value = false;
  }
}

function handleSubmit() {
  // Busca a coleção selecionada para pegar os campos técnicos
  const selectedCol = collectionOptions.value.find(
    (col) => col.local_id === form.value.collectionId
  );
  // Log para depuração
  console.log('collectionId:', form.value.collectionId);
  console.log('collectionOptions:', collectionOptions.value);
  if (!selectedCol) {
    Notify.create({
      type: 'negative',
      message: 'Selecione uma coleção válida.',
    });
    return;
  }
  const objectData = {
    titulo: form.value.titulo,
    resumo: form.value.resumo,
    collectionId: form.value.collectionId,
    repository_update_url: selectedCol.repository_update_url,
    repository_base_uri: selectedCol.repository_base_uri,
    descricao: form.value.descricao || undefined,
    associatedMedia: form.value.associatedMedia.length
      ? form.value.associatedMedia
      : undefined,
    tipoFisicoAbreviado: form.value.tipoFisicoAbreviado.length
      ? form.value.tipoFisicoAbreviado
      : undefined,
    temRelacao: form.value.temRelacao.length
      ? form.value.temRelacao
      : undefined,
  };
  emit('submit', objectData);
}

watch(
  () => props.object,
  (newObject) => {
    if (newObject) {
      // Garante que collectionId é sempre a URI (caso venha só o nome, tenta mapear)
      let collectionId = '';
      if (newObject.colecao_id && typeof newObject.colecao_id === 'string') {
        // Se já for URI
        collectionId = newObject.colecao_id;
      } else if (newObject.collectionId) {
        // Se vier só o nome curto, tenta mapear para a URI
        const found = collections.value.find(
          (col) =>
            col.name === newObject.collectionId ||
            col.id === newObject.collectionId
        );
        collectionId = found ? found.id : '';
      }
      form.value = {
        collectionId: collectionId,
        titulo: newObject.titulo || '',
        resumo: newObject.resumo || '',
        descricao: newObject.descricao || '',
        associatedMedia: newObject.associatedMedia
          ? [...newObject.associatedMedia]
          : [],
        tipoFisicoAbreviado: newObject.tipoFisicoAbreviado
          ? [...newObject.tipoFisicoAbreviado]
          : [],
        temRelacao: newObject.temRelacao ? [...newObject.temRelacao] : [],
      };
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await loadCollections();
});
</script>
