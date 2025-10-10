/**
 * src/stores/graph-store.ts
 *
 * Gerencia o estado dos dados para a visualização do grafo principal.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Notify } from 'quasar';
// Importa a função do novo serviço que acabamos de criar
import { fetchGraphData as fetchGraphDataService } from '../services/graphService';
import type { GraphNode, GraphLink } from '../types/apiTypes';

export const useGraphStore = defineStore('graph', () => {
  // --- STATE ---
  const nodes = ref<GraphNode[]>([]);
  const links = ref<GraphLink[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- ACTIONS ---

  /**
   * Busca os dados consolidados do grafo a partir do endpoint otimizado da API.
   */
  async function fetchGraphData() {
    loading.value = true;
    error.value = null;
    nodes.value = []; // Limpa o estado anterior
    links.value = [];

    try {
      // Chama a única função do serviço que busca e processa tudo
      const graphData = await fetchGraphDataService();

      if (graphData.nodes.length === 0) {
        Notify.create({
          type: 'info',
          message: 'Nenhum repositório ou objeto encontrado para exibir no grafo.',
        });
      }

      // Atualiza o estado da store com os dados prontos
      nodes.value = graphData.nodes;
      links.value = graphData.links;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Falha ao carregar dados do grafo.';
      error.value = errorMessage;
      console.error('Erro na store do grafo:', err);
      // A notificação de erro já é tratada pelo service/interceptor.
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    nodes,
    links,
    loading,
    error,
    // Actions
    fetchGraphData,
  };
});
