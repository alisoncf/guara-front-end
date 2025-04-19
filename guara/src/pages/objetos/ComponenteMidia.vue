<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watchEffect } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import { mostrarPopUpMidias, ObjetoFisico } from './manter-objeto';
import apiConfig from 'src/apiConfig';
import { Dialog, Notify } from 'quasar';

const objetoId = ref({} as string); // Ajuste conforme necessário
const objetoStore = useDadosObjetoFisico();

interface Midia {
  file: string | null;
  url: string;
  uri: string;
}

const objetoSelecionado = ref({} as ObjetoFisico);
const midias = ref([] as Midia[]);
const midiasEncontradas = ref([] as Midia[]);
const useFileUpload = ref([true] as any);
const thumbnails = ref([] as any);
const router = useRouter();
const mostrar_excluidos = ref(false);
function adicionarMidia() {
  midias.value.push({ file: '', url: '', uri: '' });
  useFileUpload.value.push(true);
  thumbnails.value.push();
}

function removerMidia(index: number) {
  midias.value.splice(index, 1);
  useFileUpload.value.splice(index, 1);
  thumbnails.value.splice(index, 1);
}

function handleFileUpload(
  event: { target: any },
  index: string | number | any | never
) {
  const input = event.target;
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0];
    midias.value[index].file = file;

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
function isPDF(url: string) {
  return url.endsWith('.pdf') || url.startsWith('data:application/pdf');
}

function handleToggleChange(index: number) {
  if (useFileUpload.value[index]) {
    midias.value[index].url = '';
    thumbnails.value[index] = null;
  } else {
    midias.value[index].file = null;
    thumbnails.value[index] = null;
  }
}
function excluir(arquivo: string) {
  Dialog.create({
    title: 'Exclusão',
    message:
      'Tem certeza que deseja excluir essa mídia e sua relação com o objeto?',
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      axios
        .post(apiConfig.baseURL + apiConfig.endpoints.remove_file, {
          objetoId: objetoId.value,
          repositorio: objetoSelecionado.value.repositorio,
          file: arquivo,
        })
        .then((response) => {
          Notify.create({
            type: 'warning',
            message: 'arquivo excluído ',
            timeout: 5000,
          });
          buscarMidias();
        })
        .catch((error) => {
          Notify.create({
            type: 'negative',
            message: 'erro ao salvar midia ' + error,
            timeout: 5000,
          });
        });
    })
    .onCancel(() => {
      console.log('Usuário cancelou a saída');
    });
}
function handleUrlInput(index: string | number) {
  // Validação simples para verificar se a URL é uma imagem
  if (isImage(midias.value[index].url)) {
    thumbnails.value[index] = midias.value[index].url;
  } else {
    thumbnails.value[index] = null;
  }
}

function isImage(url: string) {
  return url.startsWith('data:image/') && url.includes('base64');
}
function isVideo(url: string) {
  return /\.(mp4|webm|ogg)$/i.test(url);
}
function submitMidias() {
  const formData = new FormData();
  if (midias.value.length == 0) {
    Notify.create({
      type: 'negative',
      message:
        'Não foram adicionadas mídias. Clique em adicionar mídias para escolher um arquivo ',
      timeout: 5000,
    });
    return;
  }
  // Adiciona o objetoId ao FormData
  formData.append('objetoId', objetoId.value);
  formData.append('repositorio', objetoSelecionado.value.repositorio);
  formData.append('repository', objetoSelecionado.value.repositorio);
  console.log('selecionado', objetoSelecionado.value.repositorio);
  // Adiciona cada mídia ao FormData
  midias.value.forEach(
    (midia: { file: string | Blob; url: string | Blob }, index: any) => {
      if (midia.file) {
        formData.append('midias', midia.file); // Envia o arquivo diretamente
      } else if (midia.url) {
        formData.append('links', midia.url); // Envia a URL como string
      }
    }
  );

  axios
    .post(apiConfig.baseURL + apiConfig.endpoints.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Define o cabeçalho correto
      },
    })
    .then((response) => {
      Notify.create({
        type: 'positives',
        message: 'arquivos enviados ',
        timeout: 5000,
      });
      buscarMidias();
      midias.value = [];
    })
    .catch((error) => {
      Notify.create({
        type: 'negative',
        message: 'erro ao salvar midia ' + error,
        timeout: 5000,
      });
    });
}
function buscarMidias() {
  objetoId.value = objetoStore.getObjeto.id;
  objetoSelecionado.value = objetoStore.getObjeto;
  axios
    .get(`${apiConfig.endpoints.midias.list}`, {
      params: {
        objetoId: objetoId.value,
        repositorio: objetoSelecionado.value.repositorio,
      },
    })
    .then((response) => {
      const midiasCombinadas = ref([] as Midia[]);
      const midiasLocais = response.data.arquivos_locais || [];
      midiasCombinadas.value = response.data.arquivos_combinados || [];
      const midiasSparql =
        response.data.arquivos_sparql?.results?.bindings || [];

      midiasCombinadas.value.forEach((midia) => {
        midia.url = 'http://localhost/' + midia.uri; // Define .url como .uri
      });

      midiasEncontradas.value = midiasCombinadas.value;
      console.log(midiasEncontradas.value);
    })
    .catch((error) => {
      Notify.create({
        type: 'negative',
        message: 'Erro ao buscar mídias: ' + error,
        timeout: 5000,
      });
    });
}
watchEffect(() => {
  if (mostrarPopUpMidias.value) {
    buscarMidias();
  }
});
onMounted(() => {
  //
});

