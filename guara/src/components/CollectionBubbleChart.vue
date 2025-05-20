<template>
  <div class="chart-container">
    <div class="chart-header">
      <h2>Estatísticas das Coleções</h2>
      <p>Visualize a distribuição de objetos por coleção</p>
    </div>
    <Bubble v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Bubble } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LinearScale,
} from 'chart.js';
import { buscarDadosColecoes } from 'src/services/api-colecoes';

// Registra os componentes necessários do Chart.js
ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale);

interface ColecaoData {
  name: string;
  value: number;
  category: string;
}

const chartData = ref<any>(null);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const data = context.raw;
          return [
            `Coleção: ${data.name}`,
            `Objetos: ${data.value}`,
            `Categoria: ${data.category}`,
          ];
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Quantidade de Objetos',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Quantidade de Objetos',
      },
    },
  },
};

async function carregarDados() {
  try {
    const dados = await buscarDadosColecoes();

    // Agrupa as coleções por categoria
    const categorias = [...new Set(dados.map((d) => d.category))];
    const datasets = categorias.map((categoria) => {
      const colecoesCategoria = dados.filter((d) => d.category === categoria);
      return {
        label: categoria,
        data: colecoesCategoria.map((d) => ({
          x: d.value,
          y: d.value,
          r: Math.sqrt(d.value) * 2, // Tamanho da bolha baseado na raiz quadrada do valor
          name: d.name,
          value: d.value,
          category: d.category,
        })),
        backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.6)`,
        borderColor: `hsla(${Math.random() * 360}, 70%, 50%, 1)`,
        borderWidth: 1,
      };
    });

    chartData.value = {
      datasets,
    };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

onMounted(() => {
  carregarDados();
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

.chart-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.chart-header p {
  font-size: 16px;
  color: #666;
}
</style>
