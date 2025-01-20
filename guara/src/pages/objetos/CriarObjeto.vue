<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount } from 'vue';
import { gravarObjetoFisico, listarClasses } from 'src/services/api';
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

const selectedNode = ref<string>('');
const objeto = ref<ObjetoFisico>({
  id: '',
  obj: '',
  resumo: '',
  titulo: '',
  descricao: '',
  tipoFisico: [],
  altura: 0,
  dataCriacao: '',
  dataModificacao: '',
  largura: 0,
  material: '',
  profundidade: 0,
  peso: 0,
  assunto: '',
  temRelacao: [],
  colecao:'',
  associatedMedia: []
  });

const tipos = [
  { label: 'Bibliotecário', value: 'Bibliotecario' },
  { label: 'Arqueológico', value: 'Arqueologico' },
  { label: 'Museológico', value: 'MuseuLogico' },
  { label: 'Arquivístico-Documental', value: 'Arquivistico-Documental' },
  { label: 'Imagético-Sonoro', value: 'Imagetico-Sonoro' },
];

const mostrarCamposOpcionais = ref(false);

function onNodeSelect() {
  ClasseSelecionada.value = encontrarClassePorLabel(
    selectedNode.value,
    listaClasses.value
  );
  uri.value = ClasseSelecionada.value.uri;
  objeto.value.colecao= ClasseSelecionada.value.uri;
}

function submitForm() {

  gravarObjetoFisico(objeto.value);
}

async function PesquisarClasses() {
  try {
    listaClasses.value = await listarClasses(keyword.value);
    console.log(listaClasses);
    ClasseSelecionada.value = listaClasses.value[0];
    arvoreClasses.value = organiza_arvore(listaClasses.value);
    console.log('arvore:',arvoreClasses.value);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  }
}

onBeforeMount(() => {
  PesquisarClasses();
});
</script>
<style src="./criar-objeto.css"></style>
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
                v-model="objeto.tipoFisico"
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
              v-model="objeto.resumo"
              label="Resumo"
              title="um texto resumido com informações importantes sobre o objeto"
              type="textarea"
            />
            <q-input
              v-model="objeto.descricao"
              label="Descrição"
              type="textarea"
              title="uma descrição detalhada do objeto digital"
            />



            <q-btn type="submit" label="Salvar Objeto" color="primary" />
          </q-form>

        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>


