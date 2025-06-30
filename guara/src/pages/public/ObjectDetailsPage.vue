<template>
  <q-page class="q-pa-md">
    <div class="main-container">
      <!-- Botão Voltar -->
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Voltar"
        @click="$router.go(-1)"
        class="q-mb-md"
      />

      <!-- Estado de Carregamento -->
      <div v-if="objectStore.loading" class="q-my-xl">
        <q-card flat>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-8">
              <q-skeleton type="text" class="text-h4" /><q-skeleton
                type="text"
                height="200px"
                class="q-mt-md"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-skeleton height="300px" square />
            </div>
          </div>
        </q-card>
      </div>

      <!-- Conteúdo da Página -->
      <div v-else-if="objectStore.currentObject">
        <div class="row q-col-gutter-xl">
          <!-- Coluna Esquerda: Detalhes -->
          <!-- A classe agora é dinâmica: ocupa 100% da largura se não houver imagem -->
          <div
            :class="
              objectStore.currentObject.image_url ? 'col-12 col-md-8' : 'col-12'
            "
          >
            <h1 class="text-h4 text-weight-bold">
              {{ objectStore.currentObject.titulo }}
            </h1>
            <p
              v-if="objectStore.currentObject.autor"
              class="text-subtitle1 text-grey-7"
            >
              Por {{ objectStore.currentObject.autor
              }}<span v-if="objectStore.currentObject.data"
                >, {{ objectStore.currentObject.data }}</span
              >
            </p>

            <div class="q-mt-lg">
              <h5 class="text-h5 text-weight-medium">Descrição</h5>
              <p class="text-body1 q-mt-sm" style="text-align: justify">
                {{
                  objectStore.currentObject.descricao ||
                  'Nenhuma descrição disponível.'
                }}
              </p>
            </div>

            <!-- Propriedades específicas se disponíveis -->
            <div v-if="hasSpecificProperties" class="q-mt-xl">
              <h5 class="text-h5 text-weight-medium">Detalhes</h5>
              <q-list bordered separator class="q-mt-sm rounded-borders">
                <q-item v-if="objectStore.currentObject.tipo">
                  <q-item-section>
                    <q-item-label caption>Tipo</q-item-label>
                    <q-item-label>{{
                      objectStore.currentObject.tipo
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="objectStore.currentObject.dimensoes">
                  <q-item-section>
                    <q-item-label caption>Dimensões</q-item-label>
                    <q-item-label>{{
                      objectStore.currentObject.dimensoes
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="objectStore.currentObject.material">
                  <q-item-section>
                    <q-item-label caption>Material</q-item-label>
                    <q-item-label>{{
                      objectStore.currentObject.material
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="objectStore.currentObject.estado_conservacao">
                  <q-item-section>
                    <q-item-label caption>Estado de Conservação</q-item-label>
                    <q-item-label>{{
                      objectStore.currentObject.estado_conservacao
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="objectStore.currentObject.localizacao">
                  <q-item-section>
                    <q-item-label caption>Localização</q-item-label>
                    <q-item-label>{{
                      objectStore.currentObject.localizacao
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="objectStore.currentObject.procedencia">
                  <q-item-section>
                    <q-item-label caption>Procedência</q-item-label>
                    <q-item-label>{{
                      objectStore.currentObject.procedencia
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="objectStore.currentObject.aquisicao">
                  <q-item-section>
                    <q-item-label caption>Aquisição</q-item-label>
                    <q-item-label>{{
                      objectStore.currentObject.aquisicao
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Todas as propriedades brutas se disponíveis -->
            <div
              v-if="
                objectStore.currentObject.rawProperties &&
                objectStore.currentObject.rawProperties.length > 0
              "
              class="q-mt-xl"
            >
              <h5 class="text-h5 text-weight-medium">Todas as Propriedades</h5>
              <q-list bordered separator class="q-mt-sm rounded-borders">
                <q-item
                  v-for="(prop, index) in objectStore.currentObject
                    .rawProperties"
                  :key="index"
                >
                  <q-item-section>
                    <q-item-label caption class="ellipsis">{{
                      prop.predicate
                    }}</q-item-label>
                    <q-item-label>{{ prop.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <!-- Coluna Direita: Imagem -->
          <!-- Esta coluna só será renderizada se houver uma imagem -->
          <div
            v-if="objectStore.currentObject.image_url"
            class="col-12 col-md-4"
          >
            <q-card flat bordered class="sticky-card">
              <q-img :src="objectStore.currentObject.image_url" :ratio="4 / 5">
                <template v-slot:error>
                  <div
                    class="absolute-full flex flex-center bg-grey-4 text-white"
                  >
                    Imagem não disponível
                  </div>
                </template>
              </q-img>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Estado de Erro -->
      <div v-else class="text-center q-my-xl">
        <q-icon name="error_outline" size="4em" color="grey-5" />
        <p class="text-h6 text-grey-6 q-mt-md">
          Não foi possível carregar os detalhes deste objeto.
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useObjectStore } from 'stores/object-store';

const props = defineProps({
  objectId: {
    type: String,
    required: true,
  },
});

defineOptions({
  name: 'ObjectDetailsPage',
});

const objectStore = useObjectStore();

// Computed para verificar se há propriedades específicas para mostrar
const hasSpecificProperties = computed(() => {
  const obj = objectStore.currentObject;
  return (
    obj &&
    (obj.tipo ||
      obj.dimensoes ||
      obj.material ||
      obj.estado_conservacao ||
      obj.localizacao ||
      obj.procedencia ||
      obj.aquisicao)
  );
});

onMounted(() => {
  const decodedObjectId = decodeURIComponent(props.objectId);
  objectStore.fetchObjectById(decodedObjectId);
});
</script>

<style scoped>
.sticky-card {
  position: sticky;
  top: 80px; /* Ajuste conforme a altura do seu cabeçalho */
}
</style>
