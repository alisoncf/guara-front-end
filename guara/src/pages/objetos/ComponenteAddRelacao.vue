<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watchEffect, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import {
  listaRelacoes,
  mostrarPopUpAddRelacao,
  mostrarPopUpMidias,
  mostrarPopUpRelacoes,
  ObjetoDigital,
  ObjetoFisico,
  Relacao,
  Tripla,
} from './manter-objeto';
import apiConfig from 'src/apiConfig';
import { Dialog, Notify } from 'quasar';
import { colunasDim, colunasRelacaoFis } from '../colecoes/funcoes-funcoes';
import { FuncaoComCallback } from '../funcoes';
import { addRelacao, pesquisarObjetos } from 'src/services/api-objeto-dim';

const objetoId = ref({} as string); // Ajuste conforme necessário
const objetoStore = useDadosObjetoFisico();
const aba = ref<string>('fisicos');
const listaObjetos = ref([] as ObjetoDigital[]);
const listaRelacoesObjetos = listaRelacoes();
const relacaoSelecionada = ref({} as Relacao);
const labelTipo = computed(() => {
  switch (aba.value) {
    case 'fisicos':
      return 'Palavra-chave (Objetos físicos)';
    case 'dimensionais':
      return 'Palavra-chave (Objetos dimensionais)';
    default:
      return 'Palavra-chave';
  }
});

const objetoSelecionado = ref({} as ObjetoDigital);
const objetoEmEdicao = ref({} as ObjetoDigital);

const useFileUpload = ref([true] as any);
const thumbnails = ref([] as any);
const router = useRouter();
const mostrar_excluidos = ref(false);
const valorSelecionado = ref('');
function buscarRelacoes() {
  objetoId.value = objetoStore.getObjeto.id;
  objetoEmEdicao.value = objetoStore.getObjeto;
}
watchEffect(() => {
  if (mostrarPopUpRelacoes.value) {
    buscarRelacoes();
  }
});
onMounted(() => {
  //
});

onBeforeMount(() => {
  //
});

async function adicionarRelacao() {
  const tripla = ref({} as Tripla);
  tripla.value.id = objetoEmEdicao.value.id;
  tripla.value.propriedade = relacaoSelecionada.value.uri;
  tripla.value.tipo_recurso =
    relacaoSelecionada.value.nome == 'relation' ? 'string' : 'uri';
  tripla.value.valor =
    relacaoSelecionada.value.nome != 'relation'
      ? objetoSelecionado.value.obj //#uri
      : valorSelecionado.value;
  console.log(tripla.value);
  addRelacao(tripla.value);

  pesquisarObjetos;
}

const AcoesFiltro = {
  rotuloRelacao: (relacao: Relacao) => {
    return relacao.descricao;
  },
  filtrar: (valor: string, atualizar: FuncaoComCallback) => {
    setTimeout(() => {
      atualizar(() => {
        const busca = valor.toLocaleLowerCase();
        if (valor.length >= 3) {
          busque.objetos(busca);
        }
      });
    }, 600);
  },
};

const busque = {
  async objetos(val: string) {
    const obj = ref({} as ObjetoDigital);
    obj.value.keyword = val;
    obj.value.tipo = relacaoSelecionada.value.nome;
    listaObjetos.value = await pesquisarObjetos(obj.value);
    console.log('buscando objetos', listaObjetos.value);
  },
};
</script>

<template>
  <q-dialog v-model="mostrarPopUpAddRelacao" class="q-pa-md scroll" persistent>
    <q-card style="width: 80vw; max-width: 90vw; max-height: 90vh">
      <q-toolbar>
        <q-toolbar-title>Adicionar Relação</q-toolbar-title>

        <q-btn
          icon="close"
          label="fechar"
          @click="mostrarPopUpAddRelacao = false"
          flat
        />
      </q-toolbar>
      <div>
        <q-card class="q-pa-md">
          <div class="row">
            <div class="col-6">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold">Objeto Id:</q-item-label>
                  <q-item-label>{{ objetoEmEdicao.id }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-6">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold">Título:</q-item-label>
                  <q-item-label>{{ objetoEmEdicao.titulo }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
          <q-card-section>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-xs-12 col-md-12 col-lg-12">
                <q-select
                  :options="listaRelacoesObjetos"
                  v-model="relacaoSelecionada"
                  label="Tipo de Relação"
                  :option-label="AcoesFiltro.rotuloRelacao"
                  @update:model-value="busque.objetos('')"
                  outlined
                >
                </q-select>
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-xs-12 col-md-12 col-lg-12">
                <q-select
                  v-if="relacaoSelecionada.nome != 'relation'"
                  :options="listaObjetos"
                  v-model="objetoSelecionado"
                  label="Informe o recurso que deseja relacionar com"
                  :option-label="AcoesFiltro.rotuloRelacao"
                  outlined
                  use-input
                  input-debounce="300"
                  hide-selected
                  fill-input
                  clearable
                  @filter="AcoesFiltro.filtrar"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.titulo }}</q-item-label>
                        <q-item-label caption>{{
                          scope.opt.descricao
                        }}</q-item-label>
                        <q-item-label caption>{{
                          scope.opt.resumo
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template></q-select
                >
                <q-input
                  v-else
                  label="Valor"
                  autogrow
                  outlined
                  v-model="valorSelecionado"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-btn
              label="Adicionar"
              @click="adicionarRelacao"
              color="green-8"
            />
          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </q-dialog>
</template>
