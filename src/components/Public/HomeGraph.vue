<template>
  <q-card class="graph-card" flat bordered>
    <q-card-section>
      <div class="text-h6">Acervo em Grafo</div>
      <div class="text-subtitle2">Navegue pelas coleções e seus objetos interconectados</div>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pa-none graph-section">
      <div ref="containerRef" class="graph-container"></div>
      <div class="zoom-controls">
        <q-btn round dense flat icon="add" @click="zoomIn" />
        <q-btn round dense flat icon="remove" @click="zoomOut" />
      </div>
      <div class="tooltip" :style="{ top: tooltip.top, left: tooltip.left, opacity: tooltip.opacity }">
        <strong>{{ tooltip.title }}</strong>
        <p v-if="tooltip.description">{{ tooltip.description }}</p>
      </div>
      <div v-if="graphStore.loading" class="absolute-center text-center">
        <q-spinner-dots color="primary" size="50px" />
        <div class="q-mt-md text-primary text-weight-medium">A carregar dados do acervo...</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import { useGraphStore } from '../../stores/graph-store';
import * as d3 from 'd3';
import { storeToRefs } from 'pinia';
import type { GraphNode, GraphLink } from '../../types/apiTypes';

interface D3GraphNode extends GraphNode, d3.SimulationNodeDatum {}

// --- Funções helper para o visual ---
function getNodeRadius(node: D3GraphNode): number {
  switch (node.type) {
    case 'repository': return 20; // Repositório (Maior)
    case 'collection': return 14; // Coleção (Médio)
    case 'object': return 9;     // Objeto (Pequeno)
    default: return 10;
  }
}

function getNodeColor(node: D3GraphNode): string {
  switch (node.type) {
    case 'repository': return '#c2410c'; // Laranja Escuro/Vermelho
    case 'collection': return '#f59e0b'; // Laranja
    case 'object': return '#3b82f6';     // Azul
    default: return '#6b7280'; // Cinza
  }
}

// --- (NOVO) Função para distâncias de link dinâmicas ---
function getLinkDistance(link: GraphLink): number {
  // O D3 substitui os IDs por referências aos nós
  const sourceNode = link.source as D3GraphNode;

  switch (sourceNode.type) {
    case 'repository': return 150; // Link (Repositório -> Coleção) mais longo
    case 'collection': return 70;  // Link (Coleção -> Objeto) mais curto
    default: return 100;
  }
}
// --- FIM DA MODIFICAÇÃO ---

const containerRef = ref<HTMLDivElement | null>(null);
const graphStore = useGraphStore();
const { nodes, links } = storeToRefs(graphStore);

let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let g: d3.Selection<SVGGElement, unknown, null, undefined>;
let simulation: d3.Simulation<D3GraphNode, GraphLink>;
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>;
let resizeObserver: ResizeObserver;

let linkSelection: d3.Selection<SVGLineElement, GraphLink, SVGGElement, unknown>;
let nodeSelection: d3.Selection<SVGGElement, D3GraphNode, SVGGElement, unknown>;

// --- (MODIFICAÇÃO 1) ---
// Removemos a variável stopTimer.
// let stopTimer: ReturnType<typeof setTimeout> | null = null;
// --- FIM DA MODIFICAÇÃO ---

const tooltip = reactive({
  opacity: 0,
  top: '0px',
  left: '0px',
  title: '',
  description: '',
});

const zoomIn = () => {
  if (svg) svg.transition().duration(250).call(zoomBehavior.scaleBy, 1.2);
};
const zoomOut = () => {
  if (svg) svg.transition().duration(250).call(zoomBehavior.scaleBy, 0.8);
};

