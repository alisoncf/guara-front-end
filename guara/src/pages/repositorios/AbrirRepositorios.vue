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

const curadorDialogOpen = ref<boolean>(false);
const novoRepoSlug = ref<string>('');
const curador = reactive({
  username: '',
  email: '',
  password: '',
  permissao: 'curador',
});
const opcoesPermissao = ['curador', 'admin'];

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
      contato: repositorio.contato,
      descricao: repositorio.descricao,
      responsavel: repositorio.responsavel,
    };

    if (editMode.value) {
      // TODO: /repositorios não tem rota de update ainda.
      showNotif('Edição de repositório ainda não está disponível');
      return;
    }

    const response = await axios.post(
      apiConfig.endpoints.repositorio.create,
      data,
      {
        headers: {
          Authorization: 'Bearer ' + auth.token,
        },
      }
    );

    if (response.status === 200) {
      const slug = response.data.slug;
      if (arquivo.value && slug) {
        await enviarAvatar(slug);
      }
      if (response.data.aviso) {
        showNotif(response.data.message);
      } else {
        showNotif('Repositório criado com sucesso!');
      }
      await search();
      closeDialog();
      if (slug) {
        abrirCuradorDialog(slug);
      }
      return;
    } else {
      showNotif('Erro ao salvar o repositório');
    }

    await search();
    closeDialog();
  } catch (error: any) {
    showNotif(`Erro ao tentar gravar: ${error.message}`);
  }
}

function closeCuradorDialog() {
  curadorDialogOpen.value = false;
}

function slugDaUri(uri: string) {
  return uri.replace(/\/$/, '').split('/').pop() || '';
}

function abrirCuradorDialog(slug: string) {
  novoRepoSlug.value = slug;
  curador.username = '';
  curador.email = '';
  curador.password = '';
  curador.permissao = 'curador';
  curadorDialogOpen.value = true;
}

async function salvarCurador() {
  try {
    await axios.post(
      apiConfig.endpoints.addUser,
      {
        username: curador.username,
        email: curador.email,
        password: curador.password,
        permissao: curador.permissao,
        repo: novoRepoSlug.value,
      },
      {
        headers: {
          Authorization: 'Bearer ' + auth.token,
        },
      }
    );
    showNotif('Curador criado com sucesso!');
    closeCuradorDialog();
  } catch (error: any) {
    showNotif(`Erro ao criar curador: ${error.message}`);
  }
}

async function enviarAvatar(slug: string) {
  try {
    const formData = new FormData();
    formData.append('uri', slug);
    formData.append('avatar', arquivo.value as unknown as Blob);
    await axios.post(apiConfig.endpoints.repositorio.uploadAvatar, formData, {
      headers: {
        Authorization: 'Bearer ' + auth.token,
      },
    });
  } catch (error: any) {
    showNotif(`Repositório criado, mas falhou ao enviar o avatar: ${error.message}`);
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
  novoRepoSlug.value = slugDaUri(row.uri);

  dialogOpen.value = true;
}

function criarCuradorParaRepoAtual() {
  closeDialog();
  abrirCuradorDialog(novoRepoSlug.value);
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
            v-model="repositorio.contato"
            outlined
            dense
            label="Contato"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="repositorio.responsavel"
            outlined
            dense
            label="Responsável"
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
          <q-btn
            v-if="editMode"
            label="Criar curador"
            color="secondary"
            icon="person_add"
            @click="criarCuradorParaRepoAtual"
          />
          <q-btn label="Cancelar" color="negative" @click="closeDialog" />
          <q-btn label="Salvar" color="primary" @click="saveRepo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="curadorDialogOpen">
      <q-card style="min-width: 500px">
        <q-toolbar>
          <q-toolbar-title
            >Criar curador para "{{ novoRepoSlug }}"</q-toolbar-title
          >
          <q-btn icon="close" flat round dense @click="closeCuradorDialog" />
        </q-toolbar>
        <q-card-section>
          Criar um usuário curador vinculado a este repositório.
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="curador.username"
            outlined
            dense
            label="Nome de usuário"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="curador.email"
            type="email"
            outlined
            dense
            label="E-mail"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="curador.password"
            type="password"
            outlined
            dense
            label="Senha"
          />
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="curador.permissao"
            :options="opcoesPermissao"
            outlined
            dense
            label="Permissão"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Deixar para depois"
            color="negative"
            @click="closeCuradorDialog"
          />
          <q-btn
            label="Criar curador"
            color="primary"
            @click="salvarCurador"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Tabela de classes existentes -->
    <q-card class="full-width">
      <!-- Restante do seu código para a tabela de classes -->
    </q-card>
  </q-page>
</template>
