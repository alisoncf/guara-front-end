/**
 * src/stores/ui-store.ts
 *
 * Gerencia o estado global da Interface de Utilizador (UI),
 * como a visibilidade de menus, diálogos e temas.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Dark, LocalStorage } from 'quasar';

export const useUiStore = defineStore('ui', () => {
  // --- STATE ---

  const isLeftDrawerOpen = ref(true);

  // CORREÇÃO AQUI: Garantimos que o valor lido do LocalStorage é um booleano.
  // O `=== true` converte qualquer valor que não seja `true` para `false`.
  const isDarkMode = ref<boolean>(LocalStorage.getItem('darkMode') === true);

  // --- ACTIONS ---

  /**
   * Alterna a visibilidade do menu lateral (drawer).
   */
  function toggleLeftDrawer() {
    isLeftDrawerOpen.value = !isLeftDrawerOpen.value;
  }

  /**
   * Ativa ou desativa o modo escuro em toda a aplicação.
   * @param {boolean} value - true para ativar, false para desativar.
   */
  function setDarkMode(value: boolean) {
    isDarkMode.value = value;
    Dark.set(value);
    LocalStorage.set('darkMode', value);
  }

  /**
   * Alterna entre o modo claro e escuro.
   */
  function toggleDarkMode() {
    setDarkMode(!isDarkMode.value);
  }

  /**
   * Ação chamada no início da aplicação para aplicar o tema correto.
   */
  function hydrateDarkMode() {
    Dark.set(isDarkMode.value);
  }

  return {
    // State
    isLeftDrawerOpen,
    isDarkMode,

    // Actions
    toggleLeftDrawer,
    setDarkMode,
    toggleDarkMode,
    hydrateDarkMode,
  };
});
