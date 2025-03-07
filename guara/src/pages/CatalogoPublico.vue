<template>
  <div class="catalogo-container">
    <!-- Seletor de Acervo -->
    <div class="q-pa-md">
      <q-table
        :rows="acervos"
        :columns="[
          { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
          { name: 'descricao', label: 'Descrição', field: 'descricao', align: 'left' },
          { name: 'ações', label: 'Ações', field: 'acoes', align: 'center' }
        ]"
        row-key="uri"
        flat
        bordered
      >
        <template v-slot:body-cell-ações="props">
          <q-td :props="props">
            <q-btn
              dense
              :color="authStore.get?.repositorio_conectado?.uri === props.row.uri ? 'positive' : 'primary'"
              :icon="authStore.get?.repositorio_conectado?.uri === props.row.uri ? 'check_circle' : 'check'"
              @click="selecionarAcervo(props.row)"
              :disable="authStore.get?.repositorio_conectado?.uri === props.row.uri"
            />
          </q-td>
        </template>
      </q-table>

      <!-- Barra de Pesquisa -->
      <div v-if="showSearchBar" class="search-container q-mt-md">
        <q-input
          v-model="searchTerm"
          dense
          outlined
          placeholder="Pesquisar itens..."
          class="search-input"
          @keyup.enter="pesquisarObjetos"
          :loading="loading"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
          <template v-slot:after>
            <q-btn
              color="primary"
              icon="search"
              label="Buscar"
              @click="pesquisarObjetos"
              :loading="loading"
            />
            <q-btn
              v-if="searchTerm"
              flat
              icon="clear"
              @click="limparPesquisa"
              :disable="loading"
            />
          </template>
        </q-input>

        <!-- Indicador de resultados -->
        <div class="text-caption q-mt-sm" v-if="!loading && showSearchBar">
          <template v-if="searchTerm">
            {{ catalogoItems.length }} item(s) encontrado(s) para "{{ searchTerm }}"
          </template>
          <template v-else>
            {{ catalogoItems.length }} item(s) no total
          </template>
        </div>
      </div>
    </div>

    <!-- Lista de Itens do Catálogo -->
    <div v-if="authStore.get?.repositorio_conectado" class="catalogo-list q-mt-md">
      <!-- Loading -->
      <div v-if="loading" class="text-center">
        <q-spinner-dots color="primary" size="40px" />
        <p>Carregando catálogo...</p>
      </div>

      <!-- Lista de itens -->
      <div v-else-if="catalogoItems.length > 0" class="row q-col-gutter-md">
        <div v-for="item in catalogoItems" :key="item.id" class="col-12 col-md-6 col-lg-4">
          <q-card class="catalogo-item">
            <q-card-section>
              <div class="text-h6">{{ item.titulo || 'Sem título' }}</div>
              <div class="text-subtitle2" v-if="item.tipoFisicoAbreviado?.length">
                Tipo: {{ item.tipoFisicoAbreviado.join(', ') }}
              </div>
              <div class="text-body2 q-mt-sm">{{ item.resumo || item.descricao || 'Sem descrição' }}</div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn 
                flat 
                color="primary" 
                icon="visibility" 
                label="Ver Detalhes" 
                @click="verDetalhes(item.id)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Mensagem quando não há itens -->
      <div v-else class="text-center q-pa-md">
        <p>Nenhum item encontrado neste acervo.</p>
      </div>
    </div>

    <!-- Dialog de Visualização -->
    <q-dialog
      v-model="showDialog"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 80vw; max-height: 90vh;" class="column rounded-borders">
        <!-- Cabeçalho -->
        <q-card-section class="bg-primary text-white rounded-top">
          <div class="row items-center">
            <div class="text-h6 col">{{ itemAtual?.titulo || 'Sem título' }}</div>
            <q-btn flat round icon="close" v-close-popup />
          </div>
        </q-card-section>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-dots color="primary" size="40px" />
          <p>Carregando detalhes do item...</p>
        </div>

        <!-- Conteúdo -->
        <q-card-section v-else-if="itemAtual" class="q-pa-md scroll">
          <div class="row q-col-gutter-md">
            <!-- Coluna da esquerda -->
            <div class="col-12 col-md-8">
              <div class="text-h6">Descrição</div>
              <p>{{ itemAtual.descricao || itemAtual.resumo || 'Sem descrição disponível' }}</p>

              <div class="text-h6 q-mt-md">Detalhes</div>
              <q-list>
                <q-item v-if="itemAtual.tipoFisicoAbreviado?.length">
                  <q-item-section>
                    <q-item-label caption>Tipo</q-item-label>
                    <q-item-label>{{ itemAtual.tipoFisicoAbreviado.join(', ') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="itemAtual.colecao">
                  <q-item-section>
                    <q-item-label caption>Coleção</q-item-label>
                    <q-item-label>{{ formatarNomeColecao(itemAtual.colecao) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="itemAtual.dataCriacao">
                  <q-item-section>
                    <q-item-label caption>Data de Criação</q-item-label>
                    <q-item-label>{{ formatarData(itemAtual.dataCriacao) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="temDimensoes">
                  <q-item-section>
                    <q-item-label caption>Dimensões</q-item-label>
                    <q-item-label>{{ formatarDimensoes(itemAtual) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="itemAtual.material">
                  <q-item-section>
                    <q-item-label caption>Material</q-item-label>
                    <q-item-label>{{ itemAtual.material }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Coluna da direita -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Mídias Associadas</div>
                  <div v-if="itemAtual.associatedMedia?.length" class="q-mt-sm">
                    <!-- Lista de mídias -->
                    <div v-for="(media, index) in itemAtual.associatedMedia" :key="index">
                      <!-- Implementar visualização de mídia aqui -->
                    </div>
                  </div>
                  <div v-else class="text-grey-6">
                    Nenhuma mídia associada
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <!-- Botões de navegação -->
        <q-card-actions align="between" class="navigation-footer rounded-bottom">
          <q-btn
            flat
            icon="navigate_before"
            label="Anterior"
            :disable="!temItemAnterior"
            @click="verItemAnterior"
            class="navigation-btn"
          />
          <div class="text-caption">
            Item {{ indexAtual + 1 }} de {{ catalogoItems.length }}
          </div>
          <q-btn
            flat
            icon-right="navigate_next"
            label="Próximo"
            :disable="!temProximoItem"
            @click="verProximoItem"
            class="navigation-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Notify, debounce } from 'quasar';
import { listarRepositorios } from 'src/services/api-repo';
import { pesquisarObjetosFisicos } from 'src/services/objeto-fisico-api';
import { Repositorio } from 'src/pages/tipos';
import { ObjetoFisico } from './objetos/manter-objeto';
import { useDadosRepositorio } from 'src/stores/repositorio-store';
import { useAuthStore } from 'src/stores/auth-store';

const router = useRouter();
const loading = ref(false);
const loadingAcervos = ref(false);
const acervoSelecionado = ref<Repositorio | null>(null);
const acervos = ref<Repositorio[]>([]);
const catalogoItems = ref<ObjetoFisico[]>([]);
const keyword = ref('');

const repoStore = useDadosRepositorio();
const authStore = useAuthStore();

const showDialog = ref(false);
const indexAtual = ref(-1);
const itemAtual = ref(null);

const searchTerm = ref('');
const showSearchBar = ref(false);

// Computed properties para navegação
const temItemAnterior = computed(() => indexAtual.value > 0);
const temProximoItem = computed(() => indexAtual.value < catalogoItems.value.length - 1);

// Funções de notificação
function notificarSucesso(mensagem: string) {
  Notify.create({
    type: 'positive',
    message: mensagem,
    timeout: 2000
  });
}

function notificarErro(mensagem: string) {
  Notify.create({
    type: 'negative',
    message: mensagem,
    timeout: 3000
  });
}

// Função para carregar itens quando já há um repositório selecionado
async function carregarItensIniciais() {
  if (authStore.get?.repositorio_conectado) {
    console.log('Repositório já conectado:', authStore.get.repositorio_conectado);
    loading.value = true;
    try {
      const response = await pesquisarObjetosFisicos({
        descricao: searchTerm.value,
        repositorio: authStore.get.repositorio_conectado
      });
      catalogoItems.value = response;
      // Mostra a barra de pesquisa se há um repositório conectado
      showSearchBar.value = true;
      console.log('Itens carregados inicialmente:', catalogoItems.value.length);
    } catch (error) {
      console.error('Erro ao carregar itens iniciais:', error);
      notificarErro('Erro ao carregar itens do catálogo');
    } finally {
      loading.value = false;
    }
  }
}

// Função para carregar acervos
async function carregarAcervos() {
  try {
    const response = await listarRepositorios();
    acervos.value = response;
    console.log('Acervos carregados:', acervos.value);
    
    // Carrega os itens se já houver um repositório selecionado
    await carregarItensIniciais();
  } catch (error) {
    console.error('Erro ao carregar acervos:', error);
    notificarErro('Erro ao carregar lista de acervos');
  }
}

// Função para selecionar acervo
async function selecionarAcervo(acervo: any) {
  try {
    console.log('Selecionando acervo:', acervo);
    
    // Atualiza os stores
    authStore.set({
      ...authStore.get,
      repositorio_conectado: acervo
    });
    repoStore.set(acervo);
    
    // Pesquisa os objetos com o novo repositório
    await pesquisarObjetos();
    
    // Mostra a barra de pesquisa
    showSearchBar.value = true;
    
    notificarSucesso('Repositório selecionado com sucesso');
  } catch (error) {
    console.error('Erro ao selecionar acervo:', error);
    notificarErro('Erro ao conectar ao repositório');
  }
}

// Função de pesquisa
async function pesquisarObjetos() {
  if (!authStore.get?.repositorio_conectado) {
    notificarErro('Selecione um repositório primeiro');
    return;
  }

  loading.value = true;
  try {
    console.log('Iniciando pesquisa com termo:', searchTerm.value);
    console.log('Repositório:', authStore.get.repositorio_conectado.nome);

    const response = await pesquisarObjetosFisicos({
      descricao: searchTerm.value.trim(),
      repositorio: authStore.get.repositorio_conectado
    });

    catalogoItems.value = response;
    console.log('Resultados encontrados:', catalogoItems.value.length);

    if (catalogoItems.value.length === 0 && searchTerm.value) {
      notificarErro(`Nenhum item encontrado para "${searchTerm.value}"`);
    }
  } catch (error) {
    console.error('Erro ao pesquisar objetos:', error);
    notificarErro('Erro ao carregar os itens do catálogo');
  } finally {
    loading.value = false;
  }
}

// Funções auxiliares
function formatarNomeColecao(colecao: string): string {
  return colecao.split('#').pop() || colecao;
}

function formatarData(data: string): string {
  if (!data) return '';
  return new Date(data).toLocaleDateString();
}

function formatarDimensoes(item: any): string {
  const dimensoes = [];
  if (item.altura) dimensoes.push(`Altura: ${item.altura}cm`);
  if (item.largura) dimensoes.push(`Largura: ${item.largura}cm`);
  if (item.profundidade) dimensoes.push(`Profundidade: ${item.profundidade}cm`);
  if (item.peso) dimensoes.push(`Peso: ${item.peso}g`);
  return dimensoes.join(' | ') || 'Não informadas';
}

const temDimensoes = computed(() => {
  return itemAtual.value?.altura || 
         itemAtual.value?.largura || 
         itemAtual.value?.profundidade || 
         itemAtual.value?.peso;
});

// Funções de navegação
async function verDetalhes(id: string) {
  loading.value = true;
  try {
    // Encontra o índice do item atual
    indexAtual.value = catalogoItems.value.findIndex(item => item.id === id);
    if (indexAtual.value !== -1) {
      itemAtual.value = catalogoItems.value[indexAtual.value];
      showDialog.value = true;
    }
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    notificarErro('Erro ao carregar detalhes do item');
  } finally {
    loading.value = false;
  }
}

function verProximoItem() {
  if (temProximoItem.value) {
    indexAtual.value++;
    itemAtual.value = catalogoItems.value[indexAtual.value];
  }
}

function verItemAnterior() {
  if (temItemAnterior.value) {
    indexAtual.value--;
    itemAtual.value = catalogoItems.value[indexAtual.value];
  }
}

// Função para limpar a pesquisa
async function limparPesquisa() {
  console.log('Limpando pesquisa');
  searchTerm.value = '';
  await pesquisarObjetos();
}

// Watch para pesquisa com debounce
watch(searchTerm, 
  debounce(async (newValue) => {
    console.log('Termo de pesquisa alterado:', newValue);
    if (authStore.get?.repositorio_conectado) {
      await pesquisarObjetos();
    }
  }, 500)
);

// Mounted hook
onMounted(() => {
  carregarAcervos();
});
</script>

<style scoped>
.catalogo-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.acervo-selector {
  margin-bottom: 2rem;
  text-align: center;
}

.catalogo-item {
  height: 100%;
  transition: transform 0.2s;
}

.catalogo-item:hover {
  transform: translateY(-5px);
}

.text-center {
  text-align: center;
}

.q-select {
  max-width: 400px;
  margin: 0 auto;
}

.q-card {
  height: 100%;
}

.scroll {
  overflow-y: auto;
}

.rounded-borders {
  border-radius: 12px;
  min-width: 1200px;
  max-width: 1800px;
}

.rounded-top {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.rounded-bottom {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.q-card-section.scroll {
  max-height: calc(90vh - 100px);
  padding-bottom: 8px;
}

.navigation-footer {
  background-color: #f5f5f5;
  padding: 8px 16px;
  margin-top: auto;
  border-top: 1px solid #e0e0e0;
  min-height: 48px;
}

.navigation-btn {
  min-width: 100px;
}

/* Ajuste responsivo para telas menores */
@media (max-width: 1200px) {
  .rounded-borders {
    min-width: unset;
    width: 80vw;
  }
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.search-input {
  width: 100%;
}

.catalogo-list {
  min-height: 200px;
}
</style> 