<script setup lang="ts">
import { onBeforeMount, reactive, ref, computed } from 'vue';
import axios from 'axios';
import { Coluna, ClasseComum, ClassQueryResult, TreeNode, RepoQueryResult } from './tipos';
import { useQuasar } from 'quasar';
import { textoAposUltimoChar } from './funcoes';
import { listarRepositorios  } from 'src/services/api';
import { Repositorio } from './tipos'

const dialogOpen = ref<boolean>(false);
const editMode = ref<boolean>(false);


const listaRepositorios = ref<Repositorio[]>([]);
const novoRepo = reactive<Repositorio>({
  contato:'',
  descricao: '',
  nome: '',
  uri: '',
  responsavel: '',

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
      nome: novoRepo.nome,
      uri: novoRepo.nome,
      descricao: novoRepo.descricao,
      responsavel: novoRepo.responsavel,
    };

    const url = editMode.value
      ? 'http://localhost:5000/repositorios/alterar_repo'
      : 'http://localhost:5000/repositorios/adicionar_repo';
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
  try {
    const response = await axios.post<RepoQueryResult>(
      'http://localhost:5000/repositorios/listar_repositorios',

    );

    listaRepositorios.value = [];
    response.data.results.bindings.forEach((item) => {
      const classItem: Repositorio = {
        uri: item.uri.value,
        descricao: item.descricao ? item.descricao.value : '',
        contato: item.contato ? item.contato.value : '',
        nome: item.nome ? item.nome.value : '',

        responsavel: item.responsavel ? item.responsavel.value : '',
      };
      listaRepositorios.value.push(classItem);
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

async function editClass(row: Repositorio) {
  editMode.value = true;
  novoRepo.nome = row.nome;
  novoRepo.contato = row.contato;
  novoRepo.descricao = row.descricao;
  novoRepo.responsavel = row.responsavel;
  novoRepo.uri = row.uri;


  dialogOpen.value = true;
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
onBeforeMount(() => {
  return
});
</script>
<style src="./Estilo.css"></style>
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
      <q-card-section >

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
                @click="editClass(props.row)"
                title="selecionar este repositório"
              />
              <q-btn
                dense
                color="blue-9"
                icon="edit"
                @click="editClass(props.row)"
                title="alterar o repositório"
              />


            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <q-dialog v-model="dialogOpen">
      <q-card>
        <q-toolbar>
          <q-toolbar-title>{{
            editMode ? 'Editar Classe' : 'Adicionar nova classe'
          }}</q-toolbar-title>
          <q-btn icon="close" flat round dense @click="closeDialog" />
        </q-toolbar>
        <q-card-section>
          <q-input
            v-model="novoRepo.nome"
            outlined
            dense
            label="Nome do Repositório"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="novoRepo.descricao"
            outlined
            dense
            label="Descrição do Repositório"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="novoRepo.uri"
            readonly
            outlined
            dense
            label="URI do Repositório"
          />

        </q-card-section>
        <q-separator></q-separator>
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

