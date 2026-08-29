<script setup lang="ts">
import { ref, computed, watchEffect, nextTick } from 'vue';

import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import { mostrarPopUpGrafoRelacoes, ObjetoFisico, Tripla } from './manter-objeto';
import { pesquisarRelacoes } from 'src/services/api-objeto-dim';
import { mapearPropriedade, textoAposUltimoChar, truncarTexto } from '../funcoes';

// Cores categóricas (slots 1 e 2 da paleta validada) - identidade de dois grupos de aresta
const COR_ATRIBUTO = '#2a78d6';
const COR_RELACAO = '#eb6834';

type Categoria = 'atributo' | 'relacao';
interface Aresta {
  rotulo: string;
  valor: string;
  categoria: Categoria;
}

// Dimensões do desenho
const NODE_W = 150;
const NODE_H = 60;
const CENTRAL_W = 220;
const CENTRAL_H = 100;
const MARGEM = 140;

const objetoStore = useDadosObjetoFisico();
const objetoId = ref('' as string);
const objetoSelecionado = ref({} as ObjetoFisico);
const listaRelacoesDoObjeto = ref([] as Tripla[]);

async function carregar() {
  objetoId.value = objetoStore.getObjeto.obj;
  objetoSelecionado.value = objetoStore.getObjeto;
  listaRelacoesDoObjeto.value = await pesquisarRelacoes(objetoId.value);
}
watchEffect(() => {
  if (mostrarPopUpGrafoRelacoes.value) {
    carregar().then(() => nextTick(ajustarZoomInicial));
  }
});

// Zoom e arraste (pan)
const ESCALA_MIN = 0.4;
const ESCALA_MAX = 2.5;
const escala = ref(1);
const deslocamento = ref({ x: 0, y: 0 });
const arrastando = ref(false);
const viewportEl = ref<HTMLElement | null>(null);
let arrastandoInterno = false;
let ultimoX = 0;
let ultimoY = 0;

function limitar(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}
function aumentarZoom() {
  escala.value = limitar(Number((escala.value + 0.2).toFixed(2)), ESCALA_MIN, ESCALA_MAX);
}
function diminuirZoom() {
  escala.value = limitar(Number((escala.value - 0.2).toFixed(2)), ESCALA_MIN, ESCALA_MAX);
}
function ajustarZoomInicial() {
  deslocamento.value = { x: 0, y: 0 };
  if (!viewportEl.value) {
    escala.value = 1;
    return;
  }
  const larguraDisponivel = viewportEl.value.clientWidth;
  const alturaDisponivel = viewportEl.value.clientHeight;
  if (!larguraDisponivel || !alturaDisponivel) {
    escala.value = 1;
    return;
  }
  const fator = Math.min(
    larguraDisponivel / largura.value,
    alturaDisponivel / altura.value,
    1
  );
  escala.value = limitar(Number(fator.toFixed(2)), ESCALA_MIN, ESCALA_MAX);
}
function aoRolar(e: WheelEvent) {
  const fator = e.deltaY > 0 ? -0.1 : 0.1;
  escala.value = limitar(Number((escala.value + fator).toFixed(2)), ESCALA_MIN, ESCALA_MAX);
}
function iniciarArraste(e: MouseEvent) {
  arrastandoInterno = true;
  arrastando.value = true;
  ultimoX = e.clientX;
  ultimoY = e.clientY;
}
function arrastar(e: MouseEvent) {
  if (!arrastandoInterno) {
    return;
  }
  const dx = e.clientX - ultimoX;
  const dy = e.clientY - ultimoY;
  ultimoX = e.clientX;
  ultimoY = e.clientY;
  deslocamento.value = {
    x: deslocamento.value.x + dx,
    y: deslocamento.value.y + dy,
  };
}
function pararArraste() {
  arrastandoInterno = false;
  arrastando.value = false;
}

function formatarValorBasico(bruto: unknown): string {
  if (Array.isArray(bruto)) {
    return bruto.filter(Boolean).join(', ');
  }
  if (typeof bruto === 'string') {
    return bruto.trim();
  }
  return '';
}

function formatarTipo(obj: any): string {
  if (obj?.tipo && typeof obj.tipo === 'object' && obj.tipo.tipo) {
    return obj.tipo.tipo;
  }
  if (typeof obj?.tipo === 'string' && obj.tipo !== '') {
    return textoAposUltimoChar(obj.tipo, '#');
  }
  if (Array.isArray(obj?.tipoFisicoAbreviado) && obj.tipoFisicoAbreviado.length) {
    return obj.tipoFisicoAbreviado.join(', ');
  }
  return '';
}

