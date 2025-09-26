<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" @click="$router.push('/admin/objects')" class="q-mr-md" />
      <div>
        <h4 class="q-my-none">Gerenciar Relações</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Objeto: <strong>{{ objectToEdit?.titulo || 'Carregando...' }}</strong>
        </p>
      </div>
    </div>

    <div v-if="pageLoading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <div v-else-if="objectToEdit" class="row q-col-gutter-lg">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Relações Existentes</div>
              <q-btn color="primary" icon="add" label="Adicionar Relação" @click="showAddDialog = true" />
            </div>

            <q-table
              :rows="relations"
              :columns="columns"
              row-key="id"
              :loading="loadingRelations"
              flat
              bordered
            >
              <template v-slot:body-cell-value="props">
                <q-td :props="props">
                  <div v-if="props.row.valueType === 'uri'">
                    <a :href="props.row.value" target="_blank" class="text-primary">{{ props.row.valueTitle || props.row.value }}</a>
                    <q-tooltip>{{ props.row.value }}</q-tooltip>
                  </div>
                  <div v-else>{{ props.row.value }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)" />
                </q-td>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-lg text-grey">
                  <q-icon name="link_off" size="48px" />
                  <div class="q-mt-sm">Este objeto ainda não possui relações.</div>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Adicionar Nova Relação</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleAddRelation" class="q-gutter-md">
            <q-input v-model="newRelation.predicado_uri" label="Predicado (URI da Propriedade) *" outlined :rules="[val => !!val || 'O predicado é obrigatório']" />

            <q-select v-model="newRelation.tipo_valor_objeto" :options="['URI', 'Literal']" label="Tipo do Objeto/Valor *" outlined :rules="[val => !!val || 'O tipo é obrigatório']" />

            <q-select
              v-if="newRelation.tipo_valor_objeto === 'URI'"
              v-model="newRelation.valor_objeto"
              :options="availableObjectsOptions"
              label="Objeto (Recurso) Relacionado *"
              outlined
              use-input
              @filter="filterObjects"
              :rules="[val => !!val || 'O objeto é obrigatório']"
            >
              <template v-slot:no-option>
                <q-item><q-item-section class="text-grey">Nenhum objeto encontrado</q-item-section></q-item>
              </template>
            </q-select>

            <q-input v-else v-model="newRelation.valor_objeto" label="Valor (Literal) *" outlined :rules="[val => !!val || 'O valor é obrigatório']" />

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="grey" v-close-popup />
              <q-btn label="Adicionar" type="submit" color="primary" :loading="loadingRelations" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useRelationStore } from 'stores/relation-store';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import { Notify, Dialog } from 'quasar';
import { storeToRefs } from 'pinia';

const route = useRoute();
const relationStore = useRelationStore();
const objectStore = useDimensionalObjectStore();

const { relations, loading: loadingRelations } = storeToRefs(relationStore);
const { objects } = storeToRefs(objectStore);

const objectToEdit = ref(null);
const pageLoading = ref(false);
const showAddDialog = ref(false);
const availableObjectsOptions = ref([]);

const newRelation = ref({
  predicado_uri: '',
  valor_objeto: '',
  tipo_valor_objeto: 'URI',
});

const columns = [
  { name: 'property', label: 'Propriedade (Predicado)', field: 'property', align: 'left', format: val => val.split('#').pop() },
  { name: 'value', label: 'Valor (Objeto)', field: 'value', align: 'left' },
  { name: 'valueType', label: 'Tipo', field: 'valueType', align: 'left' },
  { name: 'actions', label: 'Ações', align: 'center' },
];

async function loadData() {
  pageLoading.value = true;
  try {
    const objectUri = decodeURIComponent(route.params.id);

    // Busca as relações do objeto atual
    await relationStore.fetchRelations(objectUri);

    // Busca todos os objetos para o seletor (se não estiverem carregados)
    if (objects.value.length === 0) {
      await objectStore.fetchAll();
    }

    // Encontra o objeto principal para exibir seu título
    objectToEdit.value = objects.value.find(obj => obj.id === objectUri) || null;

  } catch (error) {
    Notify.create({ type: 'negative', message: 'Erro ao carregar dados: ' + error.message });
  } finally {
    pageLoading.value = false;
  }
}

async function handleAddRelation() {
  const payload = {
    predicado_uri: newRelation.value.predicado_uri,
    valor_objeto: newRelation.value.valor_objeto.value || newRelation.value.valor_objeto, // Pega o .value se for um objeto do q-select
    tipo_valor_objeto: newRelation.value.tipo_valor_objeto,
  };
  const success = await relationStore.addRelation(payload);
  if (success) {
    showAddDialog.value = false;
    newRelation.value = { predicado_uri: '', valor_objeto: '', tipo_valor_objeto: 'URI' };
  }
}

function confirmDelete(relation) {
  Dialog.create({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja remover esta relação?`,
    cancel: true,
  }).onOk(() => relationStore.removeRelation(relation));
}

// Filtro para o q-select de objetos
function filterObjects(val, update) {
  if (val === '') {
    update(() => {
      availableObjectsOptions.value = objects.value
        .filter(obj => obj.id !== objectToEdit.value.id) // Não relacionar com ele mesmo
        .map(obj => ({ label: obj.titulo, value: obj.id }));
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    availableObjectsOptions.value = objects.value
      .filter(obj => obj.id !== objectToEdit.value.id && obj.titulo.toLowerCase().indexOf(needle) > -1)
      .map(obj => ({ label: obj.titulo, value: obj.id }));
  });
}

onMounted(() => {
  loadData();
});
</script>
