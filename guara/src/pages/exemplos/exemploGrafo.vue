<template>
  <q-page class="q-pa-md">
    <!-- Cabeçalho com ações -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h1 class="text-h5 q-my-none text-weight-bold text-primary">Editor de Grafos Interativo</h1>
        <div class="text-caption text-grey-7">Adicione nós dinamicamente e gerencie dados via Quasar Dialog</div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Adicionar Novo Nó"
        @click="abrirDialogNovoNo"
        class="shadow-2"
      />
    </div>

    <!-- Container do Grafo -->
    <q-card flat bordered class="grafo-card bg-grey-1 shadow-1">
      <div class="grafo-container">
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :default-viewport="{ x: 0, y: 0, zoom: 1.2 }"
          :min-zoom="0.2"
          :max-zoom="4"
          @node-click="aoClicarNoNo"
        >
          <!-- Background de Grade -->
          <Background pattern-color="#aaa" :gap="16" />

          <!-- Painel de Controles -->
          <Controls position="top-right" />

          <!-- Mini Mapa de Navegação -->
          <MiniMap position="bottom-right" />
        </VueFlow>
      </div>
    </q-card>

    <!-- Dialog para Criar Novo Nó -->
    <q-dialog v-model="dialogNovoNo" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Novo Nó do Grafo</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md q-gutter-md">
          <q-input
            v-model="formularioNo.label"
            label="Texto do Nó *"
            outlined
            dense
            :rules="[val => !!val || 'O preenchimento é obrigatório']"
          />

          <q-select
            v-model="formularioNo.tipo"
            :options="opcoesTipos"
            label="Tipo de Conexão"
            outlined
            dense
            emit-value
            map-options
          />

          <q-select
            v-model="formularioNo.cor"
            :options="opcoesCores"
            label="Cor de Destaque"
            outlined
            dense
            emit-value
            map-options
          />

          <q-select
            v-model="noOrigemSelecionado"
            :options="opcoesNosOrigem"
            label="Conectar a partir do nó (Opcional)"
            outlined
            dense
            clearable
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary q-pb-md q-px-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Criar Nó"
            @click="criarNoDinamico"
            :disable="!formularioNo.label"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para Editar/Visualizar Detalhes do Nó Clicado -->
    <q-dialog v-model="dialogDetalhesNo">
      <q-card style="min-width: 350px" v-if="noSelecionado">
        <q-card-section :style="{ backgroundColor: noSelecionado.style?.background || '#027be3' }" class="text-white row items-center">
          <div class="text-h6">Propriedades do Nó</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md q-gutter-md">
          <div class="text-subtitle2 text-grey-7">ID do Elemento: <code class="text-weight-bold text-dark">{{ noSelecionado.id }}</code></div>

          <q-input
            v-model="noSelecionado.label"
            label="Alterar Nome"
            outlined
            dense
          />

          <div class="bg-grey-2 q-pa-sm rounded-borders text-caption text-grey-9">
            <strong>Dica de Integração:</strong> Você pode usar essa janela para carregar e atualizar dados assíncronos de uma API REST baseados no ID do nó selecionado.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary q-pb-md q-px-md">
          <q-btn flat label="Remover Nó" color="negative" @click="removerNo(noSelecionado.id)" v-close-popup />
          <q-btn color="primary" label="Salvar Alterações" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

// Importações necessárias para os estilos do Vue Flow
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const $q = useQuasar()

// Estados Iniciais dos Nós (Nodes)
const nodes = ref([
  {
    id: '1',
    type: 'input',
    label: 'Nó Inicial (API)',
    position: { x: 250, y: 50 },
    style: { background: '#26A69A', color: 'white', borderRadius: '8px', border: 'none', padding: '10px' }
  },
  {
    id: '2',
    label: 'Processador Alpha',
    position: { x: 100, y: 180 },
    style: { background: '#31CCEC', color: 'white', borderRadius: '8px', border: 'none', padding: '10px' }
  },
  {
    id: '3',
    label: 'Processador Beta',
    position: { x: 400, y: 180 },
    style: { background: '#31CCEC', color: 'white', borderRadius: '8px', border: 'none', padding: '10px' }
  }
])