function capitalizar(texto: string): string {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}

function rotuloRelacao(row: any): string {
  const bruto = textoAposUltimoChar(
    mapearPropriedade(row.propriedade?.value || ''),
    '#'
  );
  return capitalizar(bruto || 'relação');
}

function valorRelacao(row: any): string {
  return (
    row.titulo?.value || textoAposUltimoChar(row.valor?.value || '', '#') || ''
  );
}

const ATRIBUTOS_BASICOS: { chave: string; rotulo: string }[] = [
  { chave: 'titulo', rotulo: 'Título' },
  { chave: 'resumo', rotulo: 'Resumo' },
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'assunto', rotulo: 'Assunto' },
  { chave: 'dimensao', rotulo: 'Dimensão' },
  { chave: 'colecao', rotulo: 'Coleção' },
];

const arestas = computed<Aresta[]>(() => {
  const obj: any = objetoSelecionado.value;
  const lista: Aresta[] = [];

  ATRIBUTOS_BASICOS.forEach(({ chave, rotulo }) => {
    const valor = formatarValorBasico(obj?.[chave]);
    if (valor) {
      lista.push({ rotulo, valor, categoria: 'atributo' });
    }
  });

  const tipoValor = formatarTipo(obj);
  if (tipoValor) {
    lista.push({ rotulo: 'Tipo', valor: tipoValor, categoria: 'atributo' });
  }

  listaRelacoesDoObjeto.value.forEach((row) => {
    const valor = valorRelacao(row);
    if (valor) {
      lista.push({
        rotulo: rotuloRelacao(row),
        valor,
        categoria: 'relacao',
      });
    }
  });

  return lista;
});

const total = computed(() => Math.max(arestas.value.length, 1));
const raio = computed(() =>
  Math.max(210, (total.value * (NODE_W + 24)) / (2 * Math.PI))
);
const largura = computed(() => raio.value * 2 + NODE_W + MARGEM);
const altura = computed(() => raio.value * 2 + NODE_H + MARGEM);
const centroX = computed(() => largura.value / 2);
const centroY = computed(() => altura.value / 2);

const nos = computed(() =>
  arestas.value.map((aresta, i) => {
    const angulo = -Math.PI / 2 + (i * 2 * Math.PI) / arestas.value.length;
    const x = centroX.value + raio.value * Math.cos(angulo);
    const y = centroY.value + raio.value * Math.sin(angulo);
    const meioX = centroX.value + raio.value * 0.55 * Math.cos(angulo);
    const meioY = centroY.value + raio.value * 0.55 * Math.sin(angulo);
    return { ...aresta, x, y, meioX, meioY };
  })
);

function corCategoria(categoria: Categoria): string {
  return categoria === 'atributo' ? COR_ATRIBUTO : COR_RELACAO;
}

const tituloCentral = computed(
  () => objetoSelecionado.value.titulo || objetoSelecionado.value.id || 'Objeto'
);
const subtituloCentral = computed(() =>
  objetoSelecionado.value.id ? `#${objetoSelecionado.value.id}` : ''
);
</script>

