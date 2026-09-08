<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watch, watchEffect, computed } from 'vue';

import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import {
  listaRelacoes,
  mostrarPopUpAddRelacao,

  mostrarPopUpObjetoDim,
  mostrarPopUpObjetoFis,
  ObjetoDigital,
  objetoDimensionalVazio,
  ObjetoFisico,
  relacaoPreSelecionada,
  Relacao,
  somenteLeituraObjeto,
  Tripla,
} from './manter-objeto';

import { FuncaoComCallback } from '../funcoes';
import { addRelacao, pesquisarObjetos } from 'src/services/api-objeto-dim';
import { listarClasses } from 'src/services/api';
import { ClasseComum } from '../tipos';

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

// Usado quando o tipo de relação é "colecao" (PERTENCE_COLECAO): em vez de
// relacionar a um objeto, relaciona a uma CLASSE da estrutura do acervo.
const listaClasses = ref([] as ClasseComum[]);
const classeSelecionada = ref({} as ClasseComum);


const valorSelecionado = ref('');
function buscarRelacoes() {
  objetoId.value = objetoStore.getObjeto.id;
  objetoEmEdicao.value = objetoStore.getObjeto;
}
watchEffect(() => {
  if (mostrarPopUpAddRelacao.value) {
    buscarRelacoes();
    if (relacaoPreSelecionada.value) {
      relacaoSelecionada.value = relacaoPreSelecionada.value;
      relacaoPreSelecionada.value = null;
      busque.objetos('');
    }
  }
});
onMounted(() => {
  //
});

onBeforeMount(() => {
  //
});

// Evita empilhar 3 diálogos ao mesmo tempo (o de criação pode ficar
// escondido atrás deste): fecha "Adicionar Relação" enquanto cria o
// novo objeto e reabre automaticamente assim que o outro for fechado.
const reabrirAoFecharCriacao = ref(false);
watch([mostrarPopUpObjetoDim, mostrarPopUpObjetoFis], ([dimAberto, fisAberto]) => {
  if (!dimAberto && !fisAberto && reabrirAoFecharCriacao.value) {
    reabrirAoFecharCriacao.value = false;
    mostrarPopUpAddRelacao.value = true;
  }
});

function irParaNovoObjetoDim() {
  const objVazio = objetoDimensionalVazio();
  objetoStore.setObjetoDim(objVazio);
  objetoStore.setObjeto(objVazio);
  somenteLeituraObjeto.value = false;
  reabrirAoFecharCriacao.value = true;
  mostrarPopUpAddRelacao.value = false;
  mostrarPopUpObjetoDim.value = true;
}
function irParaNovoObjetoFis() {
  const objVazio = { id: '', titulo: '' } as ObjetoFisico;
  objetoStore.setObjeto(objVazio);
  somenteLeituraObjeto.value = false;
  reabrirAoFecharCriacao.value = true;
  mostrarPopUpAddRelacao.value = false;
  mostrarPopUpObjetoFis.value = true;
}

async function adicionarRelacao() {
  const tripla = ref({} as Tripla);
  tripla.value.id = objetoEmEdicao.value.id;
  tripla.value.propriedade = relacaoSelecionada.value.uri;
  tripla.value.tipo_recurso =
    relacaoSelecionada.value.nome == 'relation' ? 'string' : 'uri';
  if (relacaoSelecionada.value.nome == 'relation') {
    tripla.value.valor = valorSelecionado.value;
  } else if (relacaoSelecionada.value.nome == 'colecao') {
    tripla.value.valor = classeSelecionada.value.uri; //#uri da classe
  } else {
    tripla.value.valor = objetoSelecionado.value.obj; //#uri do objeto
  }
  addRelacao(tripla.value);
}

// Ao trocar o tipo de relação, busca de novo na fonte certa (objetos ou
// classes) e limpa a seleção anterior, pra não sobrar um valor de um tipo
// de relação diferente.
function aoTrocarTipoRelacao() {
  objetoSelecionado.value = {} as ObjetoDigital;
  classeSelecionada.value = {} as ClasseComum;
  valorSelecionado.value = '';
  if (relacaoSelecionada.value.nome == 'colecao') {
    busque.classes('');
  } else {
    busque.objetos('');
  }
}

const AcoesFiltro = {
  rotuloRelacao: (relacao: Relacao) => {
    return relacao.descricao;
  },
  rotuloClasse: (classe: ClasseComum) => {
    return classe?.label || classe?.nome_curto || '';
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
  filtrarClasses: (valor: string, atualizar: FuncaoComCallback) => {
    setTimeout(() => {
      atualizar(() => {
        busque.classes(valor.toLocaleLowerCase());
      });
    }, 400);
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
  async classes(val: string) {
    // aqui só faz sentido relacionar a uma classe concreta, não à raiz abstrata da hierarquia
    listaClasses.value = await listarClasses(val, true);
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
                  @update:model-value="aoTrocarTipoRelacao"
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
                  v-if="relacaoSelecionada.nome == 'colecao'"
                  :options="listaClasses"
                  v-model="classeSelecionada"
                  label="Informe a coleção (classe) que deseja relacionar"
                  :option-label="AcoesFiltro.rotuloClasse"
                  outlined
                  use-input
                  input-debounce="300"
                  hide-selected
                  fill-input
                  clearable
                  @filter="AcoesFiltro.filtrarClasses"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{
                          scope.opt.label || scope.opt.nome_curto
                        }}</q-item-label>
                        <q-item-label caption>{{
                          scope.opt.description
                        }}</q-item-label>
                        <q-item-label
                          caption
                          v-if="scope.opt.mae_curta && scope.opt.mae_curta != '-'"
                        >
                          Classe mãe: {{ scope.opt.mae_curta }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template></q-select
                >
                <q-select
                  v-else-if="relacaoSelecionada.nome != 'relation'"
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

                <div
                  v-if="relacaoSelecionada.nome != 'relation' && relacaoSelecionada.nome != 'colecao'"
                  class="row q-gutter-sm q-mt-sm"
                >
                  <span class="text-caption text-grey-7 flex items-center">
                    Não achou o que precisa?
                  </span>
                  <q-btn
                    outline
                    dense
                    no-caps
                    color="green-8"
                    icon="add"
                    label="Criar objeto dimensional"
                    @click="irParaNovoObjetoDim"
                  />
                  <q-btn
                    outline
                    dense
                    no-caps
                    color="primary"
                    icon="add"
                    label="Criar objeto físico"
                    @click="irParaNovoObjetoFis"
                  />
                </div>
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