const updateGraph = () => {
  if (!g) return;

  // if (stopTimer) { // <-- REMOVIDO
  //   clearTimeout(stopTimer);
  // }

  nodeSelection = g.selectAll<SVGGElement, D3GraphNode>('.node-group')
    .data(nodes.value as D3GraphNode[], d => d.id)
    .join(
      enter => {
        const nodeGroup = enter.append('g').attr('class', 'node-group').call(dragHandler(simulation));

        nodeGroup.append('circle')
          .attr('r', d => getNodeRadius(d))
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('fill', d => getNodeColor(d));

        nodeGroup.append('text')
          .text(d => d.name)
          .attr('x', d => getNodeRadius(d) + 4)
          .attr('y', 5)
          .attr('font-family', 'Inter, sans-serif')
          .attr('font-size', '12px')
          .attr('fill', '#1f2937');

        nodeGroup.on('mouseover', (event, d) => {
          tooltip.title = d.name;
          tooltip.description = d.description || '';
          tooltip.opacity = 0.9;
          tooltip.left = `${event.pageX + 15}px`;
          tooltip.top = `${event.pageY - 15}px`;
        }).on('mouseout', () => {
          tooltip.opacity = 0;
        });
        return nodeGroup;
      }
    );

  linkSelection = g.selectAll<SVGLineElement, GraphLink>('line.link')
    .data(links.value, d => `${d.source}-${d.target}`)
    .join(
      enter => enter.insert('line', '.node-group')
        .attr('class', 'link')
        .attr('stroke', '#9ca3af')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5)
    );

  simulation.nodes(nodes.value as D3GraphNode[]);

  // --- (MODIFICAÇÃO 2) ---
  // Dizemos à força de link para usar nossa nova função getLinkDistance
  (simulation.force('link') as d3.ForceLink<D3GraphNode, GraphLink>)
    .links(links.value)
    .distance(d => getLinkDistance(d)); // <-- MODIFICADO
  // --- FIM DA MODIFICAÇÃO ---

  simulation.alpha(1).restart();

  // --- (MODIFICAÇÃO 3) ---
  // O timer que parava a simulação foi REMOVIDO.
  // stopTimer = setTimeout(() => { ... });
  // --- FIM DA MODIFICAÇÃO ---
};

const initializeGraph = () => {
  if (!containerRef.value) return;
  const { clientWidth: width, clientHeight: height } = containerRef.value;
  svg = d3.select(containerRef.value).append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [-width / 2, -height / 2, width, height]);
  g = svg.append('g');
  simulation = d3.forceSimulation<D3GraphNode>()
    // --- (MODIFICAÇÃO 4) ---
    // A força de link agora é inicializada sem uma distância fixa
    .force('link', d3.forceLink<D3GraphNode, GraphLink>().id(d => d.id).strength(0.5)) // <-- STRENGTH E DISTANCE MUDADOS
    // A força de repulsão foi drasticamente reduzida de -600 para -150
    .force('charge', d3.forceManyBody().strength(-150)) // <-- VALOR MUDADO
    // --- FIM DA MODIFICAÇÃO ---
    .force('center', d3.forceCenter(0, 0).strength(0.1));

  simulation.on('tick', () => {
    if (linkSelection) {
      linkSelection
        .attr('x1', (d) => (d.source as any).x)
        .attr('y1', (d) => (d.source as any).y)
        .attr('x2', (d) => (d.target as any).x)
        .attr('y2', (d) => (d.target as any).y);
    }
    if (nodeSelection) {
      nodeSelection.attr('transform', d => `translate(${d.x}, ${d.y})`);
    }
  });

  zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 8])
    .on('zoom', ({ transform }) => g.attr('transform', transform));
  svg.call(zoomBehavior);
};

function dragHandler(simulationInstance: d3.Simulation<D3GraphNode, GraphLink>) {
  function dragstarted(event: any, d: D3GraphNode) {
    if (!event.active) simulationInstance.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event: any, d: D3GraphNode) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event: any, d: D3GraphNode) {
    if (!event.active) simulationInstance.alphaTarget(0);

    // --- (MODIFICAÇÃO 5) ---
    // "Soltamos" o nó de volta para a simulação após arrastá-lo
    d.fx = null;
    d.fy = null;
    // --- FIM DA MODIFICAÇÃO ---
  }
  return d3.drag<any, D3GraphNode>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

watch([nodes, links], updateGraph, { deep: true });

onMounted(() => {
  initializeGraph();
  graphStore.fetchGraphData();

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (!containerRef.value) return;
      const { clientWidth: width, clientHeight: height } = containerRef.value;
      svg.attr('width', width).attr('height', height).attr('viewBox', [-width / 2, -height / 2, width, height]);
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (simulation) {
    simulation.stop(); // <-- Paramos a simulação ao sair da página
  }

  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value);
  }
});
</script>

<style lang="scss" scoped>
.graph-card {
  height: 85vh;
  display: flex;
  flex-direction: column;
}
.graph-section {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  background-color: #f9fafb;
}
.graph-container {
  width: 100%;
  height: 100%;
}
:deep(g.node-group) {
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}
.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}
.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  pointer-events: none;
  transition: opacity 0.2s;
  max-width: 300px;
  z-index: 10;

  p {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #d1d5db;
  }
}
</style>
