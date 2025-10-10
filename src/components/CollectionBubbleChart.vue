<template>
  <div class="chart-container">
    <div class="chart-header">
      <h2>Estatísticas das Coleções</h2>
      <p>Visualize a distribuição de objetos por coleção</p>
    </div>
    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots color="primary" size="40px" />
      <p class="q-mt-md">Carregando dados para o gráfico...</p>
    </div>
    <Bubble v-else-if="chartData && chartData.datasets.length > 0" :data="chartData" :options="chartOptions" style="height: 400px" />
    <div v-else class="text-center q-pa-lg text-grey">
      <q-icon name="bubble_chart" size="48px" />
      <p class="q-mt-md">Não há dados suficientes para exibir o gráfico.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Bubble } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LinearScale } from 'chart.js';
import { useClassStore } from '../stores/class-store';
import { useDimensionalObjectStore } from '../stores/dimensional-object-store';
import { storeToRefs } from 'pinia';

// Registra os componentes necessários do Chart.js
ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale);

// Usando as stores
const classStore = useClassStore();
const objectStore = useDimensionalObjectStore();

// Pegando os dados e o estado de loading de forma reativa
const { classes: collections, loading: loadingCollections } = storeToRefs(classStore);
const { objects, loading: loadingObjects } = storeToRefs(objectStore);

const loading = computed(() => loadingCollections.value || loadingObjects.value);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const data = context.raw;
          return `Coleção: ${data.name} (${data.value} objetos)`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { text: 'Contagem de Objetos', display: true }
    },
    x: {
      beginAtZero: true,
      title: { text: 'Contagem de Objetos', display: true }
    },
  },
};

// chartData agora é uma computed property que reage às mudanças nas stores
const chartData = computed(() => {
  if (collections.value.length === 0) {
    return null;
  }

  // Conta quantos objetos existem para cada coleção
  const objectCounts = collections.value.map(collection => {
    const count = objects.value.filter(obj => obj.colecao === collection.uri).length;
    return {
      name: collection.label,
      value: count,
    };
  }).filter(c => c.value > 0); // Mostra apenas coleções com objetos

  return {
    datasets: [
      {
        label: 'Coleções',
        // Gera os dados para cada bolha
        data: objectCounts.map(col => ({
          x: col.value,
          y: col.value,
          r: Math.sqrt(col.value) * 5 + 2, // Fórmula para o raio da bolha
          name: col.name,
          value: col.value,
        })),
        backgroundColor: 'rgba(37, 145, 207, 0.7)',
      },
    ],
  };
});

// Busca os dados quando o componente é montado
onMounted(() => {
  if (collections.value.length === 0) {
    classStore.fetchAll();
  }
  if (objects.value.length === 0) {
    objectStore.fetchAll();
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 0 auto;
}

.chart-header {
  text-align: center;
  margin-bottom: 20px;
}
</style>
