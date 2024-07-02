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
          <q-item-label header>Escolha uma classe mãe</q-item-label>

          <q-tree
            :nodes="arvoreClasses"
            node-key="label"
            v-model:selected="selectedNode"
            @update:selected="onNodeSelect"
          />
        </q-card-section>
        <div class=" q-pa-md q-my-lg">{{ classeMaeSelecionada?.uri }}</div>
        <q-separator></q-separator>
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
import {useQuasar } from 'quasar';
const dialogOpen = ref<boolean>(false);



const novaClasse = reactive<ClasseComum>({
  label: '',
  description: '',
  subclassof: '',
  uri: '',
  mae_curta: '',
  nome_curto: ''
});
const selectedNode = ref<string>('')
const classeMaeSelecionada = ref<ClasseComum|null>(null);
// Lista de classes mãe disponíveis (para selecionar a subClassOf)
function onNodeSelect() {
  classeMaeSelecionada.value = encontrarClassePorLabel(selectedNode.value);
}
function encontrarClassePorLabel(label: string ): ClasseComum {
  const data = listaClassesMae.value.find(classe => classe.nome_curto === label);
  if (data){
    return data;
  }else{
    return {
      uri: '', label: '', description: '', subclassof: '', mae_curta: '',  nome_curto: ''
    };
  }

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
  lista.forEach(classItem => {
    if(classItem.subclassof=='-'){
        arvoreClasses.value.push({
          label: classItem.nome_curto,
          icon: 'home',
          displayLabel: classItem.label,
          children: [],
          classData: classItem,
        });
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

}

function findParentNode(nodes: TreeNode[], parentLabel: string ): any {
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

      const classItem: ClasseComum = {
        uri: item.class.value,
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



function closeDialog() {
  dialogOpen.value = false;
  novaClasse.label = '';
  novaClasse.uri = '';
  novaClasse.subclassof = '';
  novaClasse.nome_curto = '';
  novaClasse.mae_curta = '';

}

// Função para salvar a nova classe
async function saveNewClass() {
  try {
    const subClassOfValue = textoAposUltimoChar(classeMaeSelecionada.value?.uri,'#');

    const data =
      {label: novaClasse.label,
      comment: novaClasse.description,
      subclassof: subClassOfValue };

      const response = await axios.post(
        'http://localhost:5000/classapi/adicionar_classe', data);


    if (response.status === 200) {
      showNotif('Classe gravada com sucesso!')
    } else {
      showNotif('Erro ao criar classe');
    }
    await search();
    closeDialog();
  } catch (error: any) {
    showNotif(`Erro ao tentar gravar: ${error.message}`);
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

      const classItem: ClasseComum = {
        uri: item.class.value,
        label: item.label ? item.label.value : '',
        description: item.description ? item.description.value : '',
        subclassof: item.subclassof ? item.subclassof.value : '-',
        mae_curta: textoAposUltimoChar(item.subclassof ? item.subclassof.value : '-', '#'),
        nome_curto: textoAposUltimoChar(item.class.value, '#')
      };
      listaClasses.value.push(classItem);
    });

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

function textoAposUltimoChar(texto: any, char: any) {
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

  console.log('Abrir coleção da classe:', row);

}
function openCreateClassDialog() {

  loadParentClasses();
  dialogOpen.value = true;

}
const $q = useQuasar()
const showNotif =  (mensagem: any) => {
  $q.notify({
    message: mensagem,
    color: 'purple'
  });
};
</script>
<style src="./AbrirEstrutura.css"></style>
