/**
 * src/stores/repository-store.ts
 *
 * Gerencia o estado dos repositórios de metadados.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import {
  fetchAllRepositories,
  fetchMyRepositories,
} from '../services/repositoryService';
import type { Repository } from '../types/apiTypes';
import { useAuthStore } from './auth-store';

export const useRepositoryStore = defineStore('repository', () => {
  // --- STATE ---
  const allRepositories = ref<Repository[]>([]);
  const myRepositories = ref<Repository[]>([]);
  const currentRepository = ref<Repository | null>(null);
  const loading = ref(false);

  // --- GETTERS ---
  const hasRepositories = computed(() => allRepositories.value.length > 0);

  // CORREÇÃO: Trocado o método .rstrip() (Python) pelo .replace(/\/$/, '') (JS/TS)
  const currentRepositoryQueryUrl = computed(() => {
    if (!currentRepository.value) return null;
    return `${currentRepository.value.uri.replace(/\/$/, '')}/query`;
  });

  const currentRepositoryUpdateUrl = computed(() => {
    if (!currentRepository.value) return null;
    return `${currentRepository.value.uri.replace(/\/$/, '')}/update`;
  });

  const currentRepositoryBaseUri = computed(() => {
    if (!currentRepository.value) return null;
    return `${currentRepository.value.uri.replace(/\/$/, '')}#`;
  });

  // --- ACTIONS ---

  /**
   * Busca e armazena la lista de todos os repositórios públicos.
   */
  async function fetchAll() {
    loading.value = true;
    try {
      // CORREÇÃO: Atribuição direta para remover a variável local redundante
      allRepositories.value = await fetchAllRepositories();
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: 'Não foi possível carregar a lista de repositórios.',
      });
    } finally {
      loading.value = false;
    }
  }

  /**
   * Busca e armazena a lista de repositórios associados ao usuário logado.
   */
  async function fetchMine() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      Notify.create({ type: 'warning', message: 'Você precisa estar logado para ver seus repositórios.' });
      return;
    }

    loading.value = true;
    try {
      myRepositories.value = await fetchMyRepositories();
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: 'Não foi possível carregar seus repositórios.',
      });
    } finally {
      loading.value = false;
    }
  }

  /**
   * Busca os repositórios apropriados para o usuário logado (todos se for admin,
   * ou apenas os associados para outras roles).
   */
  async function fetchRepositoriesForCurrentUser() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return;

    // Usa o getter que criamos no passo 1
    if (authStore.isAdmin) {
      await fetchAll(); // Admin carrega todos os repositórios
    } else {
      await fetchMine(); // Outros usuários carregam apenas os seus
    }
  }

  /**
   * Define um repositório como o atualmente ativo na aplicação.
   * @param repositoryUri - A URI do repositório a ser selecionado.
   */
  async function selectRepository(repositoryUri: string) {
    if (allRepositories.value.length === 0) {
      await fetchAll();
    }

    const foundRepo = allRepositories.value.find(
      (repo) => repo.uri === repositoryUri
    );

    if (foundRepo) {
      currentRepository.value = foundRepo;
      localStorage.setItem('currentRepository', JSON.stringify(foundRepo));
    } else {
      Notify.create({
        type: 'negative',
        message: `Repositório com URI "${repositoryUri}" não foi encontrado.`,
      });
    }
  }

  /**
   * Tenta carregar o repositório salvo no localStorage ao iniciar.
   */
  function hydrateCurrentRepository() {
    const savedRepo = localStorage.getItem('currentRepository');
    if (savedRepo) {
      currentRepository.value = JSON.parse(savedRepo);
    }
  }

  return {
    // State
    allRepositories,
    myRepositories,
    currentRepository,
    loading,
    // Getters
    hasRepositories,
    currentRepositoryQueryUrl,
    currentRepositoryUpdateUrl,
    currentRepositoryBaseUri,
    // Actions
    fetchAll,
    fetchMine,
    selectRepository,
    hydrateCurrentRepository,
    fetchRepositoriesForCurrentUser,
  };
});
