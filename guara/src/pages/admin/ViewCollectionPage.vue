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
        <h4 class="q-my-none">Visualizar Coleção</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Detalhes da coleção selecionada
        </p>
      </div>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm">Carregando coleção...</div>
    </div>

    <div v-else-if="collection" class="row q-col-gutter-lg">
      <!-- Informações da coleção -->
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">{{ collection.name }}</div>
            <p class="text-body1">{{ collection.description }}</p>

            <div class="row q-col-gutter-md q-mt-lg">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey">Contato</div>
                <div>{{ collection.contact || 'Não informado' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey">Responsável</div>
                <div>{{ collection.responsible || 'Não informado' }}</div>
              </div>
            </div>

            <div class="q-mt-md">
              <div class="text-subtitle2 text-grey">Tags</div>
              <div v-if="collection.tags" class="q-mt-sm">
                <q-chip
                  v-for="tag in collection.tags.split(',').map((t) => t.trim())"
                  :key="tag"
                  :label="tag"
                  color="primary"
                  text-color="white"
                  size="sm"
                  class="q-mr-xs q-mb-xs"
                />
              </div>
              <div v-else class="text-grey">Nenhuma tag definida</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Lista de objetos -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                Objetos da Coleção ({{ objects.length }})
              </div>
              <q-btn
                color="primary"
                icon="add"
                label="Adicionar Objeto"
                @click="
                  $router.push(
                    `/admin/objects/new?collectionId=${collection.id}`
                  )
                "
              />
            </div>

            <div v-if="objects.length === 0" class="text-center q-pa-lg">
              <q-icon name="inventory_2" size="48px" color="grey-4" />
              <div class="text-grey q-mt-sm">Nenhum objeto nesta coleção</div>
              <q-btn
                color="primary"
                label="Adicionar Primeiro Objeto"
                class="q-mt-md"
                @click="
                  $router.push(
                    `/admin/objects/new?collectionId=${collection.id}`
                  )
                "
              />
            </div>

            <div v-else class="row q-col-gutter-md">
              <div
                v-for="object in objects"
                :key="object.id"
                class="col-12 col-md-6 col-lg-4"
              >
                <q-card
                  class="object-card"
                  clickable
                  @click="viewObject(object)"
                >
                  <q-img
                    :src="
                      object.image_url ||
                      'https://placehold.co/400x300/cccccc/ffffff?text=Sem+Imagem'
                    "
                    height="150px"
                    class="rounded-borders"
                  />
                  <q-card-section>
                    <div class="text-h6">{{ object.titulo }}</div>
                    <div class="text-subtitle2 text-grey">
                      {{ object.autor || 'Autor desconhecido' }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ object.data || 'Data não informada' }}
                    </div>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn
                      flat
                      color="primary"
                      label="Ver Detalhes"
                      @click.stop="viewObject(object)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sidebar -->
      <div class="col-12 col-lg-4">
        <!-- Imagem da coleção -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Imagem da Coleção</div>
            <q-img
              :src="
                collection.image ||
                'https://placehold.co/400x300/cccccc/ffffff?text=Sem+Imagem'
              "
              class="rounded-borders"
            />
          </q-card-section>
        </q-card>

        <!-- Ações -->
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Ações</div>
            <div class="q-gutter-sm">
              <q-btn
                label="Editar Coleção"
                icon="edit"
                color="primary"
                class="full-width"
                @click="
                  $router.push(`/admin/collections/edit/${collection.id}`)
                "
              />
              <q-btn
                label="Adicionar Objeto"
                icon="add"
                color="secondary"
                class="full-width"
                @click="
                  $router.push(
                    `/admin/objects/new?collectionId=${collection.id}`
                  )
                "
              />
              <q-btn
                label="Excluir Coleção"
                icon="delete"
                color="negative"
                class="full-width"
                @click="confirmDelete"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog de confirmação de exclusão -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Exclusão</div>
        </q-card-section>

        <q-card-section>
          <p>
            Tem certeza que deseja excluir a coleção
            <strong>"{{ collection?.name }}"</strong>?
          </p>
          <p class="text-caption text-grey">
            Esta ação não pode ser desfeita e todos os objetos associados serão
            removidos.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            :loading="deleting"
            @click="deleteCollection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCollectionStore } from 'stores/collection-store';
import { useObjectStore } from 'stores/object-store';
import { Notify } from 'quasar';

const route = useRoute();
const router = useRouter();
const collectionStore = useCollectionStore();
const objectStore = useObjectStore();

const loading = ref(false);
const deleting = ref(false);
const showDeleteDialog = ref(false);
const collection = ref(null);
const objects = ref([]);

async function loadData() {
  loading.value = true;
  try {
    // Carregar coleção
    collection.value = await collectionStore.getCollection(route.params.id);

    // Carregar objetos da coleção
    objects.value = await objectStore.fetchObjectsByCollection(route.params.id);
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar dados da coleção: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

function viewObject(object) {
  router.push(`/admin/objects/view/${object.id}`);
}

function confirmDelete() {
  showDeleteDialog.value = true;
}

async function deleteCollection() {
  if (!collection.value) return;

  deleting.value = true;
  try {
    await collectionStore.deleteCollection(collection.value.id);
    Notify.create({
      type: 'positive',
      message: 'Coleção excluída com sucesso!',
    });
    router.push('/admin/collections');
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao excluir coleção: ' + error.message,
    });
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.object-card {
  transition: transform 0.2s ease-in-out;
}

.object-card:hover {
  transform: translateY(-4px);
}
</style>
