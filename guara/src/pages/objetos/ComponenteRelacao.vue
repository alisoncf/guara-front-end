<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watch, computed } from 'vue';
import { Dialog } from 'quasar';

import { useRouter } from 'vue-router';
import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import {
  Dimensao,
  dimensaoFiltroInicialRelacoes,
  ListaTipoDim,
  mostrarPopUpAddRelacao,
  mostrarPopUpRelacoes,
  ObjetoFisico,
  ONDE,
  OQUE,
  QUANDO,
  QUEM,
  Relacao,
  relacaoPreSelecionada,
  Tripla,
  usuarioAdminLogado,
} from './manter-objeto';

import { colunasDim, colunasRelacaoFis } from '../colecoes/funcoes-funcoes';
import {
  pesquisarRelacoes,
  removerRelacao,
  addRelacao,
  buscarSugestoesSemanticas,
} from 'src/services/api-objeto-dim';
import { truncarTexto } from '../funcoes';

const LIMITE_LISTA = 50;
const RELACAO_POR_DIMENSAO: Record<string, Relacao> = {
  Pessoa: QUEM,
  Tempo: QUANDO,
  Lugar: ONDE,
  Evento: OQUE,
};

const objetoId = ref({} as string); // Ajuste conforme necessário
const objetoStore = useDadosObjetoFisico();
const aba = ref<string>('fisicos');
const listaRelacoesDoObjeto = ref([] as Tripla[]);
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

const objetoSelecionado = ref({} as ObjetoFisico);

const listaDimensoes = ListaTipoDim();
// null = mostra todas as relações; caso contrário, mostra somente a dimensão escolhida
const dimensaoAtiva = ref<Dimensao | null>(null);

// --- Sugestões semânticas (BERTimbau) ---
// Desligado por padrão: esse recurso consome bastante memória no backend,
// então só busca quando o usuário liga explicitamente.
const recomendacaoAtiva = ref(false);
const listaSugestoes = ref([] as any[]);
const carregandoSugestoes = ref(false);
const sugestoesFiltradas = computed(() => {
  if (!dimensaoAtiva.value) {
    return listaSugestoes.value;
  }
  return listaSugestoes.value.filter(
    (s: any) => s.dimensao === dimensaoAtiva.value?.tipo
  );
});

function dimensaoSelecionada(dim: Dimensao) {
  return dimensaoAtiva.value?.tipo === dim.tipo;
}
function alternarDimensao(dim: Dimensao) {
  dimensaoAtiva.value = dimensaoSelecionada(dim) ? null : dim;
}
function abrirAdicionarRelacao() {
  relacaoPreSelecionada.value = dimensaoAtiva.value
    ? RELACAO_POR_DIMENSAO[dimensaoAtiva.value.tipo] ?? null
    : null;
  mostrarPopUpAddRelacao.value = true;
}

const relacoesFiltradas = computed(() => {
  if (!dimensaoAtiva.value) {
    return listaRelacoesDoObjeto.value; // nenhuma dimensão selecionada -> mostra todas as relações
  }
  const nomePermitido = RELACAO_POR_DIMENSAO[dimensaoAtiva.value.tipo]?.nome;
  return listaRelacoesDoObjeto.value.filter(
    (row: any) => row.propriedade_abreviada === nomePermitido
  );
});
const relacoesExibidas = computed(() =>
  relacoesFiltradas.value.slice(0, LIMITE_LISTA)
);

async function buscarRelacoes() {
  objetoId.value = objetoStore.getObjeto.obj;
  objetoSelecionado.value = objetoStore.getObjeto;
  listaRelacoesDoObjeto.value = await pesquisarRelacoes(objetoId.value);
  await atualizarSugestoes();
}

async function atualizarSugestoes() {
  if (!recomendacaoAtiva.value) {
    listaSugestoes.value = [];
    return;
  }

  const titulo = objetoSelecionado.value.titulo || '';
  const descricao = (objetoSelecionado.value as any).descricao || '';
  if (!titulo && !descricao) {
    // objeto ainda em branco (recém-criado) - nada pra sugerir com base nisso
    listaSugestoes.value = [];
    return;
  }

  carregandoSugestoes.value = true;
  const resultado = await buscarSugestoesSemanticas({
    id: objetoId.value,
    titulo,
    descricao,
  });
  listaSugestoes.value = resultado || [];
  carregandoSugestoes.value = false;
}

