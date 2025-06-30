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
        <h4 class="q-my-none">
          {{ isEditing ? 'Editar Coleção' : 'Nova Coleção' }}
        </h4>
        <p class="text-grey q-mt-sm q-mb-none">
          {{
            isEditing
              ? 'Modifique os dados da coleção'
              : 'Crie uma nova coleção no sistema'
          }}
        </p>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- Informações básicas -->
          <div class="text-h6 q-mb-md">Informações Básicas</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.label"
                label="Nome da Coleção *"
                outlined
                :rules="[(val) => !!val || 'Nome é obrigatório']"
                hint="Nome legível da coleção"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.subclassof_localname"
                label="Superclasse *"
                outlined
                :rules="[(val) => !!val || 'Superclasse é obrigatória']"
                hint="Nome da classe pai (ex: ObjetoFisico)"
              />
            </div>
          </div>

          <q-input
            v-model="form.comment"
            label="Descrição *"
            type="textarea"
            rows="3"
            outlined
            :rules="[(val) => !!val || 'Descrição é obrigatória']"
            hint="Descrição detalhada da coleção"
          />

          <!-- Configurações do repositório -->
          <div class="text-h6 q-mb-md q-mt-lg">
            Configurações do Repositório
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.repository_base_uri"
                label="URI Base da Ontologia *"
                outlined
                :rules="[(val) => !!val || 'URI base é obrigatória']"
                hint="Ex: http://guara.ueg.br/ontologias/"
              >
                <template v-slot:hint>
                  <div class="text-caption">
                    URI base da ontologia no repositório
                  </div>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.repository_update_url"
                label="URL de Atualização SPARQL *"
                outlined
                :rules="[(val) => !!val || 'URL de atualização é obrigatória']"
                hint="Ex: http://localhost:3030/dataset/update"
              >
                <template v-slot:hint>
                  <div class="text-caption">
                    Endpoint SPARQL para atualizações
                  </div>
                </template>
              </q-input>
            </div>
          </div>

          <!-- Imagem da coleção -->
          <div class="text-h6 q-mb-md q-mt-lg">Imagem da Coleção</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.image_url"
                label="URL da Imagem"
                outlined
                hint="URL de uma imagem representativa da coleção"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-file
                v-model="imageFile"
                label="Ou fazer upload de imagem"
                outlined
                accept=".jpg,.jpeg,.png,.gif"
                @update:model-value="handleImageUpload"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>
          </div>

          <!-- Preview da imagem -->
          <div v-if="form.image_url || imagePreview" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Preview da Imagem:</div>
            <q-img
              :src="imagePreview || form.image_url"
              style="max-width: 200px; max-height: 150px"
              class="rounded-borders"
            />
          </div>

          <!-- Metadados adicionais -->
          <div class="text-h6 q-mb-md q-mt-lg">Metadados Adicionais</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.contact"
                label="Contato"
                outlined
                hint="Email ou telefone para contato sobre a coleção"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.responsible"
                label="Responsável"
                outlined
                hint="Nome do responsável pela coleção"
              />
            </div>
          </div>

          <!-- Tags/Categorias -->
          <q-input
            v-model="form.tags"
            label="Tags"
            outlined
            hint="Tags separadas por vírgula (ex: arte, história, cultura)"
          />

          <!-- Botões de ação -->
          <div class="row q-gutter-md q-mt-lg">
            <q-btn
              label="Cancelar"
              color="grey"
              @click="$router.go(-1)"
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
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCollectionStore } from 'stores/collection-store';
import { Notify } from 'quasar';

const route = useRoute();
const router = useRouter();
const collectionStore = useCollectionStore();

// Estado
const loading = ref(false);
const imageFile = ref(null);
const imagePreview = ref(null);

// Computed
const isEditing = computed(() => !!route.params.id);

// Formulário
const form = ref({
  label: '',
  comment: '',
  subclassof_localname: '',
  repository_base_uri: '',
  repository_update_url: '',
  image_url: '',
  contact: '',
  responsible: '',
  tags: '',
});

// Métodos
async function loadCollection() {
  if (!isEditing.value) return;

  loading.value = true;
  try {
    const collection = await collectionStore.getCollection(route.params.id);
    if (collection) {
      form.value = {
        label: collection.name || '',
        comment: collection.description || '',
        subclassof_localname: collection.superclass || 'ObjetoFisico',
        repository_base_uri: collection.baseUri || '',
        repository_update_url: collection.updateUrl || '',
        image_url: collection.image || '',
        contact: collection.contact || '',
        responsible: collection.responsible || '',
        tags: collection.tags || '',
      };
    }
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar coleção: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

function handleImageUpload(file) {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.value = null;
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    const collectionData = {
      label: form.value.label,
      comment: form.value.comment,
      subclassof_localname: form.value.subclassof_localname,
      repository_base_uri: form.value.repository_base_uri,
      repository_update_url: form.value.repository_update_url,
      // Metadados adicionais
      image_url: form.value.image_url,
      contact: form.value.contact,
      responsible: form.value.responsible,
      tags: form.value.tags,
    };

    if (isEditing.value) {
      await collectionStore.updateCollection(route.params.id, collectionData);
      Notify.create({
        type: 'positive',
        message: 'Coleção atualizada com sucesso!',
      });
    } else {
      await collectionStore.createCollection(collectionData);
      Notify.create({
        type: 'positive',
        message: 'Coleção criada com sucesso!',
      });
    }

    router.push('/admin/collections');
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao salvar coleção: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  loadCollection();
});
</script>
