import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { fetchAllRepositories } from 'src/services/repositoryService';
import { fetchAllObjectsByRepository } from 'src/services/objectService';
// Importa o novo serviço de relações
import { fetchObjectRelations } from 'src/services/relationService';
import type { GraphNode, GraphLink } from 'src/services/apiTypes';

export const useGraphStore = defineStore('graph', () => {
  // --- STATE (Estado) ---
  const nodes = ref<GraphNode[]>([]);
  const links = ref<GraphLink[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- CONFIGURAÇÃO ---
  const KNOWN_VALID_DATASETS = ['festas_populares', 'guaraonto', 'repositorios', 'repositoriosamigos', 'test', 'usuarios'];

  // --- ACTIONS (Ações) ---
  async function fetchGraphData() {
    loading.value = true;
    error.value = null;

    try {
      // 1. Busca todas as coleções (repositórios).
      const collections = await fetchAllRepositories();
      if (collections.length === 0) {
        throw new Error("Nenhuma coleção foi encontrada.");
      }

      const graphNodes: GraphNode[] = [];
      const graphLinks: GraphLink[] = [];
      const allObjects: { id: string; repoEndpoint: string; }[] = [];

      // 2. Adiciona as coleções como nós e prepara a busca de objetos.
      for (const collection of collections) {
        graphNodes.push({
          id: collection.uri,
          name: collection.nome,
          type: 'collection',
          description: collection.descricao,
        });

        // Se for um dataset válido, busca seus objetos
        if (KNOWN_VALID_DATASETS.includes(collection.nome)) {
          const repoEndpoint = `http://localhost:3030/${collection.nome}/query`;
          const objects = await fetchAllObjectsByRepository(repoEndpoint);

          for (const obj of objects) {
            // Adiciona o objeto como um nó
            graphNodes.push({
              id: obj.id,
              name: obj.titulo,
              type: 'object',
              description: obj.descricao || obj.resumo,
            });
            // Cria o link do objeto para sua coleção
            graphLinks.push({ source: obj.id, target: collection.uri });
            // Guarda o objeto e seu endpoint para buscar relações depois
            allObjects.push({ id: obj.id, repoEndpoint: repoEndpoint });
          }
        }
      }

      // 3. --- NOVA LÓGICA: BUSCA E CRIA AS LIGAÇÕES ENTRE OBJETOS ---
      // Cria um Set com todos os IDs de nós para busca rápida.
      const nodeIds = new Set(graphNodes.map(n => n.id));

      // Itera sobre todos os objetos que encontramos em todos os repositórios.
      for (const obj of allObjects) {
        // Para cada objeto, busca suas relações.
        const relations = await fetchObjectRelations(obj.id, obj.repoEndpoint);

        for (const relation of relations) {
          // Se a relação for do tipo URI e o valor dela corresponder a um nó que já existe no nosso grafo...
          if (relation.valueType === 'uri' && nodeIds.has(relation.value)) {
            // ...então criamos uma ligação entre o objeto atual (sujeito) e o objeto da relação (alvo).
            graphLinks.push({
              source: obj.id,
              target: relation.value,
            });
          }
        }
      }

      // 4. Finalmente, atualiza o estado da store com todos os dados.
      nodes.value = graphNodes;
      links.value = graphLinks;

      if(graphLinks.length === 0) {
        Notify.create({
          type: 'info',
          message: 'Grafo montado, mas nenhum objeto ou relação foi encontrado nos repositórios existentes.',
          position: 'top',
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar dados do grafo.';
      console.error('Erro detalhado ao buscar dados do gráfico:', err);
      error.value = errorMessage;
      Notify.create({
        type: 'negative',
        message: errorMessage,
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  }

  return { nodes, links, loading, error, fetchGraphData };
});
