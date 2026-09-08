<script setup lang="ts">
import { computed, ref, onBeforeMount, watchEffect } from 'vue';

import {
  ListaTipoDim,
  Dimensao,
  dimensaoFiltroInicialRelacoes,
  ObjetoDimensional,
  objetoDimensionalVazio,
  DimMapping,
  mostrarPopUpObjetoDim,
  mostrarPopUpRelacoes,
  PERTENCE_COLECAO,
  somenteLeituraObjeto,
  Tripla,
  usuarioAdminLogado,
} from './manter-objeto';
import {
  addRelacao,
  gravarObjetoDim,
  id_novo_objeto_dim_gravado,
  pesquisarRelacoes,
  removerRelacao,
} from 'src/services/api-objeto-dim';
import { useDadosObjetoFisico } from 'src/stores/objeto-fisico';
import { FuncaoComCallback, textoAposUltimoChar } from '../funcoes';
import {
  listarClasses,
  PesquisarSugestaoCidade,
  PesquisarSugestaoEvento,
} from 'src/services/api';
import { ClasseComum } from '../tipos';
const useObjetoStore = useDadosObjetoFisico();
const listaDim = ListaTipoDim();
const tipoSelecionado = ref(DimMapping('pessoa') as Dimensao);
const abaObjeto = ref<'basicos' | 'outros'>('basicos');
const objeto = ref<ObjetoDimensional>(objetoDimensionalVazio());

// Coleção (classe da estrutura do acervo) à qual o objeto vai ser
// relacionado ao salvar - evita ter que abrir "Adicionar Relação" à parte.
// colecoesOriginaisUris guarda a(s) relação(ões) :colecao que o objeto já
// tinha ao abrir o diálogo, pra poder REMOVER na hora de salvar em vez de
// só empilhar mais uma (senão, editando várias vezes, o objeto acumula
// várias relações :colecao e fica confuso qual vale).
const listaColecoes = ref<ClasseComum[]>([]);
const colecoesFiltradas = ref<ClasseComum[]>([]);
const colecoesSelecionadas = ref<ClasseComum[]>([]);
const colecoesOriginaisUris = ref<string[]>([]);

function rotuloColecao(colecao: ClasseComum): string {
  return colecao?.label || colecao?.nome_curto || '';
}
async function carregarColecoes() {
  listaColecoes.value = await listarClasses('', true);
  colecoesFiltradas.value = listaColecoes.value;
}
function removerColecaoSelecionada(colecao: ClasseComum) {
  colecoesSelecionadas.value = colecoesSelecionadas.value.filter(
    (c) => c.uri !== colecao.uri
  );
}
function filtrarColecoes(valor: string, atualizar: FuncaoComCallback) {
  atualizar(() => {
    if (valor === '') {
      colecoesFiltradas.value = listaColecoes.value;
      return;
    }
    const busca = valor.toLocaleLowerCase();
    colecoesFiltradas.value = listaColecoes.value.filter((colecao) =>
      rotuloColecao(colecao).toLocaleLowerCase().includes(busca)
    );
  });
}
async function carregarColecaoAtual(objUri: string) {
  colecoesOriginaisUris.value = [];
  colecoesSelecionadas.value = [];
  if (!objUri) {
    return;
  }
  const relacoes = await pesquisarRelacoes(objUri);
  const relacoesColecao = relacoes.filter(
    (r: any) => r.propriedade_abreviada === PERTENCE_COLECAO.nome
  );
  colecoesOriginaisUris.value = relacoesColecao
    .map((r: any) => r.valor?.value)
    .filter((uri: string | undefined): uri is string => !!uri);

  if (colecoesOriginaisUris.value.length > 0) {
    if (listaColecoes.value.length === 0) {
      await carregarColecoes();
    }
    colecoesSelecionadas.value = colecoesOriginaisUris.value
      .map((uri) => listaColecoes.value.find((c) => c.uri === uri))
      .filter((c): c is ClasseComum => !!c);
  }
}