function aoAlternarRecomendacao() {
  if (recomendacaoAtiva.value) {
    atualizarSugestoes();
  } else {
    listaSugestoes.value = [];
  }
}

async function aceitarSugestao(sugestao: any) {
  const tripla: Tripla = {
    prefixo: '',
    id: objetoId.value,
    propriedade: sugestao.propriedade,
    valor: sugestao.uri_recurso,
    complemento: '',
    tipo_recurso: 'uri',
    titulo: '',
    propriedade_abreviada: '',
  };
  await addRelacao(tripla);
  listaSugestoes.value = listaSugestoes.value.filter(
    (s: any) => s !== sugestao
  );
  await buscarRelacoes(); // atualiza a tabela de relações confirmadas e recalcula sugestões
}

function descartarSugestao(sugestao: any) {
  listaSugestoes.value = listaSugestoes.value.filter(
    (s: any) => s !== sugestao
  );
}
// watch (não watchEffect): precisa reagir só à ABERTURA do diálogo, nunca
// a leituras reativas incidentais dentro de buscarRelacoes() (como
// objetoStore.getObjeto) - senão qualquer setObjeto() feito em OUTRA tela
// enquanto este diálogo ainda está aberto por baixo dispara tudo de novo,
// inclusive a busca de sugestões semânticas com título/descrição vazios.
watch(mostrarPopUpRelacoes, (aberto) => {
  if (aberto) {
    buscarRelacoes();
    if (dimensaoFiltroInicialRelacoes.value) {
      dimensaoAtiva.value = dimensaoFiltroInicialRelacoes.value;
      dimensaoFiltroInicialRelacoes.value = null;
    } else {
      dimensaoAtiva.value = null;
    }
  }
});
// "Adicionar Relação" fica aberto depois de adicionar (permite adicionar
// mais de uma sem reabrir) e só fecha quando o usuário clica no X - ao
// fechar, se "Gerenciar Relações" continua aberto por baixo, atualiza a
// lista pra refletir o que foi adicionado.
watch(mostrarPopUpAddRelacao, (aberto) => {
  if (!aberto && mostrarPopUpRelacoes.value) {
    buscarRelacoes();
  }
});
function ehLink(valor: unknown): boolean {
  return typeof valor === 'string' && /^https?:\/\//i.test(valor);
}
function confirmarExclusao(row: any) {
  Dialog.create({
    title: 'Confirmação',
    message: 'Tem certeza que deseja excluir esta relação?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const tripla: Tripla = {
      prefixo: '',
      id: objetoSelecionado.value.id,
      propriedade: row.propriedade?.value || '',
      valor: row.valor?.value || '',
      complemento: '',
      tipo_recurso: '',
      titulo: '',
      propriedade_abreviada: row.propriedade_abreviada || '',
    };
    const sucesso = await removerRelacao(tripla);
    if (sucesso) {
      buscarRelacoes();
    }
  });
}
const pagination = ref({
  rowsPerPage: 0 // 0 significa exibir todas as linhas
})
onMounted(() => {
  //
});

onBeforeMount(() => {
  //
});
</script>

