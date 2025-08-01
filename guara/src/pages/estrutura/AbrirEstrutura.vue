<script setup lang="ts">
import { onBeforeMount, watch, reactive, ref, computed } from 'vue';
import axios from 'axios';

import { useQuasar } from 'quasar';

import { useDadosRepositorio } from 'src/stores/repositorio-store';
import { listarClasses } from 'src/services/api';
import { useAuthStore } from 'src/stores/auth-store';
import { textoAposUltimoChar } from '../funcoes';
import { ClasseComum, ClassQueryResult, Coluna, TreeNode } from '../tipos';
import apiConfig from 'src/apiConfig';

const dialogOpen = ref<boolean>(false);
const editMode = ref<boolean>(false);

const authStore = useAuthStore();

const novaClasse = reactive<ClasseComum>({
  label: '',
  description: '',
  subclassof: '',
  uri: '',
  mae_curta: '',
  nome_curto: '',
});
const selectedNode = ref<string>('');
const classeMaeSelecionada = ref<ClasseComum | null>(null);
// Lista de classes mãe disponíveis (para selecionar a subClassOf)
function onNodeSelect() {
  classeMaeSelecionada.value = encontrarClassePorLabel(selectedNode.value);
}
function encontrarClassePorLabel(label: string): ClasseComum {
  const data = listaClassesMae.value.find(
    (classe) => classe.nome_curto === label
  );
  if (data) {
    return data;
  } else {
    return {
      uri: '',
      label: '',
      description: '',
      subclassof: '',
      mae_curta: '',
      nome_curto: '',
    };
  }
}

const selectedClassUri = computed({
  get() {
    return classeMaeSelecionada.value ? classeMaeSelecionada.value.uri : '';
  },
  set(value) {
    if (classeMaeSelecionada.value) {
      classeMaeSelecionada.value.uri = value;
    }
  },
});

function encontrarClassePorUri(uri: string): ClasseComum {
  const data = listaClassesMae.value.find((classe) => classe.uri === uri);

  if (data) {
    return data;
  } else {
    return {
      uri: '',
      label: '',
      description: '',
      subclassof: '',
      mae_curta: '',
      nome_curto: '',
    };
  }
}
const listaClassesMae = ref<ClasseComum[]>([]);
const keyword = ref<string>('');

const listaClasses = ref<ClasseComum[]>([]);
const arvoreClasses = ref<TreeNode[]>([]);

const columns = [
  { name: 'label', label: 'Nome', align: 'left', field: 'label' },
  {
    name: 'description',
    label: 'Descrição',
    align: 'left',
    field: 'description',
  },
  {
    name: 'subclassof',
    label: 'Classe Mãe',
    align: 'left',
    field: 'mae_curta',
  },
  { name: 'acoes', label: 'Ações', align: 'center' },
] as Coluna[];

function organiza_arvore(lista: ClasseComum[]) {
  lista.forEach((classItem) => {
    if (classItem.subclassof == '-') {
      arvoreClasses.value.push({
        label: classItem.nome_curto,
        icon: 'home',
        displayLabel: classItem.label,
        children: [],
        classData: classItem,
      });
    }
  });

  lista.forEach((classItem) => {
    if (classItem.subclassof !== '-') {
      const parent = findParentNode(arvoreClasses.value, classItem.mae_curta);
      if (parent) {
        parent.children.push({
          label: classItem.nome_curto,
          icon: 'description',
          displayLabel: classItem.label,
          classData: classItem,
          children: [],
        });
      }
    }
  });
}

function findParentNode(nodes: TreeNode[], parentLabel: string): any {
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
async function listarClasseMae() {
  try {
    const repositorioConectado =
      authStore && authStore.get && authStore.get.repositorio_conectado;

    if (!repositorioConectado || !repositorioConectado.uri) {
      console.error('A URI ou repositorio_conectado não estão definidos.');
      return; // Interrompe a execução caso não tenha URI
    }

    const uri = await authStore.get.repositorio_conectado.uri;
    if (!uri) {
      console.error('A URI não está preenchida.');
      return; // Interrompe a execução se a uri não estiver preenchida
    }

    const response = await axios.post<ClassQueryResult>(
      apiConfig.endpoints.class.list,
      {
        keyword: keyword.value,
        orderby: 'subclassof',
        repository: uri,
      }
    );
    arvoreClasses.value = [];
    listaClassesMae.value = [];
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
      listaClassesMae.value.push(classItem);
    });
    classeMaeSelecionada.value = listaClassesMae.value[0];
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
  editMode.value = false;
}

async function excluir_classe(row: ClasseComum) {
  try {
    console.log('repo', authStore.get.repositorio_conectado.uri);
    const confirmDelete = window.confirm(
      `Você realmente deseja excluir a classe ${row.label}?`
    );
    if (!confirmDelete) {
      return;
    }
    const data = {
      label: row.uri,
      repository: authStore.get.repositorio_conectado.uri,
    };
    const response = await axios.delete(
      'http://localhost:5000/classapi/excluir_classe',
      { data }
    );

    if (response.status === 200) {
      showNotif('Classe excluída com sucesso!');
    } else {
      showNotif('Erro ao excluir a classe');
    }

    await search();
    await listarClasseMae();
    closeDialog();
  } catch (error: any) {
    showNotif(`Erro ao tentar excluir: ${error.message}`);
  }
}