watchEffect(() => {
  if (mostrarPopUpObjetoDim.value) {
    abaObjeto.value = 'basicos';
    carregar();
    if (listaColecoes.value.length === 0) {
      carregarColecoes();
    }
  }
});
function carregar() {
  const idNoStore = useObjetoStore.getObjetoDim.id || '';
  colecoesSelecionadas.value = [];
  colecoesOriginaisUris.value = [];
  if (objeto.value.id === idNoStore) {
    return;
  }
  if (idNoStore) {
    objeto.value = { ...useObjetoStore.getObjetoDim };
    tipoSelecionado.value = DimMapping(
      textoAposUltimoChar(objeto.value.tipo, '#')
    );
    carregarColecaoAtual(objeto.value.obj);
  } else {
    objeto.value = objetoDimensionalVazio();
    tipoSelecionado.value = DimMapping('pessoa');
  }
}

function liberarEdicao() {
  somenteLeituraObjeto.value = false;
}
async function gravar() {
  if (somenteLeituraObjeto.value) {
    return;
  }
  objeto.value.tipo = tipoSelecionado.value;
  const eraNovo = objeto.value.id == '';

  try {
    await gravarObjetoDim(objeto.value);
  } catch (error) {
    // gravarObjetoDim já mostrou o Notify de erro — só interrompe aqui
    // para não seguir como se a gravação tivesse dado certo
    return;
  }

  if (eraNovo) {
    objeto.value.id = id_novo_objeto_dim_gravado.value;
    useObjetoStore.setObjetoDim(objeto.value);
  }

  const novasUris = colecoesSelecionadas.value
    .map((c) => c.uri)
    .filter((uri): uri is string => !!uri);
  const urisParaRemover = colecoesOriginaisUris.value.filter(
    (uri) => !novasUris.includes(uri)
  );
  const urisParaAdicionar = novasUris.filter(
    (uri) => !colecoesOriginaisUris.value.includes(uri)
  );

  function triplaColecao(uri: string): Tripla {
    return {
      prefixo: '',
      id: objeto.value.id,
      propriedade: PERTENCE_COLECAO.uri,
      valor: uri,
      complemento: '',
      tipo_recurso: 'uri',
      titulo: '',
      propriedade_abreviada: PERTENCE_COLECAO.nome,
    };
  }
  for (const uri of urisParaRemover) {
    await removerRelacao(triplaColecao(uri));
  }
  for (const uri of urisParaAdicionar) {
    addRelacao(triplaColecao(uri));
  }
  colecoesOriginaisUris.value = novasUris;
}
function irParaMapa() {
  const coordenadas = objeto.value.coordenadas; // Ex: "-16.6809,-49.2534"
  if (coordenadas) {
    const url = `https://www.google.com/maps?q=${encodeURIComponent(
      coordenadas
    )}`;
    window.open(url, '_blank');
  } else {
    console.warn('Coordenadas não encontradas');
  }
}

// Os dois dependem de um backend com IA, que às vezes demora ou falha -
// esses indicadores dão feedback visual de que a busca está em andamento.
const buscandoSugestaoCidade = ref(false);
const buscandoSugestaoEvento = ref(false);
const dicaBuscaIA = computed(() => {
  if (buscandoSugestaoCidade.value) {
    return 'Buscando sugestão de cidade com IA... isso pode levar alguns segundos.';
  }
  if (buscandoSugestaoEvento.value) {
    return 'Buscando sugestão de evento com IA... isso pode levar alguns segundos.';
  }
  return '';
});

