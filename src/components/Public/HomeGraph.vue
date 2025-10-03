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
import { useGraphStore } from 'stores/graph-store';
import * as d3 from 'd3';
import { storeToRefs } from 'pinia';
import type { GraphNode, GraphLink } from 'src/types/apiTypes';

interface D3GraphNode extends GraphNode, d3.SimulationNodeDatum {}

const containerRef = ref<HTMLDivElement | null>(null);
const graphStore = useGraphStore();
const { nodes, links } = storeToRefs(graphStore);

let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let g: d3.Selection<SVGGElement, unknown, null, undefined>;
let simulation: d3.Simulation<D3GraphNode, GraphLink>;
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>;
let resizeObserver: ResizeObserver;

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

  const node = g.selectAll<SVGGElement, D3GraphNode>('.node-group')
    .data(nodes.value as D3GraphNode[], d => d.id)
    .join(
      enter => {
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
        }).on('mouseout', () => {
          tooltip.opacity = 0;
        });
        return nodeGroup;
      }
    );

  const link = g.selectAll<SVGLineElement, GraphLink>('line.link')
    .data(links.value, d => `${d.source}-${d.target}`)
    .join(
      enter => enter.insert('line', '.node-group')
        .attr('class', 'link')
        .attr('stroke', '#9ca3af')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5)
    );

  simulation.nodes(nodes.value as D3GraphNode[]);
  (simulation.force('link') as d3.ForceLink<D3GraphNode, GraphLink>).links(links.value);
  simulation.alpha(1).restart();

  simulation.on('tick', () => {
    link
      .attr('x1', (d) => (d.source as any).x)
      .attr('y1', (d) => (d.source as any).y)
      .attr('x2', (d) => (d.target as any).x)
      .attr('y2', (d) => (d.target as any).y);

    node.attr('transform', d => `translate(${d.x}, ${d.y})`);
  });
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
    .force('link', d3.forceLink<D3GraphNode, GraphLink>().id(d => d.id).distance(100).strength(0.7))
    .force('charge', d3.forceManyBody().strength(-600))
    .force('center', d3.forceCenter(0, 0).strength(0.1));
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
    d.fx = null;
    d.fy = null;
  }
  return d3.drag<any, D3GraphNode>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

watch(links, updateGraph, { deep: true });

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
