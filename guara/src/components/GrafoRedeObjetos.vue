<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { zoom } from 'd3-zoom';
import { pesquisarObjetosFisicos } from 'src/services/objeto-fisico-api';
import { pesquisarRelacoes } from 'src/services/api-objeto-dim';
import { ObjetoFisico } from 'src/pages/objetos/manter-objeto';
import { Repositorio } from 'src/pages/tipos';
import { truncarTexto } from 'src/pages/funcoes';

// Amostra pequena de propósito: isto roda na home, antes de a pessoa
// "entrar" num repositório - N objetos + 1 busca de relações por objeto.
const TAMANHO_AMOSTRA = 6;
const LARGURA = 640;
const ALTURA = 340;

type TipoNo = 'fisico' | 'Pessoa' | 'Lugar' | 'Evento' | 'Tempo' | 'outro';

const CORES_TIPO: Record<TipoNo, string> = {
  fisico: '#f4941e', // laranja do guará - os objetos que de fato buscamos
  Pessoa: '#2a78d6',
  Lugar: '#1baf7a',
  Evento: '#eb6834',
  Tempo: '#eda100',
  outro: '#898781',
};

interface NoGrafo extends SimulationNodeDatum {
  id: string;
  titulo: string;
  tipo: TipoNo;
  // Só presente pros nós que efetivamente buscamos (a amostra em si) -
  // entidades citadas só numa relação (Pessoa/Lugar/...) não têm o
  // registro completo, só o que veio junto na própria relação.
  objetoCompleto?: ObjetoFisico;
}
interface LinkGrafo extends SimulationLinkDatum<NoGrafo> {
  rotulo: string;
}

const props = defineProps<{
  repositorio: Repositorio | null;
}>();