onBeforeMount(() => {
  //
});
</script>

<template>
  <q-dialog v-model="mostrarPopUpMidias" class="q-pa-md scroll" persistent>
    <q-card style="width: 80vw; max-width: 90vw; max-height: 90vh">
      <q-toolbar>
        <q-toolbar-title>Gerenciar Mídias</q-toolbar-title>
        <q-btn
          icon="close"
          label="fechar"
          @click="mostrarPopUpMidias = false"
          flat
        />
      </q-toolbar>
      <div>
        <q-card class="q-pa-md">
          <div class="row">
            <div class="col-6">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold">Objeto Id:</q-item-label>
                  <q-item-label>{{ objetoSelecionado.id }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-6">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold">Título:</q-item-label>
                  <q-item-label>{{ objetoSelecionado.titulo }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>

          <q-card-section>
            <q-table
              title="Arquivos de Mídia"
              :rows="
                midiasEncontradas.filter((row) => row.nome !== 'excluidos')
              "
              :columns="[
                { name: 'nome', label: 'Nome', align: 'left', field: 'nome' },
                {
                  name: 'preview',
                  label: '',
                  align: 'left',
                  field: '',
                },
                {
                  name: 'acao',
                  label: '',
                  align: 'left',
                  field: '',
                },
              ]"
              row-key="nome"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="nome">{{ props.row.nome }}</q-td>
                  <q-td key="preview">
                    <img
                      v-if="isImage(props.row.url)"
                      :src="props.row.url"
                      style="max-width: 100px; max-height: 100px"
                    />
                    <video
                      v-else-if="isVideo(props.row.url)"
                      controls
                      style="max-width: 100px; max-height: 100px"
                    >
                      <source :src="props.row.url" />
                    </video>
                    <q-btn
                      v-else-if="isPDF(props.row.url)"
                      icon="picture_as_pdf"
                      flat
                      dense
                      :href="props.row.url"
                      target="_blank"
                    />
                  </q-td>
                  <q-td key="acao">
                    <q-btn
                      label="Abrir"
                      color="primary"
                      icon="panorama"
                      :href="props.row.url"
                      size="sm"
                      flat
                      target="_blank"
                    />
                  </q-td>
                  <q-td key="acao">
                    <q-btn
                      label="Excluir"
                      color="red"
                      icon="delete"
                      size="sm"
                      flat
                      @click="excluir(props.row.nome)"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
            <q-btn
              label="Adicionar Mídia"
              @click="adicionarMidia"
              color="primary"
            />
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item v-for="(midia, index) in midias" :key="index">
                <q-item-section>
                  <q-toggle
                    v-model="useFileUpload[index]"
                    label="Upload de Arquivo"
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
                    label="Ou cole aqui a URL da mídia"
                    @input="() => handleUrlInput(index)"
                  />
                  <div v-if="thumbnails[index]">
                    <img
                      v-if="isImage(thumbnails[index])"
                      :src="thumbnails[index]"
                      alt="Thumbnail"
                      style="max-width: 200px; max-height: 200px"
                    />
                  </div>
                  <q-btn-group flat push>
                    <q-btn
                      label="Remover"
                      color="negative"
                      @click="removerMidia(index)"
                    />
                  </q-btn-group>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section>
            <q-btn-group flat push>
              <q-btn
                label="Salvar Mídias"
                @click="submitMidias"
                color="green-8"
              />
              <q-btn
                @click="mostrarPopUpMidias = false"
                label="Voltar"
                color="secondary"
              />
            </q-btn-group>
          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </q-dialog>
</template>
