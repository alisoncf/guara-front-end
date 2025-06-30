import { createPinia } from 'pinia'

/*
 * Se você precisar usar a store dentro de arquivos JS comuns
 * (fora de componentes Vue), você pode criar a store aqui e exportá-la.
 *
 * Exemplo:
 *
 * import { useUserStore } from 'src/stores/user'
 *
 * export const userStore = useUserStore(pinia)
 *
 * Você pode então importar a store em qualquer lugar do seu projeto:
 *
 * import { userStore } from 'src/stores'
 *
 * userStore.name // Acessando o estado
 * userStore.someAction() // Chamando uma ação
 */

// Este é o export que estava faltando.
// Ele cria a instância principal do Pinia para que o Quasar
// possa injetá-la na sua aplicação Vue.
export default createPinia()
