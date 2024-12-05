<template>
  <q-page>
    <q-toolbar class="bg-secondary text-white">
      <q-toolbar-title
        >Gerenciar Mídias para Objeto {{ objetoId }}</q-toolbar-title
      >
    </q-toolbar>
    <div class="gerenciar-midias-container">
      <q-card class="q-pa-md">
        <q-card-section>
          <q-list>
            <q-item v-for="(midia, index) in midias" :key="index">
              <q-item-section>
                <q-toggle
                  v-model="useFileUpload[index]"
                  label="Usar Upload de Arquivo"
                  @update:model-value="() => handleToggleChange(index)"
                />
                <input
                  v-if="useFileUpload[index]"
                  type="file"
                  @change="(e) => handleFileUpload(e, index)"
                />
                <q-input
                  v-else
                  v-model="midias[index].url"
                  label="URL da mídia"
                  @input="() => handleUrlInput(index)"
                />
                <div v-if="thumbnails[index]">
                  <img
                    v-if="isImage(thumbnails[index])"
                    :src="thumbnails[index]"
                    alt="Thumbnail"
                    style="max-width: 100px; max-height: 100px"
                  />
                  <video
                    v-else
                    controls
                    style="max-width: 100px; max-height: 100px"
                  >
                    <source :src="thumbnails[index]" />
                  </video>
                </div>
                <q-btn
                  label="Remover"
                  color="negative"
                  @click="removerMidia(index)"
                />
              </q-item-section>
            </q-item>
            <q-btn label="Adicionar Mídia" @click="adicionarMidia" />
            <q-btn
              label="Salvar Mídias"
              @click="submitMidias"
              color="primary"
            />
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import axios from 'axios';

const objetoId = ''; // Ajuste conforme necessário

const midias = ref([]);
const useFileUpload = ref([]);
const thumbnails = ref([]);

function adicionarMidia() {
  midias.value.push({ url: '' });
  useFileUpload.value.push(false);
  thumbnails.value.push(null);
}

function removerMidia(index) {
  midias.value.splice(index, 1);
  useFileUpload.value.splice(index, 1);
  thumbnails.value.splice(index, 1);
}

function handleFileUpload(event, index) {
  const input = event.target;
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        midias.value[index].url = reader.result;
        thumbnails.value[index] = reader.result;
      }
    };
    reader.readAsDataURL(file);
  } else {
    console.error('Nenhum arquivo selecionado.');
  }
}

function handleToggleChange(index) {
  if (useFileUpload.value[index]) {
    midias.value[index].url = '';
    thumbnails.value[index] = null;
  }
}

function handleUrlInput(index) {
  // Validação simples para verificar se a URL é uma imagem
  if (isImage(midias.value[index].url)) {
    thumbnails.value[index] = midias.value[index].url;
  } else {
    thumbnails.value[index] = null;
  }
}

function isImage(url) {
  return url.startsWith('data:image/') && url.includes('base64');
}

function submitMidias() {
  axios
    .post(`https://sua-api-endpoint/objetos/${objetoId}/midias`, midias.value)
    .then((response) => {
      console.log('Mídias salvas com sucesso:', response.data);
      alert('Mídias salvas com sucesso!');
    })
    .catch((error) => {
      console.error('Erro ao salvar mídias:', error);
      alert('Erro ao salvar mídias.');
    });
}

onMounted(() => {
  axios
    .get(`https://sua-api-endpoint/objetos/${objetoId}/midias`)
    .then((response) => {
      midias.value = response.data;
      useFileUpload.value = midias.value.map(() => false);
      thumbnails.value = midias.value.map((midia) =>
        isImage(midia.url) ? midia.url : null
      );
    })
    .catch((error) => {
      console.error('Erro ao carregar mídias:', error);
    });
});
onBeforeMount(() => {
  objetoId = route.params.id;
});
</script>

<style scoped>
.gerenciar-midias-container {
  max-width: 600px;
  margin: auto;
}
</style>
