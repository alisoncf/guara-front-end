<script setup lang="ts">
import { ref, onBeforeMount, watchEffect } from 'vue';
import {
  atualizarObjetoFisico,
  gravarObjetoFisico,
} from 'src/services/objeto-fisico-api';
import { listarClasses } from 'src/services/api';
import {
  mostrarPopUpMidias,
  mostrarPopUpObjetoFis,
  ObjetoFisico,
  somenteLeituraObjeto,
  tipos_fisicos,
  usuarioAdminLogado,
} from './manter-objeto';
import { organiza_arvore, encontrarClassePorLabel } from '../funcoes';
import { ClasseComum, TreeNode } from '../tipos';
import { useDadosObjetoFisico } from 'src/stores/objeto-fisico';

import { Dialog } from 'quasar';

const listaClasses = ref<ClasseComum[]>([]);
const ClasseSelecionada = ref<ClasseComum>();
const arvoreClasses = ref<TreeNode[]>([]);
const keyword = ref<string>('');
const uri = ref<string>('');
const useObjetoStore = useDadosObjetoFisico();
const tipoObjeto = ref('fisico' as string);
const selectedNode = ref<string>('');
const abaObjeto = ref<'basicos' | 'outros'>('basicos');
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
  colecao: '',
  associatedMedia: [],
  tipoFisicoAbreviado: [],
  repositorio: '',
  dimensao: '',
  coordenadas: '',
  fim: '',
  inicio: '',
  lat: '',
  lon: '',
});

function irParaMidias(obj: ObjetoFisico) {
  useObjetoStore.setObjeto(obj);
  mostrarPopUpMidias.value = true;
}

watchEffect(() => {
  if (mostrarPopUpObjetoFis.value) {
    abaObjeto.value = 'basicos';
    carregar();
  }
});
function liberarEdicao() {
  somenteLeituraObjeto.value = false;
}
function onNodeSelect() {
  if (somenteLeituraObjeto.value) {
    return;
  }
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
      message:
        'Os dados não foram gravados. Tem certeza que deseja sair do formulário?',
      cancel: true,
      persistent: true,
    })
      .onOk(() => {
        mostrarPopUpObjetoFis.value = false;
      })
      .onCancel(() => {
        console.log('Usuário cancelou a saída');
      });
  } else {
    mostrarPopUpObjetoFis.value = false;
  }
}
function gravar() {
  if (somenteLeituraObjeto.value) {
    return;
  }
  gravarObjetoFisico(objeto.value);
}
function atualizarObj() {
  if (somenteLeituraObjeto.value) {
    return;
  }
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
function carregar() {
  if (useObjetoStore.getObjeto.id) {
    objeto.value = { ...useObjetoStore.getObjeto };
    selectedNode.value = objeto.value.colecao; // Define a classe selecionada
    uri.value = objeto.value.colecao; // Atualiza o campo de URI
    objeto.value.tipoFisico = Array.isArray(objeto.value.tipoFisico)
      ? [...objeto.value.tipoFisico]
      : [];
  }
}
onBeforeMount(() => {
  PesquisarClasses();
});
</script>

<template>
  <q-dialog v-model="mostrarPopUpObjetoFis" class="q-pa-md scroll" persistent>
    <q-card class="dialogo-objeto-fis">
      <q-toolbar>
        <q-toolbar-title v-if="objeto.id == ''"
          >Criar um novo objeto</q-toolbar-title
        >
        <q-toolbar-title v-else>Id. Objeto: {{ objeto.id }} </q-toolbar-title>

        <q-badge
          v-if="somenteLeituraObjeto"
          color="grey-7"
          label="Somente visualização"
          class="q-mr-md"
        />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <div class="criar-objeto-container">
        <q-card class="q-pa-md" flat>
          <q-card-section>
            <q-form @submit.prevent="gravar">
              <q-tabs
                v-model="abaObjeto"
                class="text-teal"
                align="justify"
                active-color="teal"
                indicator-color="teal"
                dense
              >
                <q-tab name="basicos" label="Dados básicos" />
                <q-tab name="outros" label="Outros dados" />
              </q-tabs>
              <q-separator />
              <q-tab-panels v-model="abaObjeto" animated>
                <q-tab-panel name="basicos">
                  <div class="q-gutter-x-md" v-if="tipoObjeto == 'fisico'">
                    <div>
                      <q-select
                        v-model="objeto.tipoFisicoAbreviado"
                        :options="tipos_fisicos"
                        label="Tipos de Objeto"
                        multiple
                        emit-value
                        use-chips
                        map-options
                        :disable="somenteLeituraObjeto"
                        hint="Escolha um ou mais tipos do objeto"
                      />
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
                    <q-input
                      v-model="uri"
                      label="Classe do Acervo"
                      outlined
                      :readonly="somenteLeituraObjeto"
                    />
                  </div>
                  <q-input
                    v-model="objeto.titulo"
                    label="Título/nome do objeto"
                    required
                    outlined
                    :readonly="somenteLeituraObjeto"
                  />
                  <q-input
                    v-model="objeto.resumo"
                    label="Resumo"
                    title="um texto resumido com informações importantes sobre o objeto"
                    autogrow
                    outlined
                    :readonly="somenteLeituraObjeto"
                  />
                  <q-input
                    v-model="objeto.descricao"
                    label="Descrição"
                    title="uma descrição detalhada do objeto digital"
                    autogrow
                    outlined
                    :readonly="somenteLeituraObjeto"
                  />
                </q-tab-panel>
                <q-tab-panel name="outros">
                  <div class="text-grey-7 q-pa-md text-center">
                    Nenhum dado de vocabulário disponível ainda.
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <q-card-actions class="botoes-fixos">
        <q-btn-group flat push>
          <q-btn
            @click="gravar"
            label="Gravar Novo Objeto"
            color="primary"
            v-if="objeto.id == '' && !somenteLeituraObjeto"
          />
          <q-btn
            @click="cancelar()"
            label="Cancelar"
            color="secondary"
            v-if="objeto.id == '' && !somenteLeituraObjeto"
          />
          <q-btn
            @click="atualizarObj"
            label="Atualizar Objeto"
            color="green-8"
            v-if="objeto.id != '' && !somenteLeituraObjeto"
          />
          <q-btn
            @click="liberarEdicao"
            label="Editar"
            color="primary"
            v-if="
              objeto.id != '' && somenteLeituraObjeto && usuarioAdminLogado
            "
          />
          <q-btn
            @click="irParaMidias(objeto)"
            label="Abrir mídias"
            color="blue-8"
            v-if="objeto.id != ''"
          />
          <q-btn
            @click="mostrarPopUpObjetoFis = false"
            label="Voltar"
            color="secondary"
            v-if="objeto.id != ''"
          />
        </q-btn-group>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialogo-objeto-fis {
  width: 80vw;
  max-width: 90vw;
  height: 85vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.criar-objeto-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
.botoes-fixos {
  flex: 0 0 auto;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}
</style>
