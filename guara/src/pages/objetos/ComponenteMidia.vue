<script setup lang="ts">
import { ref, computed, onMounted, onBeforeMount, watchEffect } from 'vue';
import axios from 'axios';
import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import { mostrarPopUpMidias, ObjetoFisico } from './manter-objeto';
import apiConfig from 'src/apiConfig';
import { Dialog, Notify } from 'quasar';
import { textoAposUltimoChar } from '../funcoes';
import { useAuthStore } from 'src/stores/auth-store';

const objetoId = ref({} as string); // Ajuste conforme necessário
const objetoStore = useDadosObjetoFisico();
const store = useAuthStore();
interface Midia {
  file: File | null;
  url: string;
  uri: string;
  nome: string;
}

const objetoSelecionado = ref({} as ObjetoFisico);
const midias = ref([] as Midia[]);
const midiasEncontradas = ref([] as Midia[]);
const thumbnails = ref<(string | null)[]>([]);

// Mídias já salvas no objeto, prontas pra exibir (o backend às vezes
// devolve um item sentinela "excluidos" que não deve aparecer na galeria)
const midiasVisiveis = computed(() =>
  midiasEncontradas.value.filter((midia) => midia.nome !== 'excluidos')
);

// --- Arrastar e soltar / seleção de arquivos ---
const arrastando = ref(false);
const inputArquivoRef = ref<HTMLInputElement | null>(null);
const novaUrlMidia = ref('');

function abrirSeletorArquivo() {
  inputArquivoRef.value?.click();
}
function aoSoltarArquivos(event: DragEvent) {
  arrastando.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    adicionarArquivos(files);
  }
}
function aoSelecionarArquivos(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    adicionarArquivos(input.files);
  }
  input.value = ''; // permite selecionar o mesmo arquivo de novo depois
}
function adicionarArquivos(files: FileList) {
  Array.from(files).forEach((file) => {
    const index = midias.value.length;
    midias.value.push({ nome: file.name, file, url: '', uri: '' });
    thumbnails.value.push(null);
    gerarThumbnail(file, index);
  });
}
function gerarThumbnail(file: File, index: number) {
  if (!file.type.startsWith('image/')) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    if (reader.result) {
      thumbnails.value[index] = reader.result as string;
    }
  };
  reader.readAsDataURL(file);
}
function adicionarUrlPendente() {
  const url = novaUrlMidia.value.trim();
  if (!url) {
    return;
  }
  midias.value.push({
    nome: textoAposUltimoChar(url, '/'),
    file: null,
    url,
    uri: '',
  });
  thumbnails.value.push(isImage(url) ? url : null);
  novaUrlMidia.value = '';
}

function removerMidia(index: number) {
  midias.value.splice(index, 1);
  thumbnails.value.splice(index, 1);
}