<template>
  <q-dialog v-model="mostrarPopUpRelacoes" class="q-pa-md scroll" persistent>
    <q-card style="width: 80vw; max-width: 90vw; max-height: 90vh">
      <q-toolbar>
        <q-toolbar-title>Gerenciar Relações</q-toolbar-title>
        <q-btn
          icon="close"
          label="fechar"
          @click="mostrarPopUpRelacoes = false"
          flat
        />
      </q-toolbar>
      <div>
        <q-card class="q-pa-md">
          <div class="row">
            <div class="col-6">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold">Título:</q-item-label>
                  <q-item-label>{{ objetoSelecionado.titulo }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-6">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold">Id:</q-item-label>
                  <q-item-label>{{ objetoSelecionado.id }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
          <q-card-section>
            <div class="text-caption text-grey-8 q-mb-xs">
              Filtrar por dimensão
            </div>
            <div class="row items-center q-mb-md">
              <div class="row items-center q-gutter-sm col">
                <q-chip
                  v-for="dim in listaDimensoes"
                  :key="dim.tipo"
                  clickable
                  :outline="!dimensaoSelecionada(dim)"
                  :color="dimensaoSelecionada(dim) ? 'teal' : 'grey-6'"
                  :text-color="dimensaoSelecionada(dim) ? 'white' : 'grey-8'"
                  :icon="dimensaoSelecionada(dim) ? 'check' : undefined"
                  @click="alternarDimensao(dim)"
                >
                  {{ dim.tipo }}
                </q-chip>
              </div>
              <q-btn
                round
                push
                color="primary"
                icon="add"
                @click="abrirAdicionarRelacao"
              >
                <q-tooltip>
                  {{
                    dimensaoAtiva
                      ? 'Adicionar relação de ' + dimensaoAtiva.tipo
                      : 'Adicionar Relação'
                  }}
                </q-tooltip>
              </q-btn>
            </div>

            <div
              v-if="relacoesFiltradas.length > LIMITE_LISTA"
              class="text-caption text-grey-7 q-mb-sm"
            >
              Mostrando {{ LIMITE_LISTA }} de {{ relacoesFiltradas.length }}
              relações. Refine o filtro para ver as demais.
            </div>

            <q-table
              title="Relações"
              :rows="relacoesExibidas"
              :columns="colunasRelacaoFis"
              wrap-cells
              v-model:pagination="pagination"
              :rows-per-page-options="[0]"
            >
              <template v-slot:body-cell-#="{ rowIndex }">
                <q-td>{{ rowIndex + 1 }}</q-td>
              </template>

              <template v-slot:body-cell-valor="props">
                <q-td :props="props">
                  <a
                    v-if="ehLink(props.row.valor?.value)"
                    :href="props.row.valor.value"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary"
                  >
                    {{ truncarTexto(props.value, 60) }}
                    <q-icon name="open_in_new" size="14px" class="q-ml-xs" />
                  </a>
                  <span v-else>{{ props.value }}</span>
                </q-td>
              </template>

              <template v-slot:body-cell-acoes="props">
                <q-td>
                  <q-btn
                    v-if="props.row.propriedade_abreviada == 'onde'"
                    icon="place"
                    flat
                  ></q-btn>
                  <q-btn
                    v-if="usuarioAdminLogado"
                    icon="delete_forever"
                    color="red-7"
                    flat
                    dense
                    @click="confirmarExclusao(props.row)"
                  >
                    <q-tooltip>Excluir relação</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>

            <div class="q-mt-lg">
              <div class="row items-center q-gutter-sm">
                <q-toggle
                  v-model="recomendacaoAtiva"
                  color="primary"
                  label="Sugestões semânticas (IA)"
                  @update:model-value="aoAlternarRecomendacao"
                />
                <q-spinner v-if="carregandoSugestoes" size="1em" />
              </div>
              <div
                v-if="!recomendacaoAtiva"
                class="text-caption text-grey-7 q-mt-xs"
              >
                Desligado por padrão — consome bastante memória no servidor.
                Ligue para buscar sugestões de relação por IA.
              </div>
            </div>

            <div
              v-if="recomendacaoAtiva && (listaSugestoes.length > 0 || carregandoSugestoes)"
              class="q-mt-md"
            >
              <q-list bordered separator>
                <q-item v-for="sugestao in sugestoesFiltradas" :key="sugestao.uri_recurso">
                  <q-item-section>
                    <q-item-label>
                      <q-badge color="grey-7">{{ sugestao.dimensao }}</q-badge>
                      {{ sugestao.titulo_recurso }}
                    </q-item-label>
                    <q-item-label caption>
                      Similaridade: {{ (sugestao.similaridade * 100).toFixed(0) }}%
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="q-gutter-x-sm">
                      <q-btn
                        icon="check"
                        color="positive"
                        flat
                        round
                        dense
                        @click="aceitarSugestao(sugestao)"
                      >
                        <q-tooltip>Aceitar sugestão</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="close"
                        color="negative"
                        flat
                        round
                        dense
                        @click="descartarSugestao(sugestao)"
                      >
                        <q-tooltip>Descartar sugestão</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </q-dialog>
</template>
