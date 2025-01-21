<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import {
  atualizarObjetoFisico,
  gravarObjetoFisico,
} from "src/services/objeto-fisico-api";
import { listarClasses } from "src/services/api";
import { ObjetoFisico } from "./manter-objeto";
import { organiza_arvore, encontrarClassePorLabel } from "../funcoes";
import { ClasseComum, TreeNode } from "../tipos";
import { useDadosObjetoFisico } from "src/stores/objeto-fisico";
import { useRouter } from 'vue-router';
import { Dialog } from "quasar";
const router = useRouter();

const listaClasses = ref<ClasseComum[]>([]);
const ClasseSelecionada = ref<ClasseComum>();
const arvoreClasses = ref<TreeNode[]>([]);
const keyword = ref<string>("");
const uri = ref<string>("");
const useObjetoStore = useDadosObjetoFisico();

const selectedNode = ref<string>("");
const objeto = ref<ObjetoFisico>({
  id: "",
  obj: "",
  resumo: "",
  titulo: "",
  descricao: "",
  tipoFisico: [],
  altura: 0,
  dataCriacao: "",
  dataModificacao: "",
  largura: 0,
  material: "",
  profundidade: 0,
  peso: 0,
  assunto: "",
  temRelacao: [],
  colecao: "",
  associatedMedia: [],
  tipoFisicoAbreviado: [],
});

const tipos = [
  { label: 'Bibliotecário', value: 'Bibliotecario' },
  { label: 'Arqueológico', value: 'Arqueologico' },
  { label: 'Museológico', value: 'MuseuLogico' },
  { label: 'Arquivístico-Documental', value: 'Arquivistico-Documental' },
  { label: 'Imagético-Sonoro', value: 'Imagetico-Sonoro' },
];

function onNodeSelect() {
  ClasseSelecionada.value = encontrarClassePorLabel(
    selectedNode.value,
    listaClasses.value
  );
  uri.value = ClasseSelecionada.value.uri;
  objeto.value.colecao = ClasseSelecionada.value.uri;
}
function cancelar() {
  if (
    objeto.value.descricao !== '' ||
    objeto.value.titulo !== '' ||
    objeto.value.resumo !== ''
  ) {
    Dialog.create({
      title: 'Confirmação',
      message: 'Os dados não foram gravados. Tem certeza que deseja sair do formulário?',
      cancel: true,
      persistent: true,
    })
    .onOk(() => {
      router.go(-1); // Voltar para a tela anterior
    })
    .onCancel(() => {
      console.log('Usuário cancelou a saída');
    });
  } else {
    router.back();
  }
}
function submitForm() {
  gravarObjetoFisico(objeto.value);
}
function atualizarObj() {
  atualizarObjetoFisico(objeto.value);
}
async function PesquisarClasses() {
  try {
    listaClasses.value = await listarClasses(keyword.value);
    console.log(listaClasses);
    ClasseSelecionada.value = listaClasses.value[0];
    arvoreClasses.value = organiza_arvore(listaClasses.value);
  } catch (error) {}
}

onBeforeMount(() => {
  PesquisarClasses();
  if (useObjetoStore.getObjeto.id) {
    objeto.value = { ...useObjetoStore.getObjeto };
    selectedNode.value = objeto.value.colecao; // Define a classe selecionada
    uri.value = objeto.value.colecao; // Atualiza o campo de URI
    objeto.value.tipoFisico = Array.isArray(objeto.value.tipoFisico)
      ? [...objeto.value.tipoFisico]
      : [];
  }
});
</script>
<style src="./criar-objeto.css"></style>
<template>
  <q-page>
    <q-toolbar class="bg-secondary text-white">
      <q-toolbar-title v-if="objeto.id==''" >Criar um novo objeto</q-toolbar-title>
      <q-toolbar-title v-if="objeto.id!=''" >Objeto Id: {{ objeto.id }} </q-toolbar-title>
    </q-toolbar>
    <q-form @submit.prevent="submitForm" class="q-gutter-md">
      <div class="criar-objeto-container">
        <q-card class="q-pa-md">
          <q-card-section>
            <q-form @submit.prevent="submitForm">
              <div class="q-gutter-x-md">
                <div>
                  <q-select
                    v-model="objeto.tipoFisicoAbreviado"
                    :options="tipos"
                    label="Tipos de Objeto"
                    multiple
                    emit-value
                    use-chips
                    map-options
                    hint="Escolha um ou mais tipos do objeto"
                  />
                </div>
              </div>
              <div v-if="objeto.id != ''">
                <div>Tipos gravados:</div>
                <div>{{ objeto.tipoFisicoAbreviado }}</div>
              </div>

              <q-tree
                :nodes="arvoreClasses"
                node-key="label"
                v-model:selected="selectedNode"
                @update:selected="onNodeSelect"
                hint="inform a classe a qual o objeto pertence no acervo"
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
              <q-btn-group flat push>
                <q-btn
                  type="submit"
                  label="Gravar Novo Objeto"
                  color="primary"
                  v-if="objeto.id == ''"
                />
                <q-btn
                  @click="cancelar()"
                  label="Cancelar"
                  color="secondary"
                  v-if="objeto.id == ''"
                />
                <q-btn
                  @click="atualizarObj"
                  label="Atualizar Objeto"
                  color="green-8"
                  v-if="objeto.id != ''"
                />
                <q-btn
                  @click="$router.go(-1)"
                  label="Voltar"
                  color="secondary"
                  v-if="objeto.id != ''"
                />
              </q-btn-group>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </q-form>
  </q-page>
</template>
