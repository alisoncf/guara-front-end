/**
 * src/services/graphService.ts
 *
 * SERVIÇO DE GRAFO (VERSÃO FINAL PARA RELATÓRIO)
 * Busca Repositórios, Classes e Objetos e cria links em três níveis:
 * 1. Repositório -> Super-Classe (definido no backend)
 * 2. Super-Classe -> Classe (usando subclassOf)
 * 3. Classe -> Objeto (usando obj.colecao)
 */
import type {
  GraphData,
  GraphNode,
  GraphLink,
  Repository,
  MappedObject,
  OntologyClass,
} from '../types/apiTypes';

// Importar as FUNÇÕES de outros serviços
import { fetchAllRepositories } from './repositoryService';
import { listAllObjects } from './dimensionalObjectService';
import { fetchClasses } from './classService';

/**
 * Busca os dados para o grafo completo.
 */
export async function fetchGraphData(): Promise<GraphData> {
  try {
    const allLinks: GraphLink[] = [];
    const allClassNodes: GraphNode[] = [];
    const allObjectNodes: GraphNode[] = [];
    const allObjectIds = new Set<string>();
    const allClassIds = new Set<string>();

    // 1. Buscar Repositórios
    const repositories: Repository[] = await fetchAllRepositories();
    const repositoryNodes: GraphNode[] = repositories.map((repo) => ({
      id: repo.uri,
      name: repo.nome,
      type: 'repository',
      description: repo.descricao,
    }));

    // 2. Iterar por cada Repositório para buscar suas Classes e Objetos
    for (const repo of repositories) {
      const queryUrl = `${repo.uri.replace(/\/$/, '')}/query`;

      // 2a. Buscar as Classes (Coleções) deste repositório
      const classes: OntologyClass[] = await fetchClasses(queryUrl);
      for (const cls of classes) {
        if (!allClassIds.has(cls.uri)) {
          allClassNodes.push({
            id: cls.uri,
            name: cls.label || 'Classe sem nome',
            type: 'collection',
            description: cls.description,
          });
          allClassIds.add(cls.uri);
        }

        // --- (LINK 1: Super-Classe -> Classe) ---
        // Se esta classe (cls) tem uma super-classe (cls.subclassOf),
        // criamos um link do pai (subclassOf) para o filho (cls.uri).
        if (cls.subclassOf) {
          allLinks.push({
            source: cls.subclassOf, // O Pai (ex: ...#Acervo)
            target: cls.uri, // O Filho (ex: ...#Folia)
          });
        }

        // --- (LINK 2: Repositório -> Classe) ---
        // Se a classe NÃO tiver um pai (ou seja, é uma super-classe como "Acervo"),
        // então a ligamos diretamente ao Repositório.
        if (!cls.subclassOf) {
          allLinks.push({
            source: repo.uri, // O Repositório (ex: ...#festas_populares)
            target: cls.uri, // A Super-Classe (ex: ...#Acervo)
          });
        }
      }

      // 2b. Buscar os Objetos deste repositório
      const objects: MappedObject[] = await listAllObjects(queryUrl);
      for (const obj of objects) {
        if (!allObjectIds.has(obj.id)) {
          allObjectNodes.push({
            id: obj.id,
            name: obj.titulo,
            type: 'object',
            description: obj.descricao,
          });
          allObjectIds.add(obj.id);
        }

        // --- (LINK 3: Classe -> Objeto) ---
        // Liga o Objeto à sua Classe (Coleção) pai.
        if (obj.colecao) {
          allLinks.push({
            source: obj.colecao, // A Classe (ex: ...#Folia)
            target: obj.id, // O Objeto (ex: Livro...)
          });
        }
      }
    }

    // 3. Juntar TODOS os nós
    const allNodes: GraphNode[] = [
      ...repositoryNodes,
      ...allClassNodes,
      ...allObjectNodes,
    ];

    // 4. Validar os links
    const allNodeIds = new Set(allNodes.map((n) => n.id));
    const validLinks = allLinks.filter((link) => {
      const sourceExists = allNodeIds.has(link.source);
      const targetExists = allNodeIds.has(link.target);
      return sourceExists && targetExists;
    });

    return {
      nodes: allNodes,
      links: validLinks,
    };
  } catch (error) {
    console.error(
      'Erro ao buscar dados para o grafo (método final):',
      error
    );
    throw new Error(
      'Não foi possível carregar os dados do acervo principal (método final).'
    );
  }
}
