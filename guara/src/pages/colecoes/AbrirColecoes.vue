<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

import {
  Dimensao,
  ListaTipoDim,
  mostrarPopUpGrafoRelacoes,
  mostrarPopUpMidias,
  mostrarPopUpObjetoDim,
  mostrarPopUpObjetoFis,
  mostrarPopUpRelacoes,
  ObjetoDimensional,
  objetoDimensionalVazio,
  ObjetoFisico,
  somenteLeituraObjeto,
  usuarioAdminLogado,
} from '../objetos/manter-objeto';

import { useRoute, useRouter } from 'vue-router';
import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import { pesquisarObjetosDim } from 'src/services/api-objeto-dim';
import {
  deletarObjetoFisico,
  pesquisarObjetosFisicos,
} from 'src/services/objeto-fisico-api';
import { colunasDim, colunasFisico } from './funcoes-funcoes';
import DialogoObjetoDim from '../objetos/DialogoObjetoDim.vue';
import {
  FuncaoComCallback,
  textoAposUltimoChar,
  truncarTexto,
} from '../funcoes';
import { listarClasses } from 'src/services/api';
import { ClasseComum } from '../tipos';
import DialogoObjetoFis from '../objetos/DialogoObjetoFis.vue';
import ComponenteMidia from '../objetos/ComponenteMidia.vue';
import ComponenteRelacao from '../objetos/ComponenteRelacao.vue';
import ComponenteAddRelacao from '../objetos/ComponenteAddRelacao.vue';
import ComponenteGrafoRelacoes from '../objetos/ComponenteGrafoRelacoes.vue';

const router = useRouter();
const route = useRoute();

const useObjetoStore = useDadosObjetoFisico();
const keyword = ref(useObjetoStore.getKeyword); // Carrega a última pesquisa
const listaObj = ref(useObjetoStore.getLista); // Mantém a lista carregada
const listaObjDim = ref(useObjetoStore.getListaDim); // Mantém a lista carregada

const listaDimensoes = ListaTipoDim();
const dimensoesSelecionadas = ref<Dimensao[]>([...listaDimensoes]);

const listaColecoes = ref<ClasseComum[]>([]);
const colecoesFiltradas = ref<ClasseComum[]>([]);
const colecaoSelecionada = ref<string | null>(null);

const aba = ref<string>('fisicos');
const visualizacao = ref<'tabela' | 'cards'>('cards');

// Cor e ícone dos cards por tipo (paleta categórica fixa, mesma do grafo de
// relações) - identidade visual leve pra reconhecer o tipo de relance.
const CORES_DIMENSAO: Record<string, string> = {
  Pessoa: '#2a78d6',
  Evento: '#eb6834',
  Lugar: '#1baf7a',
  Tempo: '#eda100',
};
const ICONES_DIMENSAO: Record<string, string> = {
  Pessoa: 'person',
  Lugar: 'place',
  Evento: 'event',
  Tempo: 'schedule',
};
const CORES_TIPO_FISICO: Record<string, string> = {
  Bibliotecario: '#2a78d6',
  Arqueologico: '#eb6834',
  MuseuLogico: '#1baf7a',
  'Arquivistico-Documental': '#eda100',
  'Imagetico-Sonoro': '#e87ba4',
};
const ICONES_TIPO_FISICO: Record<string, string> = {
  Bibliotecario: 'menu_book',
  Arqueologico: 'terrain',
  MuseuLogico: 'museum',
  'Arquivistico-Documental': 'folder_open',
  'Imagetico-Sonoro': 'perm_media',
};
const COR_TIPO_PADRAO = '#898781';
const ICONE_TIPO_PADRAO = 'category';

function hexParaRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function corDimensao(obj: any): string {
  const tipo = textoAposUltimoChar(obj?.dimensao || '', '#');
  return CORES_DIMENSAO[tipo] || COR_TIPO_PADRAO;
}
function iconeDimensao(obj: any): string {
  const tipo = textoAposUltimoChar(obj?.dimensao || '', '#');
  return ICONES_DIMENSAO[tipo] || ICONE_TIPO_PADRAO;
}
function corTipoFisico(obj: ObjetoFisico): string {
  const tipo = obj.tipoFisicoAbreviado?.[0];
  return (tipo && CORES_TIPO_FISICO[tipo]) || COR_TIPO_PADRAO;
}
function iconeTipoFisico(obj: ObjetoFisico): string {
  const tipo = obj.tipoFisicoAbreviado?.[0];
  return (tipo && ICONES_TIPO_FISICO[tipo]) || ICONE_TIPO_PADRAO;
}

function rotuloColecao(colecao: ClasseComum): string {
  return colecao.label || colecao.nome_curto;
}
async function carregarColecoes() {
  listaColecoes.value = await listarClasses('');
  colecoesFiltradas.value = listaColecoes.value;
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
onMounted(() => {
  carregarColecoes();
  const colecaoNaUrl = route.query.colecao;
  if (typeof colecaoNaUrl === 'string' && colecaoNaUrl !== '') {
    aba.value = 'fisicos';
    keyword.value = '';
    colecaoSelecionada.value = colecaoNaUrl;
    pesquisarFis();
  }
});

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
function buscar() {
  aba.value == 'fisicos' ? pesquisarFis() : pesquisarDim();
}
function dimensaoSelecionada(dim: Dimensao) {
  return dimensoesSelecionadas.value.some((d) => d.tipo === dim.tipo);
}
function alternarDimensao(dim: Dimensao) {
  if (dimensaoSelecionada(dim)) {
    dimensoesSelecionadas.value = dimensoesSelecionadas.value.filter(
      (d) => d.tipo !== dim.tipo
    );
  } else {
    dimensoesSelecionadas.value.push(dim);
  }
  pesquisarDim();
}
async function pesquisarDim() {
  let resultado: ObjetoDimensional[] = [];
  if (dimensoesSelecionadas.value.length !== 0) {
    if (dimensoesSelecionadas.value.length === listaDimensoes.length) {
      const obj = ref({} as ObjetoDimensional);
      obj.value.descricao = keyword.value;
      resultado = await pesquisarObjetosDim(obj.value);
    } else {
      const resultados = await Promise.all(
        dimensoesSelecionadas.value.map((dim) => {
          const obj = ref({} as ObjetoDimensional);
          obj.value.descricao = keyword.value;
          obj.value.tipo = dim;
          return pesquisarObjetosDim(obj.value);
        })
      );
      resultado = resultados.flat();
    }
  }
  listaObjDim.value = resultado;
  useObjetoStore.setListaDim(resultado); // Salva no store
  useObjetoStore.setKeyword(keyword.value); // Salva a palavra-chave
}

async function pesquisarFis() {
  const obj = ref({} as ObjetoFisico);
  obj.value.descricao = keyword.value;
  const resultado = await pesquisarObjetosFisicos(obj.value);
  listaObj.value = colecaoSelecionada.value
    ? resultado.filter((item) =>
        item.colecaoLista.includes(colecaoSelecionada.value as string)
      )
    : resultado;
  useObjetoStore.setLista(listaObj); // Salva no store
  useObjetoStore.setKeyword(keyword.value); // Salva a palavra-chave
}

function irParaNovo() {
  const obj = ref({ id: '', titulo: '' } as ObjetoFisico);
  useObjetoStore.limparObjeto;
  useObjetoStore.setObjeto(obj);
  somenteLeituraObjeto.value = false;
  mostrarPopUpObjetoFis.value = true;
}
function irParaNovoDim() {
  const objVazio = objetoDimensionalVazio();
  useObjetoStore.setObjetoDim(objVazio);
  useObjetoStore.setObjeto(objVazio);
  somenteLeituraObjeto.value = false;
  mostrarPopUpObjetoDim.value = true;
}

function abrirObjeto(obj: ObjetoFisico, somenteLeitura: boolean) {
  somenteLeituraObjeto.value = somenteLeitura;
  if (aba.value == 'fisicos') {
    useObjetoStore.setObjeto(obj);
    mostrarPopUpObjetoFis.value = true;
  } else {
    useObjetoStore.setObjetoDim(obj);
    useObjetoStore.setObjeto(obj);
    mostrarPopUpObjetoDim.value = true;
  }
}
function irParaEditar(obj: ObjetoFisico) {
  abrirObjeto(obj, false);
}
function irParaVisualizar(obj: ObjetoFisico) {
  abrirObjeto(obj, true);
}

function deletarObjeto(obj: ObjetoFisico) {
  deletarObjetoFisico(obj);
  pesquisarFis();
}
function irParaMidias(obj: ObjetoFisico) {
  useObjetoStore.setObjeto(obj);

  mostrarPopUpMidias.value = true;
}
function irParaRelacoes(obj: ObjetoFisico) {
  useObjetoStore.setObjeto(obj);
  mostrarPopUpRelacoes.value = true;
}
function irParaGrafo(obj: ObjetoFisico) {
  useObjetoStore.setObjeto(obj);
  mostrarPopUpGrafoRelacoes.value = true;
}
function Upload(id: string) {
  router.push('upload-midias/:' + id);
}

// Recarrega a lista automaticamente ao trocar de aba, sem precisar clicar em "Pesquisar"
watch(aba, () => {
  buscar();
});
</script>

<template>
  <div class="q-pa-sm">
    <q-tabs
      v-model="aba"
      class="text-teal"
      align="justify"
      active-color="teal"
      indicator-color="teal"
    >
      <q-tab name="fisicos" label="Físicos" />
      <q-tab name="dimensionais" label="Dimensionais" />
    </q-tabs>
    <q-card>
      <q-card-section>
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-xs-6 col-md-6 col-lg-8">
            <q-input
              outlined
              dense
              v-model="keyword"
              :option-label="labelTipo"
              @keyup.enter="buscar()"
            />
          </div>
          <div class="col-xs-6 col-md-6 col-lg-4">
            <q-btn
              @click="buscar"
              color="teal"
              label="Pesquisar"
              icon="search"
              class="q-ml-md"
            />
            <q-btn
              v-if="aba == 'fisicos' && usuarioAdminLogado"
              @click="irParaNovo"
              icon="add"
              color="green-8"
              flat
              rounded
            />
            <q-btn
              v-if="aba == 'dimensionais' && usuarioAdminLogado"
              @click="irParaNovoDim"
              icon="add"
              color="green-8"
              flat
              rounded
            />
          </div>
        </div>

        <div class="row q-mb-md">
          <div class="col-12 flex justify-end">
            <q-btn-toggle
              v-model="visualizacao"
              dense
              unelevated
              toggle-color="teal"
              color="white"
              text-color="grey-8"
              :options="[
                { value: 'tabela', icon: 'table_rows', label: 'Tabela' },
                { value: 'cards', icon: 'grid_view', label: 'Cards' },
              ]"
            />
          </div>
        </div>

        <div v-if="aba == 'fisicos'" class="row q-mb-md">
          <div class="col-xs-12 col-md-6">
            <div class="text-caption text-grey-8 q-mb-xs">
              Filtrar por coleção
            </div>
            <q-select
              v-model="colecaoSelecionada"
              :options="colecoesFiltradas"
              :option-label="rotuloColecao"
              option-value="uri"
              emit-value
              map-options
              outlined
              dense
              clearable
              use-input
              input-debounce="0"
              label="Todas as coleções"
              @filter="filtrarColecoes"
              @update:model-value="pesquisarFis()"
            />
          </div>
        </div>

        <div v-if="aba == 'dimensionais'" class="q-mb-md">
          <div class="text-caption text-grey-8 q-mb-xs">
            Filtrar por dimensão
          </div>
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

        <q-table
          v-if="aba == 'fisicos' && visualizacao == 'tabela'"
          :rows="listaObj"
          :columns="colunasFisico"
          row-key="id"
          striped
          title="Objetos físicos do Acervo"
          wrap-cells
          class="tabela-clicavel"
          @row-click="(evt, row) => irParaVisualizar(row)"
        >
          <template v-slot:body-cell-#="{ rowIndex }">
            <q-td>{{ rowIndex + 1 }}</q-td>
          </template>
          <template v-slot:body-cell-id="props">
            <q-td style="font-size: 10px">{{ props.row.id }}</q-td>
          </template>
          <template v-slot:body-cell-acoes="props">
            <q-td :props="props" @click.stop>
              <q-btn dense flat icon="more_vert">
                <q-menu fit dense>
                  <q-list dense style="min-width: 100px">
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaVisualizar(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="visibility" />
                      </q-item-section>
                      <q-item-section>Visualizar</q-item-section>
                    </q-item>
                    <q-item
                      v-if="usuarioAdminLogado"
                      clickable
                      v-close-popup
                      @click="irParaEditar(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="edit" />
                      </q-item-section>
                      <q-item-section>Editar</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaMidias(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="photo" />
                      </q-item-section>
                      <q-item-section>Mídias</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaRelacoes(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="hub" />
                      </q-item-section>
                      <q-item-section>Relações</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaGrafo(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="account_tree" />
                      </q-item-section>
                      <q-item-section>Grafo</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item v-if="usuarioAdminLogado"
                      clickable
                      v-close-popup
                      @click="deletarObjeto(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="delete_forever" color="red-7" v-if="usuarioAdminLogado" />
                      </q-item-section>
                      <q-item-section>Excluir</q-item-section>
                    </q-item>
                  </q-list></q-menu
                >
              </q-btn>
            </q-td>
          </template>
        </q-table>
        <q-table
          v-if="aba == 'dimensionais' && visualizacao == 'tabela'"
          :rows="listaObjDim"
          :columns="colunasDim"
          row-key="id"
          striped
          title="Objetos dimensionais do Acervo"
          wrap-cells
          class="tabela-clicavel"
          @row-click="(evt, row) => irParaVisualizar(row)"
        >
          <template v-slot:body-cell-#="{ rowIndex }">
            <q-td>{{ rowIndex + 1 }}</q-td>
          </template>
          <template v-slot:body-cell-id="props">
            <q-td style="font-size: 10px">{{ props.row.id }}</q-td>
          </template>
          <template v-slot:body-cell-resumo="props">
            <q-td>{{ truncarTexto(props.row.resumo, 150) }}</q-td>
          </template>
          <template v-slot:body-cell-dimensao="props">
            <q-td :props="props">{{
              textoAposUltimoChar(props.row.dimensao, '#')
            }}</q-td>
          </template>
          <template v-slot:body-cell-acoes="props">
            <q-td :props="props" @click.stop>
              <q-btn dense flat icon="more_vert">
                <q-menu fit dense>
                  <q-list dense style="min-width: 100px">
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaVisualizar(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="visibility" />
                      </q-item-section>
                      <q-item-section>Visualizar</q-item-section>
                    </q-item>
                    <q-item
                      v-if="usuarioAdminLogado"
                      clickable
                      v-close-popup
                      @click="irParaEditar(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="edit" />
                      </q-item-section>
                      <q-item-section>Editar</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaMidias(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="photo" />
                      </q-item-section>
                      <q-item-section>Mídias</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaRelacoes(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="hub" />
                      </q-item-section>
                      <q-item-section>Relações</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaGrafo(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="account_tree" />
                      </q-item-section>
                      <q-item-section>Grafo</q-item-section>
                    </q-item>
                    <q-item
                      v-if="1 > 1"
                      clickable
                      v-close-popup
                      @click="Upload(props.row.id)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="upload" />
                      </q-item-section>
                      <q-item-section>Upload</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                    v-if="usuarioAdminLogado"
                      clickable
                      v-close-popup
                      @click="deletarObjeto(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="delete_forever" color="red-7" />
                      </q-item-section>
                      <q-item-section>Excluir</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <div v-if="aba == 'fisicos' && visualizacao == 'cards'">
          <div
            v-if="listaObj.length === 0"
            class="text-grey-7 text-center q-pa-lg"
          >
            Nenhum objeto físico encontrado.
          </div>
          <div v-else class="row q-col-gutter-md">
            <div
              v-for="obj in listaObj"
              :key="obj.id"
              class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
            >
              <q-card
                bordered
                flat
                class="objeto-card"
                :style="{
                  backgroundColor: hexParaRgba(corTipoFisico(obj), 0.1),
                  borderLeft: '4px solid ' + corTipoFisico(obj),
                }"
                @click="irParaVisualizar(obj)"
              >
                <q-icon
                  :name="iconeTipoFisico(obj)"
                  :style="{ color: corTipoFisico(obj) }"
                  class="objeto-card-icone"
                  size="18px"
                />
                <q-card-section>
                  <div class="objeto-card-titulo">{{ obj.titulo }}</div>
                  <div class="text-caption text-grey-7 q-mb-xs">
                    <span
                      v-if="
                        obj.colecaoListaAbreviada &&
                        obj.colecaoListaAbreviada.length
                      "
                      >{{ obj.colecaoListaAbreviada.join(', ') }}</span
                    >
                    <span
                      v-if="
                        obj.tipoFisicoAbreviado &&
                        obj.tipoFisicoAbreviado.length
                      "
                    >
                      · {{ obj.tipoFisicoAbreviado.join(', ') }}
                    </span>
                  </div>
                  <div class="objeto-card-resumo">
                    {{
                      truncarTexto(
                        obj.resumo || obj.descricao || 'Sem resumo.',
                        140
                      )
                    }}
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right" @click.stop>
                  <q-btn dense flat icon="more_vert">
                    <q-menu fit dense>
                      <q-list dense style="min-width: 100px">
                        <q-item
                          clickable
                          v-close-popup
                          @click="irParaVisualizar(obj)"
                        >
                          <q-item-section avatar>
                            <q-avatar icon="visibility" />
                          </q-item-section>
                          <q-item-section>Visualizar</q-item-section>
                        </q-item>
                        <q-item
                          v-if="usuarioAdminLogado"
                          clickable
                          v-close-popup
                          @click="irParaEditar(obj)"
                        >
                          <q-item-section avatar>
                            <q-avatar icon="edit" />
                          </q-item-section>
                          <q-item-section>Editar</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="irParaMidias(obj)"
                        >
                          <q-item-section avatar flat>
                            <q-avatar icon="photo" />
                          </q-item-section>
                          <q-item-section>Mídias</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="irParaRelacoes(obj)"
                        >
                          <q-item-section avatar flat>
                            <q-avatar icon="hub" />
                          </q-item-section>
                          <q-item-section>Relações</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="irParaGrafo(obj)"
                        >
                          <q-item-section avatar flat>
                            <q-avatar icon="account_tree" />
                          </q-item-section>
                          <q-item-section>Grafo</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item v-if="usuarioAdminLogado"
                          clickable
                          v-close-popup
                          @click="deletarObjeto(obj)"
                        >
                          <q-item-section avatar>
                            <q-avatar icon="delete_forever" color="red-7" />
                          </q-item-section>
                          <q-item-section>Excluir</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>

        <div v-if="aba == 'dimensionais' && visualizacao == 'cards'">
          <div
            v-if="listaObjDim.length === 0"
            class="text-grey-7 text-center q-pa-lg"
          >
            Nenhum objeto dimensional encontrado.
          </div>
          <div v-else class="row q-col-gutter-md">
            <div
              v-for="obj in listaObjDim"
              :key="obj.id"
              class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
            >
              <q-card
                bordered
                flat
                class="objeto-card"
                :style="{
                  backgroundColor: hexParaRgba(corDimensao(obj), 0.1),
                  borderLeft: '4px solid ' + corDimensao(obj),
                }"
                @click="irParaVisualizar(obj)"
              >
                <q-icon
                  :name="iconeDimensao(obj)"
                  :style="{ color: corDimensao(obj) }"
                  class="objeto-card-icone"
                  size="18px"
                />
                <q-card-section>
                  <div class="objeto-card-titulo">{{ obj.titulo }}</div>
                  <div class="text-caption text-grey-7 q-mb-xs" v-if="(obj as any).dimensao">
                    {{ textoAposUltimoChar((obj as any).dimensao, '#') }}
                  </div>
                  <div class="objeto-card-resumo">
                    {{
                      truncarTexto(
                        obj.resumo || obj.descricao || 'Sem resumo.',
                        140
                      )
                    }}
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right" @click.stop>
                  <q-btn dense flat icon="more_vert">
                    <q-menu fit dense>
                      <q-list dense style="min-width: 100px">
                        <q-item
                          clickable
                          v-close-popup
                          @click="irParaVisualizar(obj)"
                        >
                          <q-item-section avatar>
                            <q-avatar icon="visibility" />
                          </q-item-section>
                          <q-item-section>Visualizar</q-item-section>
                        </q-item>
                        <q-item
                          v-if="usuarioAdminLogado"
                          clickable
                          v-close-popup
                          @click="irParaEditar(obj)"
                        >
                          <q-item-section avatar>
                            <q-avatar icon="edit" />
                          </q-item-section>
                          <q-item-section>Editar</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="irParaMidias(obj)"
                        >
                          <q-item-section avatar flat>
                            <q-avatar icon="photo" />
                          </q-item-section>
                          <q-item-section>Mídias</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="irParaRelacoes(obj)"
                        >
                          <q-item-section avatar flat>
                            <q-avatar icon="hub" />
                          </q-item-section>
                          <q-item-section>Relações</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="irParaGrafo(obj)"
                        >
                          <q-item-section avatar flat>
                            <q-avatar icon="account_tree" />
                          </q-item-section>
                          <q-item-section>Grafo</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item v-if="usuarioAdminLogado"
                          clickable
                          v-close-popup
                          @click="deletarObjeto(obj)"
                        >
                          <q-item-section avatar>
                            <q-avatar icon="delete_forever" color="red-7" />
                          </q-item-section>
                          <q-item-section>Excluir</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-btn-group flat push>
          <q-btn
            v-if="aba == 'fisicos' && usuarioAdminLogado"
            @click="irParaNovo"
            color="primary"
            label="Criar"
          />
          <q-btn
            v-if="aba == 'dimensionais' && usuarioAdminLogado"
            @click="irParaNovoDim"
            color="green-8"
            label="Criar"
          />
          <q-btn @click="router.go(-1)" label="Voltar" color="secondary" />
        </q-btn-group>
      </q-card-section>
    </q-card>

    <template>
      <DialogoObjetoDim />
      <DialogoObjetoFis />

      <ComponenteMidia />
      <ComponenteRelacao />
      <ComponenteAddRelacao />
      <ComponenteGrafoRelacoes />
    </template>
  </div>
</template>

<style scoped>
.tabela-clicavel :deep(tbody tr) {
  cursor: pointer;
}
.tabela-clicavel :deep(tbody tr:hover) {
  background: rgba(0, 150, 136, 0.06);
}

.objeto-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.15s ease;
}
.objeto-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.14);
}
.objeto-card-icone {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0.65;
}
.objeto-card-titulo {
  font-weight: 700;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.objeto-card-resumo {
  font-size: 12px;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  word-break: break-word;
}
</style>
