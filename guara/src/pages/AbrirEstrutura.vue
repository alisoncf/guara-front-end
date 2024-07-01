<template>
  <q-page class=" q-pa-md q-my-lg" style="min-height: 80vh;">
    <div class="organizacao-estrutura">
      <div class="organizacao-titulo">Organização e estrutura do espaço</div>

    </div>

    <q-card class="full-width, full-height">

      <q-card-section>
        <q-input
          outlined
          dense
          v-model="keyword"
          @keyup.enter="search"
        />
        <q-btn @click="search" color="teal" label="Pesquisar" icon="search" class="q-ml-md" />
        <q-btn @click="openCreateClassDialog" color="primary" label="Nova Classe" />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          :rows="listaClasses"
          :columns="columns"
          row-key="id"
          class="tabela-classes"
          striped
          title="Classes do acervo que agrupam objetos digitais"
        >
          <template v-slot:body-cell-acoes="props">
            <q-td :props="props" class="bg-transparent">
              <q-btn dense color="blue-9" icon="edit" @click="editClass(props.row)" />
              <q-btn dense color="green-7" icon="folder_open" @click="openCollection(props.row)" />
              <q-btn dense color="red-7" icon="delete" @click="openCollection(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <q-dialog v-model="dialogOpen" >
      <q-card  >
        <q-toolbar>
          <q-toolbar-title>Adicionar nova classe</q-toolbar-title>
          <q-btn icon="close" flat round dense @click="closeDialog" />
        </q-toolbar>
        <q-card-section>
          <q-input v-model="novaClasse.label" outlined dense label="Nome da Classe" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="novaClasse.description" outlined dense label="Descrição da Classe" />
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="novaClasse.subclassof"
            outlined
            dense
            label="Classe Mãe"
            :options="listaClassesMae"
            option-value="class"
            option-label="label"
          />
        </q-card-section>
        <q-card-section >

          <q-tree

            :nodes="arvoreClasses"
            node-key="label"
            v-model:selected="selectedNode"
            @update:selected="onNodeSelect"
          />
          <div>{{ selectedNode }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancelar" color="negative" @click="closeDialog" />
          <q-btn label="Salvar" color="primary" @click="saveNewClass" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Tabela de classes existentes -->
    <q-card class="full-width, full-height">
      <!-- Restante do seu código para a tabela de classes -->
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import axios from 'axios';

import { Coluna, ClasseComum, ClassQueryResult, TreeNode } from './tipos';
const dialogOpen = ref<boolean>(false);

// Estado da nova classe a ser criada
const novaClasse = reactive<ClasseComum>({
  label: '',
  description: '',
  subclassof: '',
  class: '',
  mae_curta: '',
  nome_curto: ''
});
const selectedNode = ref(null)
const classeMaeSelecionada = ref<ClasseComum>();
// Lista de classes mãe disponíveis (para selecionar a subClassOf)
function onNodeSelect() {
  classeMaeSelecionada.value='';//aqui
}


const listaClassesMae = ref<ClasseComum[]>([]);
const keyword = ref<string>('');


const listaClasses = ref<ClasseComum[]>([]);
const arvoreClasses = ref<TreeNode[]>([]);

const columns = [
  { name: 'label', label: 'Nome', align: 'left', field: 'label' },
  { name: 'description', label: 'Descrição', align: 'left', field: 'description' },
  { name: 'subclassof', label: 'Classe Mãe', align: 'left', field: 'mae_curta' },
  { name: 'acoes', label: 'Ações', align: 'center' }
] as Coluna[];

function organiza_arvore(lista: ClasseComum[]) {

  let raiz = '';
  lista.forEach(classItem => {
    if(classItem.subclassof=='-'){
        arvoreClasses.value.push({
          label: classItem.nome_curto,
          icon: 'home',
          displayLabel: classItem.label,
          children: [],
          classData: classItem,
        });
        raiz = classItem.nome_curto;
    }


  });

  lista.forEach(classItem => {
  if (classItem.subclassof !== '-') {
    const parent = findParentNode(arvoreClasses.value, classItem.mae_curta);
    if (parent) {
      parent.children.push({
        label: classItem.nome_curto,
        icon: 'description',
        displayLabel: classItem.label,
        classData: classItem,
        children: []
      });
    }
  }
});
  return ;
}

function findParentNode(nodes, parentLabel) {
  for (let node of nodes) {
    if (node.label === parentLabel) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const result = findParentNode(node.children, parentLabel);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
async function loadParentClasses() {
  try {
    const response =
      await axios.post<ClassQueryResult>('http://localhost:5000/classapi/listar_classes', {
        keyword: keyword.value,
        orderby: 'subclassof',
      });
    arvoreClasses.value = [];
    listaClassesMae.value = [];
    response.data.results.bindings.forEach((item) => {
      console.log(item);
      const classItem: ClasseComum = {
        class: item.class.value,
        label: item.label ? item.label.value : '',
        description: item.description ? item.description.value : '',
        subclassof: item.subclassof ? item.subclassof.value : '-',
        mae_curta: textoAposUltimoChar(item.subclassof ? item.subclassof.value : '-', '#'),
        nome_curto: textoAposUltimoChar(item.class.value, '#')
      };

      listaClassesMae.value.push(classItem);
    });
    organiza_arvore(listaClassesMae.value);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}


function selectParentClass(node: any) {
  novaClasse.subclassof = node.class;
  alert('')
}
function closeDialog() {
  dialogOpen.value = false;
  // Limpar os dados da nova classe
  novaClasse.label = '';
  novaClasse.class = '';
  novaClasse.subclassof = '';
  novaClasse.nome_curto = '',
  novaClasse.mae_curta = ''

}

// Função para salvar a nova classe
async function saveNewClass() {
  try {
    const response = await axios.post('http://localhost:5000/classapi/criar_classe', {
      label: novaClasse.label,
      comment: novaClasse.description,
      subClassOf: novaClasse.subclassof
    });
    console.log('Nova classe criada:', response.data);


    await search();
    closeDialog(); // Fechar o diálogo após salvar

  } catch (error) {
    console.error('Erro ao salvar nova classe:', error);
  }
}

async function search() {
  try {
    const response =
      await axios.post<ClassQueryResult>('http://localhost:5000/classapi/listar_classes', {
        keyword: keyword.value,
      });

    listaClasses.value = [];
    response.data.results.bindings.forEach((item) => {
      console.log(item);
      const classItem: ClasseComum = {
        class: item.class.value,
        label: item.label ? item.label.value : '',
        description: item.description ? item.description.value : '',
        subclassof: item.subclassof ? item.subclassof.value : '-',
        mae_curta: textoAposUltimoChar(item.subclassof ? item.subclassof.value : '-', '#'),
        nome_curto: textoAposUltimoChar(item.class.value, '#')
      };
      listaClasses.value.push(classItem);
    });
    console.log(listaClasses.value);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

function textoAposUltimoChar(texto: string, char: string) {
  const ultimaBarraIndex = texto.lastIndexOf(char);
  if (ultimaBarraIndex === -1) {
    return texto;
  }
  return texto.substring(ultimaBarraIndex + 1);
}

function editClass(row: ClasseComum) {
  // Função para editar a classe selecionada
  console.log('Editar classe:', row);
  // Aqui você pode abrir um formulário de edição
}

function openCollection(row: ClasseComum) {
  // Função para abrir a coleção da classe selecionada
  console.log('Abrir coleção da classe:', row);
  // Aqui você pode navegar para outra página ou abrir um modal com a coleção
}
function openCreateClassDialog() {
  console.log('Abrir diálogo para criar nova classe');
  loadParentClasses();
  dialogOpen.value = true;

}


</script>



<style scoped>
.q-page {
  min-height: 80vh; /* Ajuste a altura mínima conforme necessário */
}
.q-card {
  width: 100%;
}
.q-table {
  background-color: white; /* Fundo branco para a tabela */
  color: black; /* Cor do texto preta */
}
.q-table th,
.q-table td {
  background-color: white; /* Fundo branco para as células */
  color: black; /* Cor do texto preta */
}
.q-table tbody tr:nth-child(odd) td {
  background-color: #f0f0f0; /* Cor de fundo para linhas ímpares */
}
.q-table tbody tr:nth-child(even) td {
  background-color: white; /* Cor de fundo para linhas pares */
}
.body-2 {
  font-size: 14px !important; /* Tamanho da fonte menor */
}

.organizacao-estrutura {
  background-color: #f0f0f0; /* Cor de fundo destacada */
  padding: 10px; /* Espaçamento interno */
  margin-bottom: 20px; /* Margem inferior */
}

.organizacao-titulo {
  font-size: 1.5rem; /* Tamanho do título */
  font-weight: bold; /* Negrito */
  color: #333; /* Cor do texto */
  text-align: left; /* Alinhamento à esquerda */
  margin-bottom: 10px; /* Margem inferior */
}

.tabela-classes {
  height: calc(100vh - 230px); /* Ajuste a altura da tabela conforme necessário */
  overflow-y: auto; /* Adicionar scroll vertical se necessário */
}
</style>


<style scoped>
.q-page {
  min-height: 80vh;
}

.organizacao-estrutura {
  background-color: #f0f0f0;
  padding: 10px;
  margin-bottom: 20px;
}

.organizacao-titulo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-align: left;
  margin-bottom: 10px;
}
</style>