// Estados Iniciais das Conexões (Edges)
const edges = ref([
  { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', animated: true, type: 'smoothstep' }
])

// Controle dos Diálogos do Quasar
const dialogNovoNo = ref(false)
const dialogDetalhesNo = ref(false)

// Estados de manipulação
const noSelecionado = ref(null)
const noOrigemSelecionado = ref(null)

const formularioNo = ref({
  label: '',
  tipo: 'default',
  cor: '#31CCEC'
})

// Opções de configuração para o formulário
const opcoesTipos = [
  { label: 'Entrada apenas (Gera saídas)', value: 'input' },
  { label: 'Padrão (Entrada e Saída)', value: 'default' },
  { label: 'Saída apenas (Recebe conexões)', value: 'output' }
]

const opcoesCores = [
  { label: 'Ciano (Processamento)', value: '#31CCEC' },
  { label: 'Roxo (Filtro)', value: '#9C27B0' },
  { label: 'Laranja (Alerta)', value: '#F2C037' },
  { label: 'Preto (Fim de Curso)', value: '#1D1D1D' }
]

// Mapeia os nós existentes para preencher o select de conexões de origem
const opcoesNosOrigem = computed(() => {
  return nodes.value.map(node => ({
    label: node.label,
    value: node.id
  }))
})

// Abre a janela de cadastro limpando dados anteriores
const abrirDialogNovoNo = () => {
  formularioNo.value = { label: '', tipo: 'default', cor: '#31CCEC' }
  noOrigemSelecionado.value = null
  dialogNovoNo.value = true
}

// Cria o nó de forma reativa e adiciona a conexão se declarada
const criarNoDinamico = () => {
  const novoId = String(Date.now())

  // Define uma posição semi-aleatória para o novo nó não sobrepor o topo esquerdo totalmente
  const posX = 150 + Math.floor(Math.random() * 200)
  const posY = 100 + Math.floor(Math.random() * 200)

  const novoNo = {
    id: novoId,
    type: formularioNo.value.tipo,
    label: formularioNo.value.label,
    position: { x: posX, y: posY },
    style: {
      background: formularioNo.value.cor,
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      padding: '10px'
    }
  }

  // Insere o nó na lista do grafo
  nodes.value.push(novoNo)

  // Se o usuário marcou uma origem no painel do Quasar, estabelece a linha conectora automaticamente
  if (noOrigemSelecionado.value) {
    edges.value.push({
      id: `e${noOrigemSelecionado.value.value}-${novoId}`,
      source: noOrigemSelecionado.value.value,
      target: novoId,
      animated: true,
      type: 'smoothstep'
    })
  }

  dialogNovoNo.value = false
  $q.notify({
    type: 'positive',
    message: `Nó "${novoNo.label}" injetado com sucesso!`,
    position: 'bottom-right'
  })
}

// Captura o clique em qualquer nó do grafo para exibir o QDialog de edição
const aoClicarNoNo = (evento) => {
  // O Vue Flow injeta o objeto "node" dentro do evento gerado pelo clique
  noSelecionado.value = evento.node
  dialogDetalhesNo.value = true
}

// Remove o nó e limpa todas as arestas vinculadas a ele
const removerNo = (idNo) => {
  nodes.value = nodes.value.filter(n => n.id !== idNo)
  edges.value = edges.value.filter(e => e.source !== idNo && e.target !== idNo)

  $q.notify({
    type: 'warning',
    message: 'Nó e suas respectivas conexões foram removidos.',
    position: 'bottom-right'
  })
}
</script>

<style scoped>
.grafo-card {
  border-radius: 12px;
  overflow: hidden;
}

.grafo-container {
  width: 100%;
  height: 65vh;
}

/* Customizações básicas adicionais para os handles de conexão internos do Vue Flow */
:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  background-color: #ffffff;
  border: 2px solid #027be3;
}
</style>
