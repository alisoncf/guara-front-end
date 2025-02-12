<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useDadosObjetoFisico } from "../../stores/objeto-fisico";
import { ObjetoFisico } from "./manter-objeto";
import apiConfig from "src/apiConfig";
import { Dialog, Notify } from "quasar";

const objetoId = ref({} as string); // Ajuste conforme necessário
const objetoStore = useDadosObjetoFisico();

interface Midia {
  file: string;
  url: string;
  uri: string;
}

const objetoSelecionado = ref({} as ObjetoFisico);
const midias = ref([] as Midia[]);
const midiasEncontradas = ref([]);
const useFileUpload = ref([]);
const thumbnails = ref([]);
const router = useRouter();

function adicionarMidia() {
  midias.value.push({ file: "", url: "", uri: "" });
  useFileUpload.value.push();
  thumbnails.value.push();
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
    console.error("Nenhum arquivo selecionado.");
  }
}
function isPDF(url) {
  return url.endsWith(".pdf") || url.startsWith("data:application/pdf");
}

function handleToggleChange(index) {
  if (useFileUpload.value[index]) {
    midias.value[index].url = "";
    thumbnails.value[index] = null;
  } else {
    midias.value[index].file = null;
    thumbnails.value[index] = null;
  }
}
function excluir(arquivo: string ) {

  Dialog.create({
    title: "Exclusão",
    message: "Tem certeza que deseja excluir essa mídia e sua relação com o objeto?",
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
            type: "positives",
            message: "arquivos enviados ",
            timeout: 5000,
          });
          buscarMidias();
        })
        .catch((error) => {
          Notify.create({
            type: "negative",
            message: "erro ao salvar midia " + error,
            timeout: 5000,
          });
        });
    })
    .onCancel(() => {
      console.log("Usuário cancelou a saída");
    });
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
  return url.startsWith("data:image/") && url.includes("base64");
}
function isVideo(url: string) {
  return /\.(mp4|webm|ogg)$/i.test(url);
}
function submitMidias() {
  const formData = new FormData();

  // Adiciona o objetoId ao FormData
  formData.append("objetoId", objetoId.value);
  formData.append("repositorio", objetoSelecionado.value.repositorio);
  formData.append("repository", objetoSelecionado.value.repositorio);
  console.log("selecionado", objetoSelecionado.value.repositorio);
  // Adiciona cada mídia ao FormData
  midias.value.forEach((midia, index) => {
    if (midia.file) {
      formData.append("midias", midia.file); // Envia o arquivo diretamente
    } else if (midia.url) {
      formData.append("midias", midia.url); // Envia a URL como string
    }
  });

  axios
    .post(apiConfig.baseURL + apiConfig.endpoints.upload, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Define o cabeçalho correto
      },
    })
    .then((response) => {
      Notify.create({
        type: "positives",
        message: "arquivos enviados ",
        timeout: 5000,
      });
      buscarMidias();
    })
    .catch((error) => {
      Notify.create({
        type: "negative",
        message: "erro ao salvar midia " + error,
        timeout: 5000,
      });
    });
}
function buscarMidias() {
  axios
    .get(`${apiConfig.baseURL}${apiConfig.endpoints.listar_arquivos}`, {
      params: {
        objetoId: objetoId.value,
        repositorio: objetoSelecionado.value.repositorio,
      },
    })
    .then((response) => {
      console.log("Resposta da API:", response.data);

      const midiasLocais = response.data.arquivos_locais || [];
      const midiasSparql = response.data.arquivos_sparql?.results?.bindings || [];

      // Processar arquivos locais
      const midiasLocaisFormatadas = midiasLocais.map((nome: string) => ({
        url: `${apiConfig.baseURL}/caminho_dos_arquivos/${nome}`, // Ajuste conforme necessário
        nome: nome,
      }));

      // Processar arquivos retornados pelo SPARQL
      const midiasSparqlFormatadas = midiasSparql.map((item: any) => ({
        url: item.s.value,
        nome: item.s.value.split("/").pop(),
      }));

      // Armazenar as mídias encontradas separadamente
      midiasEncontradas.value = [...midiasLocaisFormatadas];
      Notify.create({
        type: "positive",
        message: "mídias encontradas: ",
        timeout: 5000,
      });
    })
    .catch((error) => {
      Notify.create({
        type: "negative",
        message: "Erro ao buscar mídias: " + error,
        timeout: 5000,
      });
    });
}

onMounted(() => {
  buscarMidias();
});

onBeforeMount(() => {
  objetoId.value = router.currentRoute.value.params.id;
  objetoSelecionado.value = objetoStore.getObjeto;
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
          <q-table
            title="Arquivos"
            :rows="midiasEncontradas"
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
        </q-card-section>
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
                  <video v-else controls style="max-width: 200px; max-height: 200px">
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
              <q-btn label="Salvar Mídias" @click="submitMidias" color="primary" />
            </div>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