<template>
  <q-dialog
    v-model="mostrarPopUpGrafoRelacoes"
    class="q-pa-md scroll"
    persistent
  >
    <q-card style="width: 90vw; max-width: 90vw; max-height: 92vh">
      <q-toolbar>
        <q-toolbar-title>Grafo de Relações</q-toolbar-title>
        <q-btn
          icon="close"
          label="fechar"
          @click="mostrarPopUpGrafoRelacoes = false"
          flat
        />
      </q-toolbar>

      <q-card-section>
        <div class="row items-center q-gutter-lg q-mb-md">
          <div class="row items-center">
            <span class="legenda-swatch" :style="{ background: COR_ATRIBUTO }" />
            <span>Atributos básicos</span>
          </div>
          <div class="row items-center">
            <span class="legenda-swatch" :style="{ background: COR_RELACAO }" />
            <span>Relações</span>
          </div>
        </div>

        <div v-if="arestas.length === 0" class="text-grey-7 q-pa-lg text-center">
          Nenhum atributo ou relação para exibir.
        </div>

        <div v-else class="grafo-container">
          <div class="grafo-toolbar">
            <q-btn dense round flat icon="zoom_in" @click="aumentarZoom">
              <q-tooltip>Aumentar zoom</q-tooltip>
            </q-btn>
            <q-btn dense round flat icon="zoom_out" @click="diminuirZoom">
              <q-tooltip>Diminuir zoom</q-tooltip>
            </q-btn>
            <q-btn dense round flat icon="fit_screen" @click="ajustarZoomInicial">
              <q-tooltip>Ajustar à tela</q-tooltip>
            </q-btn>
            <span class="grafo-zoom-label">{{ Math.round(escala * 100) }}%</span>
          </div>
          <div
            ref="viewportEl"
            class="grafo-viewport"
            :class="{ 'grafo-viewport--arrastando': arrastando }"
            @wheel.prevent="aoRolar"
            @mousedown="iniciarArraste"
            @mousemove="arrastar"
            @mouseup="pararArraste"
            @mouseleave="pararArraste"
          >
          <svg
            :viewBox="`0 0 ${largura} ${altura}`"
            :width="largura"
            :height="altura"
            :style="{
              transform: `translate(${deslocamento.x}px, ${deslocamento.y}px) scale(${escala})`,
            }"
          >
            <defs>
              <marker
                v-for="cat in (['atributo', 'relacao'] as Categoria[])"
                :id="'seta-' + cat"
                :key="cat"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" :fill="corCategoria(cat)" />
              </marker>
            </defs>

            <line
              v-for="(no, i) in nos"
              :key="'edge-' + i"
              :x1="centroX"
              :y1="centroY"
              :x2="no.x"
              :y2="no.y"
              :stroke="corCategoria(no.categoria)"
              stroke-width="2"
              opacity="0.55"
              :marker-end="`url(#seta-${no.categoria})`"
            />

            <foreignObject
              v-for="(no, i) in nos"
              :key="'label-' + i"
              :x="no.meioX - 55"
              :y="no.meioY - 13"
              width="110"
              height="26"
            >
              <div
                class="rotulo-aresta"
                :style="{ borderColor: corCategoria(no.categoria) }"
              >
                {{ no.rotulo }}
              </div>
            </foreignObject>

            <foreignObject
              v-for="(no, i) in nos"
              :key="'node-' + i"
              :x="no.x - NODE_W / 2"
              :y="no.y - NODE_H / 2"
              :width="NODE_W"
              :height="NODE_H"
            >
              <div
                class="no-valor"
                :style="{ borderLeftColor: corCategoria(no.categoria) }"
                :title="no.valor"
              >
                {{ truncarTexto(no.valor, 80) }}
              </div>
            </foreignObject>

            <foreignObject
              :x="centroX - CENTRAL_W / 2"
              :y="centroY - CENTRAL_H / 2"
              :width="CENTRAL_W"
              :height="CENTRAL_H"
            >
              <div class="no-central" :title="tituloCentral">
                <q-icon name="hub" size="20px" class="q-mb-xs" />
                <div class="no-central-titulo">{{ tituloCentral }}</div>
                <div v-if="subtituloCentral" class="no-central-sub">
                  {{ subtituloCentral }}
                </div>
              </div>
            </foreignObject>
          </svg>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.legenda-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 6px;
}
.grafo-container {
  position: relative;
  overflow: hidden;
  border: 1px solid #e1e0d9;
  border-radius: 8px;
  background: #fcfcfb;
}
.grafo-viewport {
  overflow: hidden;
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
}
.grafo-viewport--arrastando {
  cursor: grabbing;
}
.grafo-viewport svg {
  flex-shrink: 0;
}
.grafo-toolbar {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e1e0d9;
  border-radius: 999px;
  padding: 2px 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}
.grafo-zoom-label {
  font-size: 12px;
  color: #52514e;
  min-width: 38px;
  text-align: center;
}
.no-central {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #ffffff;
  border: 2px solid #0b0b0b;
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  padding: 6px 10px;
}
.no-central-titulo {
  font-weight: 700;
  font-size: 13px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.no-central-sub {
  font-size: 11px;
  color: #52514e;
  margin-top: 2px;
}
.no-valor {
  box-sizing: border-box;
  height: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  -webkit-box-pack: center;
  -webkit-box-align: center;
  overflow: hidden;
  text-align: center;
  background: #fcfcfb;
  border: 1px solid #c3c2b7;
  border-left: 4px solid;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1.25;
  cursor: default;
}
.rotulo-aresta {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1.5px solid;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  padding: 2px 8px;
  color: #52514e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
