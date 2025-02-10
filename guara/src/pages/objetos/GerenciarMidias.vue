<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import { ObjetoFisico } from './manter-objeto';
import apiConfig from 'src/apiConfig';

const objetoId = ref({}); // Ajuste conforme necessário
const objetoStore = useDadosObjetoFisico();

const objetoSelecionado = ref({} as ObjetoFisico);
const midias = ref([]);
const useFileUpload = ref([]);
const thumbnails = ref([]);
const router = useRouter();

function adicionarMidia() {
  midias.value.push({ file: null, url: '' });
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
    midias.value[index].file = file;

    // Gera uma URL temporária para exibir o preview
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        thumbnails.value[index] = reader.result;
      }
    };
    reader.readAsDataURL(file);
  } else {
    console.error('Nenhum arquivo selecionado.');
  }
}
function isPDF(url) {
  return url.endsWith('.pdf') || url.startsWith('data:application/pdf');
}

function handleToggleChange(index) {
  if (useFileUpload.value[index]) {
    midias.value[index].url = '';
    thumbnails.value[index] = null;
  } else {
    midias.value[index].file = null;
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
  const formData = new FormData();

  // Adiciona o objetoId ao FormData
  formData.append('objetoId', objetoId.value);
  formData.append('repositorio', objetoSelecionado.value.repositorio);
  console.log('selecionado',objetoSelecionado.value.repositorio)
  // Adiciona cada mídia ao FormData
  midias.value.forEach((midia, index) => {
    if (midia.file) {
      formData.append('midias', midia.file); // Envia o arquivo diretamente
    } else if (midia.url) {
      formData.append('midias', midia.url); // Envia a URL como string
    }
  });

  axios
    .post(apiConfig.baseURL+apiConfig.endpoints.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Define o cabeçalho correto
      },
    })
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
    .get(`http://localhost:5000/objetos/${objetoId}/midias`)
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
  console.log('montando gerenciar midias');
  objetoId.value = router.currentRoute.value.params.id;
  objetoSelecionado.value = objetoStore.getObjeto;
  console.log('objeto', objetoSelecionado.value);
});
</script>

<template>
  <q-page>
    <q-toolbar class="bg-secondary text-white">
      <q-toolbar-title>Gerenciar Mídias</q-toolbar-title>
    </q-toolbar>
    <div class="q-pa-md">
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
                    style="max-width: 200px; max-height: 200px"
                  />
                  <video
                    v-else
                    controls
                    style="max-width: 200px; max-height: 200px"
                  >
                    <source :src="thumbnails[index]" />
                  </video>




                </div>
                <q-btn
                  label="Remover"
                  color="negative"
                  @click="removerMidia(index)"
                  style="max-width: 200px; max-height: 200px"
                />
              </q-item-section>
            </q-item>
            <div>
            <q-btn label="Adicionar Mídia" @click="adicionarMidia" />
            <q-btn
              label="Salvar Mídias"
              @click="submitMidias"
              color="primary"
            />
          </div>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>


