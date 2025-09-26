<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        @click="$router.go(-1)"
        class="q-mr-md"
      />
      <div>
        <h4 class="q-my-none">Visualizar Objeto</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Detalhes do objeto selecionado
        </p>
      </div>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm">Carregando objeto...</div>
    </div>

    <div v-else-if="object" class="row q-col-gutter-lg">
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">{{ object.titulo }}</div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-grey">Resumo</div>
              <p class="text-body1">{{ object.resumo || 'Não disponível' }}</p>
            </div>

            <div v-if="object.descricao" class="q-mb-md">
              <div class="text-subtitle2 text-grey">Descrição</div>
              <p class="text-body1">{{ object.descricao }}</p>
            </div>

            <q-separator class="q-my-lg" />

            <div class="text-h6 q-mb-md">Detalhes</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey">Tipo Dimensional</div>
                <div>{{ object.tipo || 'Não informado' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey">Coleção</div>
                <q-chip v-if="object.colecao" :label="object.colecao.split('#').pop()" color="primary" text-color="white" size="sm" />
                <div v-else>Não informada</div>
              </div>
              <div class="col-12" v-if="object.tiposFisicos && object.tiposFisicos.length > 0">
                <div class="text-subtitle2 text-grey">Tipos Físicos</div>
                <div>
                  <q-chip v-for="tipo in object.tiposFisicos" :key="tipo" :label="tipo.split('#').pop()" color="secondary" text-color="white" size="sm" class="q-mr-sm" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Ações</div>
            <div class="q-gutter-sm">
              <q-btn label="Editar Objeto" icon="edit" color="primary" class="full-width" @click="$router.push(`/admin/objects/edit/${encodedId}`)" />
              <q-btn label="Gerenciar Relações" icon="link" color="secondary" class="full-width" @click="$router.push(`/admin/objects/${encodedId}/relations`)" />
              <q-btn label="Excluir Objeto" icon="delete" color="negative" class="full-width" @click="confirmDelete" />
            </div>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Informações do Sistema</div>
            <div class="q-gutter-y-sm">
              <div>
                <div class="text-subtitle2 text-grey">URI do Objeto</div>
                <div class="text-caption" style="word-break: break-all;">{{ object.id }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else class="text-center q-pa-lg text-grey">
      <q-icon name="error_outline" size="48px" />
      <p>Objeto não encontrado ou não foi possível carregar os dados.</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDimensionalObjectStore } from 'stores/dimensional-object-store';
import { usePhysicalObjectStore } from 'stores/physical-object-store';
import { Notify, Dialog } from 'quasar';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const objectStore = useDimensionalObjectStore();
const physicalObjectStore = usePhysicalObjectStore();

const { objects, loading: loadingObjects } = storeToRefs(objectStore);
const loading = ref(false);
const object = ref(null);

const encodedId = computed(() => encodeURIComponent(object.value?.id || ''));

async function loadData() {
  loading.value = true;
  try {
    const objectUri = decodeURIComponent(route.params.id);

    // Se a lista de objetos está vazia, busca todos.
    // Numa aplicação maior, poderíamos ter uma action para buscar um único objeto.
    if (objects.value.length === 0) {
      await objectStore.fetchAll();
    }

    // Encontra o objeto na lista da store.
    object.value = objects.value.find(obj => obj.id === objectUri) || null;

    if (!object.value) {
      Notify.create({ type: 'negative', message: 'Objeto não encontrado' });
    }
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Erro ao carregar dados do objeto: ' + error.message });
  } finally {
    loading.value = false;
  }
}

function confirmDelete() {
  Dialog.create({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir o objeto <strong>"${object.value?.titulo}"</strong>?`,
    html: true,
    cancel: true,
  }).onOk(deleteObject);
}

async function deleteObject() {
  if (!object.value) return;

  const success = await physicalObjectStore.remove(object.value.id);
  if (success) {
    router.push('/admin/objects');
  }
}

onMounted(() => {
  loadData();
});
</script>
