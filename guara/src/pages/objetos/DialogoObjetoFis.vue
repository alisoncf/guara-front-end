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
} from './manter-objeto';
import { organiza_arvore, encontrarClassePorLabel } from '../funcoes';
import { ClasseComum, TreeNode } from '../tipos';
import { useDadosObjetoFisico } from 'src/stores/objeto-fisico';
import { useRouter } from 'vue-router';
import { Dialog } from 'quasar';
import ComponenteMidia from './ComponenteMidia.vue';

const router = useRouter();

const listaClasses = ref<ClasseComum[]>([]);
const ClasseSelecionada = ref<ClasseComum>();
const arvoreClasses = ref<TreeNode[]>([]);
const keyword = ref<string>('');
const uri = ref<string>('');
const useObjetoStore = useDadosObjetoFisico();
const tipoObjeto = ref('fisico' as string);
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
  colecao: '',
  associatedMedia: [],
  tipoFisicoAbreviado: [],
  repositorio: '',
  dimensao: '',
});

const tipos = [
  { label: 'Bibliotecário', value: 'Bibliotecario' },
  { label: 'Arqueológico', value: 'Arqueologico' },
  { label: 'Museológico', value: 'MuseuLogico' },
  { label: 'Arquivístico-Documental', value: 'Arquivistico-Documental' },
  { label: 'Imagético-Sonoro', value: 'Imagetico-Sonoro' },
];

function irParaMidias(obj: ObjetoFisico) {
  useObjetoStore.setObjeto(obj);
  mostrarPopUpMidias.value = true;
}

watchEffect(() => {
  if (mostrarPopUpObjetoFis.value) {
    carregar();
  }
});
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
    <q-card style="width: 80vw; max-width: 90vw; max-height: 90vh">
      <q-toolbar>
        <q-toolbar-title v-if="objeto.id == ''"
          >Criar um novo objeto</q-toolbar-title
        >
        <q-toolbar-title v-if="objeto.id != ''"
          >Objeto Id: {{ objeto.id }}
        </q-toolbar-title>
      </q-toolbar>

      <div class="criar-objeto-container">
        <q-card class="q-pa-md">
          <q-card-section>
            <q-form @submit.prevent="gravar">
              <div class="q-gutter-x-md" v-if="tipoObjeto == 'fisico'">
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
                <q-input v-model="uri" label="Classe do Acervo" outlined />
              </div>
              <q-input
                v-model="objeto.titulo"
                label="Título/nome do objeto"
                required
                outlined
              />
              <q-input
                v-model="objeto.resumo"
                label="Resumo"
                title="um texto resumido com informações importantes sobre o objeto"
                autogrow
                outlined
              />
              <q-input
                v-model="objeto.descricao"
                label="Descrição"
                title="uma descrição detalhada do objeto digital"
                autogrow
                outlined
              />
              <q-btn-group flat push>
                <q-btn
                  @click="gravar"
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
                  @click="irParaMidias(objeto)"
                  label="Abrir mídias"
                  color="purple-4"
                  v-if="objeto.id != ''"
                />

                <q-btn
                  @click="mostrarPopUpObjetoFis = false"
                  label="Voltar"
                  color="secondary"
                  v-if="objeto.id != ''"
                />
              </q-btn-group>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </q-dialog>
</template>