const emit = defineEmits<{
  (
    e: 'abrir-objeto',
    payload: { repositorio: Repositorio; objeto?: ObjetoFisico }
  ): void;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const carregando = ref(false);
const semDados = ref(false);
let simulacao: Simulation<NoGrafo, LinkGrafo> | null = null;

function pararSimulacao() {
  simulacao?.stop();
  simulacao = null;
}

function corDoTipo(tipo: TipoNo): string {
  return CORES_TIPO[tipo] || CORES_TIPO.outro;
}

async function carregarAmostra(repo: Repositorio | null) {
  pararSimulacao();
  if (!repo?.uri) {
    semDados.value = false;
    carregando.value = false;
    return;
  }

  carregando.value = true;
  semDados.value = false;
  try {
    const objetos = await pesquisarObjetosFisicos(
      { descricao: '' } as ObjetoFisico,
      repo.uri
    );
    const amostra = objetos.slice(0, TAMANHO_AMOSTRA);

    if (amostra.length === 0) {
      semDados.value = true;
      return;
    }

    const relacoesPorObjeto = await Promise.all(
      amostra.map((obj) => pesquisarRelacoes(obj.obj, repo.uri))
    );

    const nos = new Map<string, NoGrafo>();
    const links: LinkGrafo[] = [];

    amostra.forEach((obj) => {
      nos.set(obj.obj, {
        id: obj.obj,
        titulo: obj.titulo || obj.id,
        tipo: 'fisico',
        objetoCompleto: obj,
      });
    });

    amostra.forEach((obj, indice) => {
      (relacoesPorObjeto[indice] || []).forEach((rel: any) => {
        const destinoUri: string = rel.objAssociado || '';
        if (!destinoUri || destinoUri === obj.obj || nos.has(destinoUri)) {
          // Sem destino, auto-relação, ou já é nó (evita duplicar e
          // também dispensa link repetido entre o mesmo par).
          if (destinoUri && destinoUri !== obj.obj && nos.has(destinoUri)) {
            links.push({
              source: obj.obj,
              target: destinoUri,
              rotulo: rel.propriedade_abreviada || '',
            });
          }
          return;
        }
        const tipoDim = rel.tipoDimensao
          ? (rel.tipoDimensao.split('#').pop() as string)
          : '';
        const tipo: TipoNo = (
          ['Pessoa', 'Lugar', 'Evento', 'Tempo'] as string[]
        ).includes(tipoDim)
          ? (tipoDim as TipoNo)
          : 'outro';
        nos.set(destinoUri, {
          id: destinoUri,
          titulo:
            rel.titulo?.value ||
            (destinoUri.split('#').pop() as string) ||
            'Item',
          tipo,
        });
        links.push({
          source: obj.obj,
          target: destinoUri,
          rotulo: rel.propriedade_abreviada || '',
        });
      });
    });

    iniciarSimulacao(Array.from(nos.values()), links);
  } catch (error) {
    console.error('Erro ao montar amostra do grafo:', error);
    semDados.value = true;
  } finally {
    carregando.value = false;
  }
}

function iniciarSimulacao(nos: NoGrafo[], links: LinkGrafo[]) {
  if (!svgRef.value) return;
  const svg = select(svgRef.value);
  svg.selectAll('*').remove();

  const grupoZoom = svg.append('g');

  const linkSel = grupoZoom
    .append('g')
    .attr('stroke', '#c9cbd6')
    .attr('stroke-width', 1.2)
    .selectAll('line')
    .data(links)
    .join('line');

  const noSel = grupoZoom
    .append('g')
    .selectAll<SVGGElement, NoGrafo>('g')
    .data(nos)
    .join('g')
    .style('cursor', 'pointer')
    .on('click', (_evento: Event, d: NoGrafo) => aoClicarNo(d));

  noSel
    .append('circle')
    .attr('r', (d) => (d.tipo === 'fisico' ? 20 : 13))
    .attr('fill', (d) => corDoTipo(d.tipo))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  noSel
    .append('text')
    .text((d) => truncarTexto(d.titulo, 16))
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => (d.tipo === 'fisico' ? 34 : 25))
    .attr('font-size', '10px')
    .attr('fill', '#4a4a4a');

  noSel.call(
    drag<SVGGElement, NoGrafo>()
      .on('start', (evento, d) => {
        if (!evento.active) simulacao?.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (evento, d) => {
        d.fx = evento.x;
        d.fy = evento.y;
      })
      .on('end', (evento, d) => {
        if (!evento.active) simulacao?.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      })
  );

  simulacao = forceSimulation(nos)
    .force(
      'link',
      forceLink<NoGrafo, LinkGrafo>(links)
        .id((d) => d.id)
        .distance(85)
    )
    .force('charge', forceManyBody().strength(-220))
    .force('center', forceCenter(LARGURA / 2, ALTURA / 2))
    .force('collide', forceCollide(34))
    .on('tick', () => {
      linkSel
        .attr('x1', (d) => (d.source as NoGrafo).x ?? 0)
        .attr('y1', (d) => (d.source as NoGrafo).y ?? 0)
        .attr('x2', (d) => (d.target as NoGrafo).x ?? 0)
        .attr('y2', (d) => (d.target as NoGrafo).y ?? 0);
      noSel.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

  svg.call(
    zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (evento) => grupoZoom.attr('transform', evento.transform))
  );
}

function aoClicarNo(no: NoGrafo) {
  if (!props.repositorio) return;
  emit('abrir-objeto', {
    repositorio: props.repositorio,
    objeto: no.objetoCompleto,
  });
}

watch(
  () => props.repositorio?.uri,
  () => carregarAmostra(props.repositorio),
  { immediate: true }
);

onBeforeUnmount(pararSimulacao);
</script>

<template>
  <div class="grafo-wrap">
    <div v-if="carregando" class="grafo-estado">
      <q-spinner color="primary" size="28px" />
      <div class="text-caption text-grey-6 q-mt-sm">
        Montando a rede de objetos…
      </div>
    </div>
    <div v-else-if="semDados" class="grafo-estado">
      <q-icon name="hub" size="28px" color="grey-5" />
      <div class="text-caption text-grey-6 q-mt-sm">
        Ainda não há objetos suficientes nesse repositório pra montar a rede.
      </div>
    </div>
    <svg
      v-show="!carregando && !semDados"
      ref="svgRef"
      :viewBox="`0 0 ${LARGURA} ${ALTURA}`"
      class="grafo-svg"
    ></svg>
    <div v-if="!carregando && !semDados" class="grafo-legenda">
      <span
        v-for="(cor, tipo) in CORES_TIPO"
        v-show="tipo !== 'outro'"
        :key="tipo"
        class="grafo-legenda-item"
      >
        <span class="grafo-legenda-bolha" :style="{ background: cor }"></span>
        {{ tipo === 'fisico' ? 'Objeto' : tipo }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.grafo-wrap {
  position: relative;
  width: 100%;
}
.grafo-estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  text-align: center;
  padding: 24px;
}
.grafo-svg {
  display: block;
  width: 100%;
  height: auto;
  max-height: 360px;
  touch-action: none;
}
.grafo-legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
}
.grafo-legenda-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: #666;
}
.grafo-legenda-bolha {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
