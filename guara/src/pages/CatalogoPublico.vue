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
              
              <!-- Informações adicionais -->
              <div v-if="temDimensoes(item)" class="text-caption q-mt-sm text-grey-8">
                <q-icon name="straighten" size="xs" class="q-mr-xs" />
                {{ formatarDimensoes(item) }}
              </div>
              <div v-if="item.material" class="text-caption text-grey-8">
                <q-icon name="category" size="xs" class="q-mr-xs" />
                {{ item.material }}
              </div>
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
      <q-card class="dialog-card rounded-borders">
        <!-- Cabeçalho fixo -->
        <q-card-section class="bg-primary text-white rounded-top header">
          <div class="row items-center">
            <div class="text-h6 col">{{ itemAtual?.titulo || 'Sem título' }}</div>
            <q-btn flat round icon="close" v-close-popup />
          </div>
        </q-card-section>

        <!-- Área de conteúdo com scroll -->
        <q-card-section class="content-area">
          <div class="row q-col-gutter-md">
            <!-- Coluna principal -->
            <div class="col-12 col-md-8">
              <div class="text-h6">Descrição</div>
              <p>{{ itemAtual?.descricao || itemAtual?.resumo || 'Sem descrição disponível' }}</p>

              <div class="text-h6 q-mt-md">Detalhes</div>
              <q-list>
                <q-item v-if="itemAtual?.tipoFisicoAbreviado?.length">
                  <q-item-section>
                    <q-item-label caption>Tipo</q-item-label>
                    <q-item-label>{{ itemAtual.tipoFisicoAbreviado.join(', ') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="temDimensoes(itemAtual)">
                  <q-item-section>
                    <q-item-label caption>Dimensões</q-item-label>
                    <q-item-label>{{ formatarDimensoes(itemAtual) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="itemAtual?.material">
                  <q-item-section>
                    <q-item-label caption>Material</q-item-label>
                    <q-item-label>{{ itemAtual.material }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Coluna de mídias -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">
                    <q-icon name="photo_library" size="sm" class="q-mr-sm" />
                    Mídias
                  </div>

                  <!-- Com mídias -->
                  <div v-if="itemAtual?.associatedMedia?.length" class="row q-col-gutter-sm q-mt-sm">
                    <div 
                      v-for="(media, index) in itemAtual.associatedMedia" 
                      :key="index" 
                      class="col-12"
                    >
                      <!-- Imagem -->
                      <q-img
                        v-if="isImage(media)"
                        :src="media"
                        style="height: 200px"
                        fit="contain"
                        class="rounded-borders"
                      >
                        <template v-slot:error>
                          <div class="absolute-full flex flex-center bg-grey-3">
                            <q-icon name="error" size="2em" />
                          </div>
                        </template>
                      </q-img>

                      <!-- PDF -->
                      <q-btn
                        v-else-if="isPDF(media)"
                        class="full-width"
                        color="primary"
                        icon="picture_as_pdf"
                        :href="media"
                        target="_blank"
                        label="Abrir PDF"
                      />

                      <!-- Vídeo -->
                      <video
                        v-else-if="isVideo(media)"
                        controls
                        class="full-width rounded-borders"
                        style="max-height: 200px"
                      >
                        <source :src="media" />
                      </video>
                    </div>
                  </div>

                  <!-- Sem mídias -->
                  <div v-else class="text-center q-pa-md text-grey-6">
                    <q-icon name="no_photography" size="2em" />
                    <p class="q-mt-sm">Este item não possui mídias associadas.</p>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Separador -->
          <q-separator class="q-my-lg" />

          <!-- Itens Relacionados -->
          <div class="items-relacionados q-mb-lg">
            <div class="text-h6">
              <q-icon name="link" size="sm" class="q-mr-sm" />
              Itens Relacionados
            </div>
            
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots color="primary" size="40px" />
              <p>Carregando relações...</p>
            </div>

            <div v-else>
              <q-list v-if="itemAtual?.temRelacao?.length" padding>
                <q-item
                  v-for="relacaoId in itemAtual.temRelacao"
                  :key="relacaoId"
                  clickable
                  v-ripple
                  @click="carregarItemRelacionado(relacaoId)"
                  class="relacionado-item"
                >
                  <q-item-section avatar>
                    <q-icon name="article" color="primary" />
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label>
                      {{ getItemRelacionado(relacaoId)?.titulo || 'Carregando...' }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ getItemRelacionado(relacaoId)?.tipoFisicoAbreviado?.join(', ') }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-icon name="chevron_right" color="grey" />
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-else class="text-center q-pa-md text-grey-6">
                <q-icon name="link_off" size="2em" />
                <p class="q-mt-sm">Este item não possui relações com outros objetos.</p>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Rodapé fixo -->
        <q-card-actions align="between" class="navigation-footer rounded-bottom">
          <q-btn
            flat
            icon="navigate_before"
            label="Anterior"
            :disable="!temItemAnterior"
            @click="verItemAnterior"
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
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { Notify, debounce } from 'quasar';
import { listarRepositorios } from 'src/services/api-repo';
import { pesquisarObjetosFisicos } from 'src/services/objeto-fisico-api';
import { Repositorio } from 'src/pages/tipos';
import { ObjetoFisico } from './objetos/manter-objeto';
import { useDadosRepositorio } from 'src/stores/repositorio-store';
import { useAuthStore } from 'src/stores/auth-store';

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

// Cache para itens relacionados
const itensRelacionadosCache = ref<Map<string, ObjetoFisico>>(new Map());

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

// Funções auxiliares para dimensões
function temDimensoes(item: any): boolean {
  return !!(item.altura || item.largura || item.profundidade || item.peso);
}

function formatarDimensoes(item: any): string {
  const dimensoes = [];
  if (item.altura) dimensoes.push(`${item.altura}cm (A)`);
  if (item.largura) dimensoes.push(`${item.largura}cm (L)`);
  if (item.profundidade) dimensoes.push(`${item.profundidade}cm (P)`);
  if (item.peso) dimensoes.push(`${item.peso}g`);
  return dimensoes.join(' × ') || 'Não informadas';
}

// Funções de navegação
async function verDetalhes(id: string) {
  loading.value = true;
  try {
    // Encontra o índice do item atual
    indexAtual.value = catalogoItems.value.findIndex(item => item.id === id);
    if (indexAtual.value !== -1) {
      itemAtual.value = catalogoItems.value[indexAtual.value];
      
      // Carrega os itens relacionados se houver
      if (itemAtual.value.temRelacao?.length) {
        await Promise.all(
          itemAtual.value.temRelacao.map(async (relacaoId) => {
            if (!itensRelacionadosCache.value.has(relacaoId)) {
              const response = await pesquisarObjetosFisicos({
                id: relacaoId,
                repositorio: authStore.get.repositorio_conectado
              });
              
              if (response && response.length > 0) {
                itensRelacionadosCache.value.set(relacaoId, response[0]);
              }
            }
          })
        );
      }
      
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

// Funções auxiliares para mídia
function isImage(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('data:image/');
}

function isPDF(url: string): boolean {
  return url.endsWith('.pdf') || url.startsWith('data:application/pdf');
}

function isVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)$/i.test(url);
}

// Função para obter item do cache
function getItemRelacionado(id: string): ObjetoFisico | undefined {
  return itensRelacionadosCache.value.get(id);
}

// Função para carregar item relacionado
async function carregarItemRelacionado(id: string) {
  try {
    // Primeiro verifica se já está no cache
    if (!itensRelacionadosCache.value.has(id)) {
      const response = await pesquisarObjetosFisicos({
        id: id,
        repositorio: authStore.get.repositorio_conectado
      });
      
      if (response && response.length > 0) {
        itensRelacionadosCache.value.set(id, response[0]);
      }
    }

    // Atualiza o item atual para mostrar o item relacionado
    const itemRelacionado = itensRelacionadosCache.value.get(id);
    if (itemRelacionado) {
      itemAtual.value = itemRelacionado;
      // Atualiza o índice atual se o item estiver na lista principal
      const novoIndex = catalogoItems.value.findIndex(item => item.id === id);
      if (novoIndex !== -1) {
        indexAtual.value = novoIndex;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar item relacionado:', error);
    notificarErro('Erro ao carregar item relacionado');
  }
}

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

.text-caption {
  line-height: 1.2;
}

.q-icon {
  vertical-align: middle;
}

.items-relacionados {
  margin-top: 24px;
  padding-top: 16px;
}

.relacionado-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background-color 0.3s;
  border: 1px solid #e0e0e0;
}

.relacionado-item:hover {
  background-color: #f5f5f5;
}

.text-grey-6 {
  opacity: 0.7;
}

.midias-container {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
}

.q-img {
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.q-btn.full-width {
  margin: 4px 0;
}

.dialog-card {
  width: 80vw;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.header {
  z-index: 1;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.navigation-footer {
  background-color: #f5f5f5;
  padding: 8px 16px;
  border-top: 1px solid #e0e0e0;
  z-index: 1;
}

.rounded-borders {
  border-radius: 12px;
}

.rounded-top {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.rounded-bottom {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.items-relacionados {
  margin-top: 24px;
}

/* Ajustes para mídias */
.q-img {
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.q-btn.full-width {
  margin: 4px 0;
}
</style> 