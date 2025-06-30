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
        <h4 class="q-my-none">Gerenciar Relações</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Relações do objeto: {{ object?.titulo }}
        </p>
      </div>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm">Carregando relações...</div>
    </div>

    <div v-else-if="object" class="row q-col-gutter-lg">
      <!-- Informações do objeto -->
      <div class="col-12 col-lg-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Objeto</div>
            <q-img
              :src="
                object.image_url ||
                'https://placehold.co/400x300/cccccc/ffffff?text=Sem+Imagem'
              "
              height="200px"
              class="rounded-borders q-mb-md"
            />
            <div class="text-h6">{{ object.titulo }}</div>
            <div class="text-subtitle2 text-grey">
              {{ object.autor || 'Autor desconhecido' }}
            </div>
            <div class="text-caption text-grey">
              {{ object.data || 'Data não informada' }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Relações existentes -->
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Relações Existentes</div>
              <q-btn
                color="primary"
                icon="add"
                label="Adicionar Relação"
                @click="showAddRelationDialog = true"
              />
            </div>

            <div v-if="relations.length === 0" class="text-center q-pa-lg">
              <q-icon name="link" size="48px" color="grey-4" />
              <div class="text-grey q-mt-sm">Nenhuma relação encontrada</div>
              <q-btn
                color="primary"
                label="Adicionar Primeira Relação"
                class="q-mt-md"
                @click="showAddRelationDialog = true"
              />
            </div>

            <div v-else class="q-gutter-md">
              <q-card
                v-for="relation in relations"
                :key="relation.id"
                class="relation-card"
              >
                <q-card-section>
                  <div class="row items-center justify-between">
                    <div class="col">
                      <div class="text-h6">
                        {{ relation.relatedObject?.titulo }}
                      </div>
                      <div class="text-subtitle2 text-grey">
                        {{
                          relation.relatedObject?.autor || 'Autor desconhecido'
                        }}
                      </div>
                      <div class="text-caption text-grey">
                        Tipo: {{ relation.relationType }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="confirmDeleteRelation(relation)"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog para adicionar relação -->
    <q-dialog v-model="showAddRelationDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Adicionar Relação</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="addRelation" class="q-gutter-md">
            <q-select
              v-model="newRelation.relationType"
              :options="relationTypeOptions"
              label="Tipo de Relação *"
              outlined
              :rules="[(val) => !!val || 'Tipo de relação é obrigatório']"
            />

            <q-select
              v-model="newRelation.relatedObjectId"
              :options="availableObjects"
              label="Objeto Relacionado *"
              outlined
              :rules="[(val) => !!val || 'Objeto relacionado é obrigatório']"
              option-label="titulo"
              option-value="id"
            />

            <div class="row q-gutter-sm">
              <q-btn label="Cancelar" color="grey" v-close-popup class="col" />
              <q-btn
                label="Adicionar"
                type="submit"
                color="primary"
                :loading="adding"
                class="col"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Exclusão</div>
        </q-card-section>

        <q-card-section>
          <p>
            Tem certeza que deseja remover a relação com
            <strong>"{{ relationToDelete?.relatedObject?.titulo }}"</strong>?
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            :loading="deleting"
            @click="deleteRelation"
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
import { Notify } from 'quasar';

const route = useRoute();
const router = useRouter();
const objectStore = useObjectStore();

const loading = ref(false);
const adding = ref(false);
const deleting = ref(false);
const showAddRelationDialog = ref(false);
const showDeleteDialog = ref(false);
const object = ref(null);
const relations = ref([]);
const availableObjects = ref([]);
const relationToDelete = ref(null);

const newRelation = ref({
  relationType: '',
  relatedObjectId: '',
});

const relationTypeOptions = [
  { label: 'Similar a', value: 'similar_to' },
  { label: 'Parte de', value: 'part_of' },
  { label: 'Referencia', value: 'references' },
  { label: 'Criado por', value: 'created_by' },
  { label: 'Influenciado por', value: 'influenced_by' },
  { label: 'Relacionado a', value: 'related_to' },
];

async function loadData() {
  loading.value = true;
  try {
    // Carregar objeto
    object.value = await objectStore.getObject(route.params.id);

    // Carregar todas as relações (mockado por enquanto)
    relations.value = [];

    // Carregar objetos disponíveis para relacionar
    const allObjects = await objectStore.fetchAllObjects();
    availableObjects.value = allObjects.filter(
      (obj) => obj.id !== route.params.id
    );
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar dados: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

async function addRelation() {
  adding.value = true;
  try {
    // Aqui você implementaria a chamada para adicionar a relação
    // await relationService.addRelation({
    //   objectId: object.value.id,
    //   relatedObjectId: newRelation.value.relatedObjectId,
    //   relationType: newRelation.value.relationType,
    // });

    const relatedObject = availableObjects.value.find(
      (obj) => obj.id === newRelation.value.relatedObjectId
    );

    relations.value.push({
      id: Date.now(), // ID temporário
      relationType: newRelation.value.relationType,
      relatedObject: relatedObject,
    });

    Notify.create({
      type: 'positive',
      message: 'Relação adicionada com sucesso!',
    });

    // Limpar formulário
    newRelation.value = {
      relationType: '',
      relatedObjectId: '',
    };

    showAddRelationDialog.value = false;
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao adicionar relação: ' + error.message,
    });
  } finally {
    adding.value = false;
  }
}

function confirmDeleteRelation(relation) {
  relationToDelete.value = relation;
  showDeleteDialog.value = true;
}

async function deleteRelation() {
  if (!relationToDelete.value) return;

  deleting.value = true;
  try {
    // Aqui você implementaria a chamada para remover a relação
    // await relationService.deleteRelation(relationToDelete.value.id);

    relations.value = relations.value.filter(
      (r) => r.id !== relationToDelete.value.id
    );

    Notify.create({
      type: 'positive',
      message: 'Relação removida com sucesso!',
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao remover relação: ' + error.message,
    });
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
    relationToDelete.value = null;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.relation-card {
  border-left: 4px solid #1976d2;
}
</style>
