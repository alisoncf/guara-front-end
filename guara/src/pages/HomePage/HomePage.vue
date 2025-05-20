<template>
  <div class="home-container">
    <div class="chart-container">
      <div class="chart-header">
        <h2>Estatísticas das Coleções</h2>
        <p>Visualize a distribuição de objetos por coleção</p>
      </div>
      <div ref="bubbleChart" class="bubble-chart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as d3 from 'd3';
import { buscarDadosColecoes } from 'src/services/api-colecoes';

interface BubbleData {
  name: string;
  value: number;
  category: string;
}

type D3EventHandler = (
  this: SVGCircleElement,
  event: MouseEvent,
  d: BubbleData
) => void;

const bubbleChart = ref<HTMLElement | null>(null);
let svg: d3.Selection<SVGGElement, unknown, null, undefined>;
const data = ref<BubbleData[]>([]);

const width = 800;
const height = 600;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

async function carregarDados() {
  try {
    data.value = await buscarDadosColecoes();
    createBubbleChart();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

function createBubbleChart() {
  if (!bubbleChart.value || data.value.length === 0) return;

  // Limpa o conteúdo anterior
  d3.select(bubbleChart.value).selectAll('*').remove();

  // Cria o SVG
  const svgElement = d3
    .select(bubbleChart.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  svg = svgElement
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Escalas
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data.value, (d) => d.value) || 0])
    .range([0, width - margin.left - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data.value, (d) => d.value) || 0])
    .range([height - margin.top - margin.bottom, 0]);

  const z = d3
    .scaleLinear()
    .domain([0, d3.max(data.value, (d) => d.value) || 0])
    .range([10, 50]);

  const color = d3
    .scaleOrdinal()
    .domain(data.value.map((d) => d.category))
    .range(d3.schemeCategory10);

  // Adiciona os círculos
  svg
    .selectAll<SVGCircleElement, BubbleData>('circle')
    .data(data.value)
    .enter()
    .append('circle')
    .attr('cx', (d) => x(d.value))
    .attr('cy', (d) => y(d.value))
    .attr('r', (d) => z(d.value))
    .style('fill', (d) => color(d.category))
    .style('opacity', 0.7)
    .style('stroke', 'white')
    .style('stroke-width', 2);

  // Adiciona os textos
  svg
    .selectAll<SVGTextElement, BubbleData>('text')
    .data(data.value)
    .enter()
    .append('text')
    .attr('x', (d) => x(d.value))
    .attr('y', (d) => y(d.value))
    .attr('text-anchor', 'middle')
    .attr('dy', '.3em')
    .text((d) => d.name)
    .style('font-size', '12px')
    .style('fill', 'white');

  // Adiciona os eixos
  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickFormat((d) => `${d} objetos`)
    );

  svg.append('g').call(
    d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat((d) => `${d} objetos`)
  );

  // Adiciona interatividade
  const handleMouseOver: D3EventHandler = function (event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style('opacity', 1)
      .attr('r', z(d.value) * 1.2);
  };

  const handleMouseOut: D3EventHandler = function (event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style('opacity', 0.7)
      .attr('r', z(d.value));
  };

  svg
    .selectAll<SVGCircleElement, BubbleData>('circle')
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut);
}

onMounted(() => {
  carregarDados();
  // Adiciona listener para redimensionamento
  window.addEventListener('resize', createBubbleChart);
});

onUnmounted(() => {
  // Remove listener ao desmontar o componente
  window.removeEventListener('resize', createBubbleChart);
});
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.chart-container {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-header {
  text-align: center;
  margin-bottom: 20px;
}

.chart-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.chart-header p {
  font-size: 16px;
  color: #666;
}

.bubble-chart {
  width: 100%;
  height: 600px;
  overflow: hidden;
}
</style>