async function irParaSugestaoCidade() {
  if (buscandoSugestaoCidade.value) {
    return;
  }
  buscandoSugestaoCidade.value = true;
  try {
    const resultado = await PesquisarSugestaoCidade(objeto.value.titulo);
    if (resultado && resultado.length > 0) {
      const sugestao = resultado[0];
      objeto.value.coordenadas = `${sugestao.latitude},${sugestao.longitude}`;
      objeto.value.descricao = sugestao.lugar + ' - ' + sugestao.titulo;
      objeto.value.resumo = sugestao.descricao;
    } else {
      console.warn('Nenhuma sugestão de cidade encontrada');
    }
  } finally {
    buscandoSugestaoCidade.value = false;
  }
}
async function irParaSugestaoEvento() {
  if (buscandoSugestaoEvento.value) {
    return;
  }
  buscandoSugestaoEvento.value = true;
  try {
    const resultado = await PesquisarSugestaoEvento(objeto.value.titulo);
    if (resultado && resultado.length > 0) {
      const sugestao = resultado[0];
      objeto.value.descricao =
        sugestao.descricao_historico +
        sugestao.atividades_principais +
        sugestao.lugar +
        sugestao.titulo;
      objeto.value.resumo = sugestao.descricao_historico;
    } else {
      console.warn('Nenhuma sugestão de evento encontrada');
    }
  } finally {
    buscandoSugestaoEvento.value = false;
  }
}
function irParaRelacoes() {
  if (somenteLeituraObjeto.value) {
    return;
  }
  useObjetoStore.setObjeto(objeto.value);
  mostrarPopUpRelacoes.value = true;
}
function novo() {
  if (somenteLeituraObjeto.value) {
    return;
  }
  objeto.value.titulo = '';
  objeto.value.descricao = '';
  objeto.value.resumo = '';
  objeto.value.id = '';
}
function iconeDimensao(tipo: string): string {
  switch (tipo.toLowerCase()) {
    case 'pessoa':
      return 'person';
    case 'lugar':
      return 'place';
    case 'evento':
      return 'event';
    case 'tempo':
      return 'schedule';
    default:
      return 'category';
  }
}
function irParaRelacaoDimensao(dim: Dimensao) {
  dimensaoFiltroInicialRelacoes.value = dim;
  useObjetoStore.setObjeto(objeto.value);
  mostrarPopUpRelacoes.value = true;
}
onBeforeMount(() => {
  console.log('montando');
});
</script>