async function gravarClasse() {
  try {
    const subClassOfValue = textoAposUltimoChar(
      classeMaeSelecionada.value?.uri,
      '#'
    );

    const data = {
      label: novaClasse.label,
      comment: novaClasse.description,
      subclassof: subClassOfValue,
      repository: authStore.get.repositorio_conectado.uri,
    };

    const url = editMode.value
      ? 'http://localhost:5000/classapi/alterar_classe'
      : 'http://localhost:5000/classapi/adicionar_classe';
    const response = await axios.post(url, data);

    if (response.status === 200) {
      showNotif(
        editMode.value
          ? 'Classe editada com sucesso!'
          : 'Classe criada com sucesso!'
      );
    } else {
      showNotif('Erro ao salvar a classe');
    }

    await search();
    closeDialog();
  } catch (error: any) {
    showNotif(`Erro ao tentar gravar: ${error.message}`);
  }
}
async function search() {
  listaClasses.value = await listarClasses(keyword.value);
}
async function editClass(row: ClasseComum) {
  editMode.value = true;
  novaClasse.label = row.label;
  novaClasse.description = row.description;
  novaClasse.uri = row.uri;
  novaClasse.subclassof = row.subclassof;
  novaClasse.nome_curto = row.nome_curto;
  novaClasse.mae_curta = row.mae_curta;
  selectedNode.value = row.mae_curta;
  classeMaeSelecionada.value = encontrarClassePorUri(row.subclassof);
  dialogOpen.value = true;
}
function abrirDialogoNovaClasse() {
  editMode.value = false;
  novaClasse.label = '';
  novaClasse.description = '';
  novaClasse.nome_curto = '';
  novaClasse.subclassof = '';
  novaClasse.mae_curta = '';
  dialogOpen.value = true;
}
const $q = useQuasar();
const showNotif = (mensagem: any) => {
  $q.notify({
    message: mensagem,
    color: 'purple',
  });
};

onBeforeMount(() => {
  listarClasseMae();
});

watch(
  () => authStore.repositorio_conectado,
  (newVal) => {
    if (newVal && newVal.uri) {
      listarClasseMae();
    }
  },
  { immediate: true }
);
</script>

<template>
  <q-page class="q-pa-sm">
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-xs-6 col-md-6 col-lg-2">
        <q-input
          label="palavra-chave"
          outlined
          dense
          v-model="keyword"
          @keyup.enter="search"
          style="color: black; font-size: smaller"
        />
      </div>
      <div class="col-xs-6 col-md-6 col-lg-2">
        <q-btn @click="search" color="teal" label="Pesquisar" icon="search" />
      </div>
    </div>

    <q-card>
      <q-table
        :rows="listaClasses"
        :columns="columns"
        row-key="id"
        striped
        title="Classes do acervo"
        wrap-cells
      >
        <template v-slot:body-cell-acoes="props">
          <q-td :props="props">
            <q-btn
              dense
              color="blue-9"
              icon="edit"
              @click="editClass(props.row)"
              title="alterar a classe"
            />
            <q-btn
              dense
              color="purple-6 "
              icon="format_list_bulleted"
              @click="editClass(props.row)"
              title="ir para os objetos desta coleção"
            />
            <q-btn
              dense
              color="red-7"
              icon="delete"
              @click="excluir_classe(props.row)"
              title="excluir definitivamente essa classe"
            />
          </q-td>
        </template>
      </q-table>

      <q-dialog v-model="dialogOpen" class="q-pa-md scroll" persistent>
        <q-card style="width: 80vw; max-width: 90vw; max-height: 90vh">
          <q-toolbar>
            <q-toolbar-title>{{
              editMode ? 'Editar Classe' : 'Adicionar nova classe'
            }}</q-toolbar-title>
            <q-btn icon="close" flat round dense @click="closeDialog" />
          </q-toolbar>
          <q-card-section>
            <q-input
              v-model="novaClasse.label"
              outlined
              dense
              label="Nome da Classe"
            />
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="novaClasse.description"
              outlined
              dense
              autogrow
              label="Descrição da Classe"
            />
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="selectedClassUri"
              readonly
              outlined
              dense
              label="Classe mãe selecionada"
            />
            <q-tree
              :nodes="arvoreClasses"
              node-key="label"
              v-model:selected="selectedNode"
              @update:selected="onNodeSelect"
            />
          </q-card-section>
          <q-separator></q-separator>
          <q-card-actions align="right">
            <q-btn label="Cancelar" color="negative" @click="closeDialog" />
            <q-btn label="Salvar" color="primary" @click="gravarClasse" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-card-actions>
        <q-btn
          @click="abrirDialogoNovaClasse"
          color="primary"
          label="Nova Classe"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>
