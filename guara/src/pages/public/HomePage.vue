<template>
  <q-page class="q-pa-md">
    <q-card class="graph-card" flat bordered>
      <q-card-section>
        <div class="text-h6">Acervo em Grafo</div>
        <div class="text-subtitle2">Navegue pelas coleções e seus objetos interconectados</div>
      </q-card-section>
      <q-separator />

      <q-card-section class="q-pa-none graph-section">
        <!-- O container onde o D3 irá desenhar o SVG -->
        <div ref="containerRef" class="graph-container"></div>

        <!-- Controles de Zoom -->
        <div class="zoom-controls">
          <q-btn round dense flat icon="add" @click="zoomIn" />
          <q-btn round dense flat icon="remove" @click="zoomOut" />
        </div>

        <!-- Tooltip que aparecerá ao passar o mouse sobre um nó -->
        <div class="tooltip" :style="{ top: tooltip.top, left: tooltip.left, opacity: tooltip.opacity }">
          <strong>{{ tooltip.title }}</strong>
          <p v-if="tooltip.description">{{ tooltip.description }}</p>
        </div>

        <!-- Overlay de Loading -->
        <div v-if="graphStore.loading" class="absolute-center text-center">
          <q-spinner-dots color="primary" size="50px" />
          <div class="q-mt-md text-primary text-weight-medium">A carregar dados do acervo...</div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import { useGraphStore } from 'stores/graph-store';
import * as d3 from 'd3';
import { storeToRefs } from 'pinia';
import type { GraphNode, GraphLink } from 'src/services/apiTypes';

// --- REFERÊNCIAS E ESTADO ---
const containerRef = ref<HTMLDivElement | null>(null);
const graphStore = useGraphStore();
const { nodes, links } = storeToRefs(graphStore);

let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let g: d3.Selection<SVGGElement, unknown, null, undefined>;
let simulation: d3.Simulation<GraphNode, any>;
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>;
let resizeObserver: ResizeObserver;

const tooltip = reactive({
  opacity: 0,
  top: '0px',
  left: '0px',
  title: '',
  description: '',
});

// --- FUNÇÕES DE CONTROLE DE ZOOM ---
const zoomIn = () => {
  if (svg) svg.transition().duration(250).call(zoomBehavior.scaleBy, 1.2);
};
const zoomOut = () => {
  if (svg) svg.transition().duration(250).call(zoomBehavior.scaleBy, 0.8);
};

// --- FUNÇÃO DE RENDERIZAÇÃO E ATUALIZAÇÃO DO GRAFO ---
const updateGraph = () => {
  if (!g) return; // Garante que o container SVG já foi criado

  // --- ATUALIZAÇÃO DOS NÓS ---
  const node = g.selectAll<SVGGElement, GraphNode>('.node-group')
    .data(nodes.value, (d: any) => d.id)
    .join(
      enter => { // O que fazer com novos dados (nós)
        const nodeGroup = enter.append('g').attr('class', 'node-group').call(dragHandler(simulation));

        nodeGroup.append('circle')
          .attr('r', d => (d.type === 'collection' ? 14 : 9))
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('fill', d => (d.type === 'collection' ? '#f59e0b' : '#3b82f6'));

        nodeGroup.append('text')
          .text(d => d.name)
          .attr('x', 18)
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
        })
          .on('mouseout', () => {
            tooltip.opacity = 0;
          });

        return nodeGroup;
      },
      update => update, // Não é preciso fazer nada para nós que já existem
      exit => exit.remove() // Remove nós que não estão mais nos dados
    );

  // --- ATUALIZAÇÃO DAS LIGAÇÕES ---
  const link = g.selectAll<SVGLineElement, GraphLink>('line.link')
    .data(links.value, (d: any) => `${d.source.id}-${d.target.id}`)
    .join(
      enter => enter.insert('line', '.node-group') // Insere as linhas ANTES dos nós
        .attr('class', 'link')
        .attr('stroke', '#9ca3af')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5),
      update => update,
      exit => exit.remove()
    );

  // --- ATUALIZAÇÃO DA SIMULAÇÃO ---
  simulation.nodes(nodes.value);
  (simulation.force('link') as d3.ForceLink<GraphNode, GraphLink>).links(links.value);
  simulation.alpha(1).restart(); // "Reaquece" e reinicia a simulação com os novos dados

  // A função 'tick' é atualizada para mover os novos elementos
  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as GraphNode).x!)
      .attr('y1', d => (d.source as GraphNode).y!)
      .attr('x2', d => (d.target as GraphNode).x!)
      .attr('y2', d => (d.target as GraphNode).y!);
    node.attr('transform', d => `translate(${d.x}, ${d.y})`);
  });
};

// --- FUNÇÃO DE INICIALIZAÇÃO (CHAMADA APENAS UMA VEZ) ---
const initializeGraph = () => {
  if (!containerRef.value) return;

  const containerEl = containerRef.value;
  const width = containerEl.clientWidth;
  const height = containerEl.clientHeight;

  svg = d3.select(containerEl).append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [-width / 2, -height / 2, width, height]);

  g = svg.append('g');

  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d: any) => d.id).distance(100).strength(0.7))
    .force('charge', d3.forceManyBody().strength(-600))
    .force('center', d3.forceCenter(0, 0).strength(0.1));

  zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 8])
    .on('zoom', ({ transform }) => {
      g.attr('transform', transform);
    });

  svg.call(zoomBehavior);
};

// --- FUNÇÃO DE ARRASTAR ---
function dragHandler(simulationInstance: d3.Simulation<GraphNode, any>) {
  function dragstarted(event: any, d: GraphNode) {
    if (!event.active) simulationInstance.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event: any, d: GraphNode) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event: any, d: GraphNode) {
    if (!event.active) simulationInstance.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  return d3.drag<any, GraphNode>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

// --- CICLO DE VIDA ---
watch(links, () => {
  updateGraph(); // Agora apenas atualiza o grafo, não recria tudo
}, { deep: true });

onMounted(() => {
  initializeGraph(); // Cria o SVG e a simulação uma vez
  graphStore.fetchGraphData(); // Busca os dados

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // Lógica para redimensionar o SVG se necessário
      const width = containerRef.value?.clientWidth ?? 0;
      const height = containerRef.value?.clientHeight ?? 0;
      svg.attr('width', width).attr('height', height).attr('viewBox', [-width / 2, -height / 2, width, height]);
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
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