<template>
  <q-dialog v-model="mostrarPopUpObjetoDim" class="q-pa-md scroll" persistent>
    <q-card class="dialogo-objeto-dim">
      <q-toolbar>
        <q-toolbar-title v-if="!objeto.id || objeto.id == ''"
          >Criar {{ tipoSelecionado.tipo }}
        </q-toolbar-title>
        <q-toolbar-title v-else
          >{{ tipoSelecionado.tipo }} - {{ objeto.titulo }}
        </q-toolbar-title>
        <q-badge
          v-if="somenteLeituraObjeto"
          color="grey-7"
          label="Somente visualização"
          class="q-mr-md"
        />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <div class="dialogo-objeto-dim-corpo">
        <q-card-section class="dialogo-objeto-dim-conteudo">
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
              <div class="q-gutter-x-md">
                <label>Dimensão/Tipo</label>
                <q-select
                  v-model="tipoSelecionado"
                  outlined
                  :options="listaDim"
                  option-label="tipo"
                  label="tipo"
                  fill-input
                  clearable
                  :disable="somenteLeituraObjeto"
                ></q-select>
              </div>

              <q-input
                v-model="objeto.titulo"
                outlined
                label="Título/nome do objeto"
                :readonly="somenteLeituraObjeto"
                :hint="dicaBuscaIA"
              >
                <q-btn
                  v-if="tipoSelecionado.tipo.toLowerCase() == 'lugar'"
                  icon="smart_toy"
                  :loading="buscandoSugestaoCidade"
                  :disable="buscandoSugestaoCidade"
                  @click="irParaSugestaoCidade"
                  flat
                  size="smaller"
                >
                  <q-tooltip>Sugerir dados da cidade com IA</q-tooltip>
                  <template v-slot:loading>
                    <q-spinner-dots />
                  </template>
                </q-btn>
                <q-btn
                  v-if="tipoSelecionado.tipo.toLowerCase() == 'evento'"
                  icon="smart_toy"
                  :loading="buscandoSugestaoEvento"
                  :disable="buscandoSugestaoEvento"
                  @click="irParaSugestaoEvento"
                  flat
                  size="smaller"
                >
                  <q-tooltip>Sugerir dados do evento com IA</q-tooltip>
                  <template v-slot:loading>
                    <q-spinner-dots />
                  </template>
                </q-btn>
              </q-input>
              <q-input
                v-model="objeto.descricao"
                label="Descrição"
                autogrow
                outlined
                title="Uma descrição pormenorizada do evento com local,
          marcos históricos, fatos e figuras importantes etc"
                :readonly="somenteLeituraObjeto"
              />
              <q-input
                v-model="objeto.resumo"
                label="Resumo"
                outlined
                title="uma versão resumida para o usuário ter uma visão geral"
                autogrow
                :readonly="somenteLeituraObjeto"
              />
              <q-input
                v-if="tipoSelecionado.tipo.toLowerCase() == 'lugar'"
                v-model="objeto.coordenadas"
                label="Coordenadas (latitude,longitude)"
                outlined
                title="uma versão resumida para o usuário ter uma visão geral"
                :readonly="somenteLeituraObjeto"
              >
                <template v-slot:append>
                  <q-btn
                    icon="pin_drop"
                    @click="irParaMapa"
                    flat
                    size="smaller"
                  />
                </template>
              </q-input>
              <q-input
                v-if="tipoSelecionado.tipo.toLowerCase() == 'evento'"
                v-model="objeto.inicio"
                label="Data de Início"
                outlined
                title="uma data inicial ou um período inicial aproximado"
                :readonly="somenteLeituraObjeto"
              />
              <q-input
                v-if="tipoSelecionado.tipo.toLowerCase() == 'evento'"
                v-model="objeto.fim"
                label="Data de Encerramento"
                outlined
                title="uma data inicial ou um período final aproximado"
                :readonly="somenteLeituraObjeto"
              />
              <q-select
                v-model="colecoesSelecionadas"
                :options="colecoesFiltradas"
                :option-label="rotuloColecao"
                label="Coleções (opcional)"
                hint="Ao salvar, relaciona o objeto a essas coleções automaticamente"
                outlined
                multiple
                use-input
                input-debounce="300"
                hide-selected
                clearable
                :disable="somenteLeituraObjeto"
                @filter="filtrarColecoes"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{
                        scope.opt.label || scope.opt.nome_curto
                      }}</q-item-label>
                      <q-item-label
                        caption
                        v-if="scope.opt.mae_curta && scope.opt.mae_curta != '-'"
                      >
                        Classe mãe: {{ scope.opt.mae_curta }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <div
                v-if="colecoesSelecionadas.length > 0"
                class="colecoes-selecionadas-chips"
              >
                <q-chip
                  v-for="colecao in colecoesSelecionadas"
                  :key="colecao.uri"
                  removable
                  :disable="somenteLeituraObjeto"
                  color="primary"
                  text-color="white"
                  icon="folder_special"
                  @remove="removerColecaoSelecionada(colecao)"
                >
                  {{ rotuloColecao(colecao) }}
                </q-chip>
              </div>
            </q-tab-panel>
            <q-tab-panel name="outros">
              <div class="text-grey-7 q-pa-md text-center">
                Nenhum dado de vocabulário disponível ainda.
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <div class="dialogo-objeto-dim-lateral">
          <q-btn
            v-for="dim in listaDim"
            :key="dim.tipo"
            round
            flat
            color="grey-8"
            :icon="iconeDimensao(dim.tipo)"
            :disable="!objeto.id || objeto.id == ''"
            @click="irParaRelacaoDimensao(dim)"
          >
            <q-tooltip>
              {{
                !objeto.id || objeto.id == ''
                  ? 'Salve o objeto para ver relações'
                  : 'Relações de ' + dim.tipo
              }}
            </q-tooltip>
          </q-btn>
        </div>
      </div>

      <q-card-actions class="botoes-fixos">
        <q-btn-group flat push>
          <q-btn
            @click="gravar"
            label="Salvar Objeto"
            color="primary"
            v-if="!somenteLeituraObjeto"
          />

          <q-btn
            @click="irParaRelacoes"
            label="Relações"
            color="purple-3"
            v-if="objeto.id && objeto.id != '' && !somenteLeituraObjeto"
          />
          <q-btn
            @click="liberarEdicao"
            label="Editar"
            color="orange-8"
            v-if="
              objeto.id &&
              objeto.id != '' &&
              somenteLeituraObjeto &&
              usuarioAdminLogado
            "
          />

          <q-btn
            label="Voltar"
            @click="mostrarPopUpObjetoDim = false"
            color="secondary"
            outlined
          />
        </q-btn-group>
        <q-btn @click="novo" rounded icon="add" v-if="!somenteLeituraObjeto" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.colecoes-selecionadas-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: -8px;
  margin-bottom: 8px;
}
.dialogo-objeto-dim {
  width: 90vw;
  max-width: 90vw;
  height: 85vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.dialogo-objeto-dim-corpo {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: row;
}
.dialogo-objeto-dim-conteudo {
  flex: 1 1 auto;
  min-width: 0;
  overflow-y: auto;
}
.dialogo-objeto-dim-lateral {
  flex: 0 0 auto;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 8px;
  border-left: 1px solid #e0e0e0;
  background: #fafafa;
}
.botoes-fixos {
  flex: 0 0 auto;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}
</style>
