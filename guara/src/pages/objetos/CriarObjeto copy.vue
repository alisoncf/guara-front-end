<template>
  <q-page>
    <q-toolbar class="bg-secondary text-white">
      <q-toolbar-title>Criar um novo objeto</q-toolbar-title>
    </q-toolbar>
    <div class="criar-objeto-container">
      <q-card class="q-pa-md">
        <q-card-section>
          <q-form @submit.prevent="submitForm">
            <div class="q-gutter-x-md">
              <label>Tipos de Objeto</label>
              <q-checkbox
                v-for="tipo in tipos"
                :key="tipo.value"
                v-model="objeto.tipo"
                :label="tipo.label"
                :val="tipo.value"
              />
            </div>
            <q-tree
              :nodes="arvoreClasses"
              node-key="label"
              v-model:selected="selectedNode"
              @update:selected="onNodeSelect"
            />
            <q-input v-model="uri" label="Classe do Acervo" />
            <q-input v-model="objeto.titulo" label="Título/nome do objeto" />
            <q-input
              v-model="objeto.descricao"
              label="Descrição"
              type="textarea"
              title="uma descrição sucinta do objeto digital"
            />
            <q-input
              v-model="objeto.resumo"
              label="Resumo"
              title="um resumo com detalhes e informações importantes sobre o objeto"
              type="textarea"
            />

            <q-toggle
              v-model="mostrarCamposOpcionais"
              label="Mostrar campos opcionais"
            />

            <div v-if="mostrarCamposOpcionais">
              <q-input v-model="objeto.altura" label="Altura" type="number" />
              <q-input v-model="objeto.largura" label="Largura" type="number" />
              <q-input
                v-model="objeto.profundidade"
                label="Profundidade"
                type="number"
              />
              <q-input v-model="objeto.peso" label="Peso" type="number" />
              <q-input v-model="objeto.material" label="Material" />
            </div>

            <label>URLs de Conteúdo</label>
            <div v-for="(url, index) in objeto.contentUrl" :key="index">
              <q-toggle
                v-model="useFileUpload[index]"
                label="Usar upload de arquivo"
              />
              <div v-if="useFileUpload[index]">
                <input type="file" @change="handleFileUpload($event, index)" />
                <div v-if="thumbnails[index]">
                  <img
                    v-if="isImage(thumbnails[index])"
                    :src="thumbnails[index] || undefined"
                    alt="Imagem"
                    style="max-width: 100px; max-height: 100px"
                  />
                  <video
                    v-else
                    controls
                    style="max-width: 100px; max-height: 100px"
                  >
                    <source :src="thumbnails[index] || undefined" />
                  </video>
                </div>
              </div>
              <div v-else>
                <q-input
                  v-model="objeto.contentUrl[index]"
                  label="URL ou Link do recurso"
                />
              </div>
            </div>

            <q-btn label="Adicionar Mídia" @click="addContentUrl" />
            <q-btn type="submit" label="Salvar Objeto" color="primary" />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { ObjetoFisico } from './manter-objeto';
import {
  textoAposUltimoChar,
  organiza_arvore,
  encontrarClassePorLabel,
} from '../funcoes';
import { ClasseComum, ClassQueryResult, TreeNode } from '../tipos';

const listaClasses = ref<ClasseComum[]>([]);
const ClasseSelecionada = ref<ClasseComum>();
const arvoreClasses = ref<TreeNode[]>([]);
const keyword = ref<string>('');
const uri = ref<string>('');
const router = useRouter();
const selectedNode = ref<string>('');
const objeto = ref<ObjetoFisico>({
  id: '',
  obj: '',
  resumo: '',
  tipo: [],
  tipo_id: '',
  titulo: '',
  contentUrl: [],
  altura: 0,
  dataCriacao: '',
  dataModificacao: '',
  descricao: '',
  classe: '',
  largura: 0,
  material: '',
  profundidade: 0,
  peso: 0,
  pertence: '',
  type: [],
});

const tipos = [
  { label: 'Bibliotecário', value: 'Bibliotecario' },
  { label: 'Arqueológico', value: 'Arqueologico' },
  { label: 'Museológico', value: 'MuseuLogico' },
  { label: 'Arquivístico-Documental', value: 'Arquivistico-Documental' },
];

const mostrarCamposOpcionais = ref(false);
const useFileUpload = ref<boolean[]>([]);
const thumbnails = ref<(string | null)[]>([]);

function addContentUrl() {
  objeto.value.contentUrl.push('');
  useFileUpload.value.push(false);
  thumbnails.value.push(null);
}

function handleFileUpload(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        objeto.value.contentUrl[index] = reader.result as string;
        thumbnails.value[index] = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  }
}

function isImage(file: string | null): boolean {
  return file ? file.startsWith('data:image') : false;
}

function onNodeSelect() {
  ClasseSelecionada.value = encontrarClassePorLabel(
    selectedNode.value,
    listaClasses.value
  );
  uri.value = ClasseSelecionada.value.uri;
}

function submitForm() {
  fetch('https://sua-api-endpoint/objetos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(objeto.value),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Objeto criado com sucesso:', data);
      router.push('/objetos');
    })
    .catch((error) => {
      console.error('Erro ao criar objeto:', error);
    });
}

async function PesquisarClasses() {
  try {
    const response = await axios.post<ClassQueryResult>(
      'https://localhost:5000/classapi/listar_classes',
      {
        keyword: keyword.value,
        orderby: 'subclassof',
      }
    );

    listaClasses.value = [];
    response.data.results.bindings.forEach((item) => {
      const classItem: ClasseComum = {
        uri: item.class.value,
        label: item.label ? item.label.value : '',
        description: item.description ? item.description.value : '',
        subclassof: item.subclassof ? item.subclassof.value : '-',
        mae_curta: textoAposUltimoChar(
          item.subclassof ? item.subclassof.value : '-',
          '#'
        ),
        nome_curto: textoAposUltimoChar(item.class.value, '#'),
      };
      listaClasses.value.push(classItem);
    });

    ClasseSelecionada.value = listaClasses.value[0];
    arvoreClasses.value = organiza_arvore(listaClasses.value);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

onBeforeMount(() => {
  PesquisarClasses();
});
</script>
<style src="./criar-objeto.css"></style>
