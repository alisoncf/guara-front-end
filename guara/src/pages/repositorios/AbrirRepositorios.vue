<script setup lang="ts">
import { onBeforeMount, reactive, ref } from 'vue';
import axios from 'axios';
import { Coluna } from '../tipos';
import { useQuasar } from 'quasar';

import { listarRepositorios } from 'src/services/api';
import { Repositorio } from '../tipos';
import { useDadosRepositorio } from 'src/stores/repositorio-store';
import apiConfig from 'src/apiConfig';
import { useAuthStore } from 'src/stores/auth-store';

const dialogOpen = ref<boolean>(false);
const editMode = ref<boolean>(false);
const repoStore = useDadosRepositorio();
const auth = useAuthStore();
const listaRepositorios = ref<Repositorio[]>([]);
const arquivo = ref(null);
const repositorio = reactive<Repositorio>({
  contato: '',
  descricao: '',
  nome: '',
  uri: '',
  responsavel: '',
  imagem: '',
});

const columns = [
  { name: 'nome', label: 'Nome', align: 'left', field: 'nome' },

  {
    name: 'descricao',
    label: 'Descrição',
    align: 'left',
    field: 'descricao',
  },
  {
    name: 'uri',
    label: 'URI',
    align: 'left',
    field: 'uri',
  },
  { name: 'acoes', label: 'Ações', align: 'center' },
] as Coluna[];

function closeDialog() {
  dialogOpen.value = false;

  editMode.value = false;
}

async function saveRepo() {
  try {
    const data = {
      nome: repositorio.nome,
      uri: repositorio.nome,
      descricao: repositorio.descricao,
      responsavel: repositorio.responsavel,
    };

    const url = editMode.value
      ? apiConfig.endpoints.repositorio.update
      : apiConfig.endpoints.repositorio.create;
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
  listaRepositorios.value = [];
  listaRepositorios.value = await listarRepositorios('');
  console.log('lista repo', listaRepositorios.value);
}

async function editRepo(row: Repositorio) {
  editMode.value = true;
  repositorio.nome = row.nome;
  repositorio.contato = row.contato;
  repositorio.descricao = row.descricao;
  repositorio.responsavel = row.responsavel;
  repositorio.uri = row.uri;

  dialogOpen.value = true;
}
async function selecionarRepo(row: Repositorio) {
  repoStore.set(row);
}

function openCreateClassDialog() {
  editMode.value = false;

  dialogOpen.value = true;
}
const $q = useQuasar();
const showNotif = (mensagem: any) => {
  $q.notify({
    message: mensagem,
    color: 'purple',
  });
};
function mostraArquivo() {
  if (arquivo.value) {
    repositorio.imagem = URL.createObjectURL(arquivo.value);
    console.log('imagem preview:', repositorio.imagem);
  }
}
onBeforeMount(() => {
  return;
});
</script>

<template>
  <q-page class="q-pa-md q-my-lg">
    <q-card class="q-pa-md q-mb-lg">
      <div class=""></div>
      <q-card-section title="Repositórios Amigos">
        <q-btn
          @click="search"
          color="teal"
          label="Pesquisar"
          icon="search"
          class="q-ml-md"
        />
        <q-btn
          @click="openCreateClassDialog"
          color="primary"
          label="Novo Repositório"
        />
      </q-card-section>
      <q-card-section>
        Repositório selecionado: {{ repoStore.get.nome }} -
        {{ repoStore.get.uri }}
        <q-table
          :rows="listaRepositorios"
          :columns="columns"
          row-key="id"
          class="tabela-repo"
          striped
          title="Repositórios Disponíveis"
        >
          <template v-slot:body-cell-acoes="props">
            <q-td :props="props">
              <q-btn
                dense
                color="primary"
                icon="check"
                title="selecionar este repositório"
                @click="selecionarRepo(props.row)"
              />
              <q-btn
                dense
                color="secondary"
                icon="edit"
                @click="editRepo(props.row)"
                title="alterar o repositório"
                v-if="auth.user"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <q-dialog v-model="dialogOpen">
      <q-card style="min-width: 500px; min-height: 600px">
        <q-toolbar>
          <q-toolbar-title>{{
            editMode ? 'Editar Repositório' : 'Adicionar novo repositório'
          }}</q-toolbar-title>
          <q-btn icon="close" flat round dense @click="closeDialog" />
        </q-toolbar>
        <q-card-section>
          <q-input
            v-model="repositorio.nome"
            outlined
            dense
            label="Nome do Repositório"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="repositorio.descricao"
            outlined
            dense
            label="Descrição do Repositório"
            autogrow
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="repositorio.uri"
            readonly
            outlined
            dense
            label="URI do Repositório"
          />
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          Imagem
          <div
            v-if="repositorio.imagem"
            class="q-mt-md"
            style="max-width: 200px; max-height: 200px"
          >
            <q-img
              :src="repositorio.imagem"
              contain
              style="
                width: 100%;
                height: 100%;
                border: 1px solid #ccc;
                border-radius: 8px;
              "
            />
          </div>
          <q-file
            filled
            v-model="arquivo"
            label="Selecione uma imagem"
            @update:model-value="mostraArquivo"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancelar" color="negative" @click="closeDialog" />
          <q-btn label="Salvar" color="primary" @click="saveRepo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Tabela de classes existentes -->
    <q-card class="full-width">
      <!-- Restante do seu código para a tabela de classes -->
    </q-card>
  </q-page>
</template>