function isPDF(url: string) {
  return url.endsWith('.pdf') || url.startsWith('data:application/pdf');
}
function isImage(url: string) {
  if (!url) {
    return false;
  }
  if (url.startsWith('data:image/')) {
    return true;
  }
  // URLs "de verdade" (as mídias já enviadas vêm assim, não em base64)
  return /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
}
function isVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
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
        .post(
          apiConfig.baseURL + apiConfig.endpoints.remove_file,
          {
            objetoId: objetoId.value,
            repositorio: objetoSelecionado.value.repositorio,
            file: arquivo,
          },
          {
            headers: {
              Authorization: `Bearer ${store.token}`,
            },
          }
        )
        .then(() => {
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

function submitMidias() {
  const formData = new FormData();
  if (midias.value.length == 0) {
    Notify.create({
      type: 'negative',
      message:
        'Não foram adicionadas mídias. Arraste arquivos ou informe uma URL antes de salvar.',
      timeout: 5000,
    });
    return;
  }
  formData.append('objetoId', objetoId.value);
  formData.append('repositorio', objetoSelecionado.value.repositorio);
  formData.append('repository', objetoSelecionado.value.repositorio);
  midias.value.forEach((midia) => {
    if (midia.file) {
      formData.append('midias', midia.file);
    } else if (midia.url) {
      formData.append('links', midia.url);
    }
  });

  axios
    .post(apiConfig.baseURL + apiConfig.endpoints.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(() => {
      Notify.create({
        type: 'positive',
        message: 'arquivos enviados ',
        timeout: 5000,
      });
      buscarMidias();
      midias.value = [];
      thumbnails.value = [];
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
      midiasCombinadas.value = response.data.arquivos_combinados || [];
      midiasCombinadas.value.forEach((midia) => {
        midia.url =
          apiConfig.endpoints.midias.getFile +
          '/' +
          objetoId.value +
          '/' +
          textoAposUltimoChar(midia.uri, '/');
      });

      midiasEncontradas.value = midiasCombinadas.value;
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
    midias.value = [];
    thumbnails.value = [];
    buscarMidias();
  }
});
onMounted(() => {
  //
});
function trataNomeArquivo(nome: string) {
  if (!nome) {
    return '';
  }
  if (nome.length < 50) {
    return nome;
  }
  return nome.substring(0, 50) + '... .' + textoAposUltimoChar(nome, '.');
}
onBeforeMount(() => {
  //
});
</script>

<template>
  <q-dialog v-model="mostrarPopUpMidias" class="q-pa-md scroll" persistent>
    <q-card class="dialogo-midias">
      <q-toolbar>
        <q-toolbar-title
          >Gerenciar Mídias
          <span v-if="objetoSelecionado.titulo" class="text-body2">
            — {{ objetoSelecionado.titulo }}
          </span>
        </q-toolbar-title>
        <q-btn
          icon="close"
          label="fechar"
          @click="mostrarPopUpMidias = false"
          flat
        />
      </q-toolbar>

      <q-card-section class="dialogo-midias-corpo">
        <div class="text-subtitle2 q-mb-sm">Mídias do objeto</div>
        <div
          v-if="midiasVisiveis.length === 0"
          class="text-grey-7 text-center q-pa-lg"
        >
          Nenhuma mídia enviada ainda.
        </div>
        <div v-else class="row q-col-gutter-md q-mb-lg">
          <div
            v-for="midia in midiasVisiveis"
            :key="midia.nome"
            class="col-xs-6 col-sm-4 col-md-3"
          >
            <q-card bordered flat class="midia-card">
              <a
                :href="midia.url"
                target="_blank"
                rel="noopener noreferrer"
                class="midia-preview-link"
              >
                <div class="midia-preview">
                  <img v-if="isImage(midia.url)" :src="midia.url" />
                  <video v-else-if="isVideo(midia.url)" muted>
                    <source :src="midia.url" />
                  </video>
                  <q-icon
                    v-else-if="isPDF(midia.url)"
                    name="picture_as_pdf"
                    size="42px"
                    color="red-6"
                  />
                  <q-icon
                    v-else
                    name="insert_drive_file"
                    size="42px"
                    color="grey-6"
                  />
                </div>
              </a>
              <q-card-section class="q-py-xs">
                <div class="midia-nome" :title="midia.nome">
                  {{ trataNomeArquivo(midia.nome) }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  icon="open_in_new"
                  flat
                  dense
                  round
                  size="sm"
                  :href="midia.url"
                  target="_blank"
                >
                  <q-tooltip>Abrir em nova aba</q-tooltip>
                </q-btn>
                <q-btn
                  icon="delete"
                  flat
                  dense
                  round
                  size="sm"
                  color="red-6"
                  @click="excluir(midia.nome)"
                >
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <q-separator class="q-mb-md" />

        <div class="text-subtitle2 q-mb-sm">Adicionar mídias</div>
        <div
          class="dropzone"
          :class="{ 'dropzone--ativo': arrastando }"
          @dragover.prevent="arrastando = true"
          @dragleave.prevent="arrastando = false"
          @drop.prevent="aoSoltarArquivos"
          @click="abrirSeletorArquivo"
        >
          <q-icon name="cloud_upload" size="42px" />
          <div class="text-body1">
            Arraste arquivos aqui ou clique para selecionar
          </div>
          <div class="text-caption text-grey-7">
            Pode soltar várias mídias de uma vez
          </div>
          <input
            ref="inputArquivoRef"
            type="file"
            multiple
            class="dropzone-input-oculto"
            @change="aoSelecionarArquivos"
            @click.stop
          />
        </div>

        <div class="row items-end q-gutter-sm q-mt-md">
          <q-input
            dense
            outlined
            v-model="novaUrlMidia"
            label="Ou cole aqui a URL de uma mídia"
            class="col"
            @keyup.enter="adicionarUrlPendente"
          />
          <q-btn
            label="Adicionar link"
            outline
            color="primary"
            @click="adicionarUrlPendente"
          />
        </div>

        <div v-if="midias.length > 0" class="row q-col-gutter-md q-mt-md">
          <div
            v-for="(midia, index) in midias"
            :key="index"
            class="col-xs-6 col-sm-4 col-md-3"
          >
            <q-card bordered flat class="midia-card midia-card-pendente">
              <q-btn
                round
                dense
                flat
                icon="close"
                size="sm"
                class="midia-card-remover"
                @click="removerMidia(index)"
              >
                <q-tooltip>Remover</q-tooltip>
              </q-btn>
              <div class="midia-preview">
                <img v-if="thumbnails[index]" :src="thumbnails[index]!" />
                <q-icon
                  v-else
                  name="insert_drive_file"
                  size="42px"
                  color="grey-6"
                />
              </div>
              <q-card-section class="q-py-xs">
                <div class="midia-nome" :title="midia.nome">
                  {{ trataNomeArquivo(midia.nome) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="botoes-fixos">
        <q-btn-group flat push>
          <q-btn
            label="Salvar Mídias"
            @click="submitMidias"
            color="green-8"
            :disable="midias.length === 0"
          />
          <q-btn
            @click="mostrarPopUpMidias = false"
            label="Voltar"
            color="secondary"
          />
        </q-btn-group>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialogo-midias {
  width: 90vw;
  max-width: 90vw;
  height: 85vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.dialogo-midias-corpo {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
.botoes-fixos {
  flex: 0 0 auto;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

.midia-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
.midia-preview-link {
  text-decoration: none;
  color: inherit;
}
.midia-preview {
  height: 130px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.midia-preview img,
.midia-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.midia-nome {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.midia-card-remover {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
}

.dropzone {
  border: 2px dashed #c3c2b7;
  border-radius: 10px;
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  color: #666;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease;
}
.dropzone:hover {
  background: #fafafa;
}
.dropzone--ativo {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.06);
  color: #1976d2;
}
.dropzone-input-oculto {
  display: none;
}
</style>
