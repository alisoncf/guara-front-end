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
      <!-- Informações do objeto -->
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">{{ object.titulo }}</div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey">Autor</div>
                <div>{{ object.autor || 'Autor desconhecido' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey">Data</div>
                <div>{{ object.data || 'Data não informada' }}</div>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey">Tipo</div>
                <div>{{ object.tipo || 'Tipo não informado' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-grey">Coleção</div>
                <div>
                  {{ object.collectionName || 'Coleção não informada' }}
                </div>
              </div>
            </div>

            <div class="q-mt-md">
              <div class="text-subtitle2 text-grey">Descrição</div>
              <p class="text-body1">
                {{ object.descricao || 'Descrição não disponível' }}
              </p>
            </div>

            <div v-if="object.resumo" class="q-mt-md">
              <div class="text-subtitle2 text-grey">Resumo</div>
              <p class="text-body1">{{ object.resumo }}</p>
            </div>

            <!-- Metadados técnicos -->
            <div class="q-mt-lg">
              <div class="text-h6 q-mb-md">Metadados Técnicos</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="text-subtitle2 text-grey">Dimensões</div>
                  <div>{{ object.dimensoes || 'Não informado' }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-subtitle2 text-grey">Material</div>
                  <div>{{ object.material || 'Não informado' }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-subtitle2 text-grey">
                    Estado de Conservação
                  </div>
                  <div>{{ object.estado_conservacao || 'Não informado' }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-subtitle2 text-grey">Localização</div>
                  <div>{{ object.localizacao || 'Não informado' }}</div>
                </div>
              </div>
            </div>

            <!-- Classificação -->
            <div class="q-mt-lg">
              <div class="text-h6 q-mb-md">Classificação</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="text-subtitle2 text-grey">Categoria</div>
                  <div>{{ object.categoria || 'Não informado' }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-subtitle2 text-grey">Tags</div>
                  <div v-if="object.tags" class="q-mt-sm">
                    <q-chip
                      v-for="tag in object.tags.split(',').map((t) => t.trim())"
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
              </div>
            </div>

            <!-- Procedência -->
            <div class="q-mt-lg">
              <div class="text-h6 q-mb-md">Procedência</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="text-subtitle2 text-grey">Procedência</div>
                  <div>{{ object.procedencia || 'Não informado' }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-subtitle2 text-grey">Data de Aquisição</div>
                  <div>{{ object.aquisicao || 'Não informado' }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sidebar -->
      <div class="col-12 col-lg-4">
        <!-- Imagem do objeto -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Imagem do Objeto</div>
            <q-img
              :src="
                object.image_url ||
                'https://placehold.co/400x300/cccccc/ffffff?text=Sem+Imagem'
              "
              class="rounded-borders"
            />
          </q-card-section>
        </q-card>

        <!-- Ações -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Ações</div>
            <div class="q-gutter-sm">
              <q-btn
                label="Editar Objeto"
                icon="edit"
                color="primary"
                class="full-width"
                @click="$router.push(`/admin/objects/edit/${object.id}`)"
              />
              <q-btn
                label="Gerenciar Relações"
                icon="link"
                color="secondary"
                class="full-width"
                @click="$router.push(`/admin/objects/${object.id}/relations`)"
              />
              <q-btn
                label="Excluir Objeto"
                icon="delete"
                color="negative"
                class="full-width"
                @click="confirmDelete"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Informações do sistema -->
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Informações do Sistema</div>
            <div class="q-gutter-y-sm">
              <div>
                <div class="text-subtitle2 text-grey">ID do Objeto</div>
                <div class="text-caption">{{ object.id }}</div>
              </div>
              <div>
                <div class="text-subtitle2 text-grey">ID da Coleção</div>
                <div class="text-caption">{{ object.collectionId }}</div>
              </div>
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
            Tem certeza que deseja excluir o objeto
            <strong>"{{ object?.titulo }}"</strong>?
          </p>
          <p class="text-caption text-grey">
            Esta ação não pode ser desfeita e todas as relações serão removidas.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            :loading="deleting"
            @click="deleteObject"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useObjectStore } from 'stores/object-store';
import { useCollectionStore } from 'stores/collection-store';
import { Notify } from 'quasar';

const route = useRoute();
const router = useRouter();
const objectStore = useObjectStore();
const collectionStore = useCollectionStore();

const loading = ref(false);
const deleting = ref(false);
const showDeleteDialog = ref(false);
const object = ref(null);

async function loadData() {
  loading.value = true;
  try {
    // Carregar objeto
    object.value = await objectStore.getObject(route.params.id);

    if (object.value && object.value.collectionId) {
      // Carregar informações da coleção
      const collection = await collectionStore.getCollection(
        object.value.collectionId
      );
      if (collection) {
        object.value.collectionName = collection.name;
      }
    }
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar dados do objeto: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

function confirmDelete() {
  showDeleteDialog.value = true;
}

async function deleteObject() {
  if (!object.value) return;

  deleting.value = true;
  try {
    await objectStore.deleteObject(object.value.id);
    Notify.create({
      type: 'positive',
      message: 'Objeto excluído com sucesso!',
    });
    router.push('/admin/objects');
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao excluir objeto: ' + error.message,
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
