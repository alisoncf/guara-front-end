<template>
  <div class="catalogo-container">
    <!-- Debug info simplificado -->
    <div class="debug-info q-pa-md q-mb-md" v-if="showDebug">
      <q-btn label="Toggle Debug Info" color="grey" flat @click="toggleDebug" />
      <div v-if="debugVisible" class="q-mt-sm">
        <div>Objetos carregados: {{ objetos.length }}</div>
        <div>Coleção: {{ colecaoAtual?.nome }}</div>
      </div>
    </div>

    <div class="row items-center q-mb-lg">
      <q-btn
        icon="arrow_back"
        flat
        class="q-mr-sm"
        @click="voltarParaCatalogo"
        label="Voltar para o catálogo"
      />
    </div>

    <div class="colecao-info q-mb-lg">
      <h2 class="text-h4 q-mb-sm">{{ colecaoAtual?.nome }}</h2>
      <p v-if="colecaoAtual?.descricao" class="text-grey-8">
        {{ colecaoAtual.descricao }}
      </p>
    </div>

    <!-- Lista de objetos -->
    <div class="objetos-section">
      <div v-if="loading" class="text-center q-pa-lg">
        <q-spinner color="primary" size="3em" />
        <div class="text-grey q-mt-sm">Carregando objetos...</div>
      </div>

      <div v-else-if="objetos.length === 0" class="text-center q-pa-lg">
        <q-icon name="inventory_2" size="3em" color="grey-5" />
        <div class="text-grey q-mt-sm">
          Nenhum objeto encontrado nesta coleção
        </div>
        <q-btn
          flat
          color="primary"
          label="Voltar para o catálogo"
          class="q-mt-md"
          @click="voltarParaCatalogo"
        />
      </div>

      <div v-else>
        <div class="row q-col-gutter-md">
          <div v-for="objeto in objetos" :key="objeto.uri" class="col-12 col-sm-6 col-md-4">
            <q-card class="objeto-card">
              <q-card-section>
                <div class="text-h6">{{ objeto.nome || 'Sem nome' }}</div>
                <div v-if="objeto.descricao" class="text-grey-8 q-mt-sm text-body2 ellipsis-2-lines">
                  {{ objeto.descricao }}
                </div>
                <div v-else class="text-grey-6 q-mt-sm">
                  Sem descrição disponível
                </div>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn 
                  flat 
                  color="primary" 
                  icon="visibility"
                  label="Ver detalhes"
                  @click="abrirDetalhesObjeto(objeto)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo de detalhes -->
    <q-dialog
      v-model="mostrarDetalhes"
      full-width
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="detalhe-dialog" v-if="objetoSelecionado">
        <!-- Cabeçalho -->
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">{{ objetoSelecionado.nome }}</div>
              <div class="text-subtitle2">{{ formatarTipos(objetoSelecionado.tipos) }}</div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <!-- Conteúdo com scroll -->
        <q-card-section class="q-pa-md scroll" style="max-height: 70vh">
          <!-- Resumo -->
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-sm">
              <q-icon name="short_text" class="q-mr-sm" />
              Resumo
            </div>
            <q-card flat bordered>
              <q-card-section>
                {{ objetoSelecionado.resumo || 'Nenhum resumo disponível' }}
              </q-card-section>
            </q-card>
          </div>

          <!-- Descrição -->
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-sm">
              <q-icon name="description" class="q-mr-sm" />
              Descrição
            </div>
            <q-card flat bordered>
              <q-card-section>
                {{ objetoSelecionado.descricao || 'Nenhuma descrição disponível' }}
              </q-card-section>
            </q-card>
          </div>

          <!-- Informações Técnicas -->
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-sm">
              <q-icon name="info" class="q-mr-sm" />
              Informações Técnicas
            </div>
            <q-list bordered separator>
              <!-- Tipos -->
              <q-item>
                <q-item-section>
                  <q-item-label overline>Tipos</q-item-label>
                  <q-item-label>{{ formatarTipos(objetoSelecionado.tipos) }}</q-item-label>
                </q-item-section>
              </q-item>

              <!-- Coleção -->
              <q-item>
                <q-item-section>
                  <q-item-label overline>Coleção</q-item-label>
                  <q-item-label>{{ formatarNomeColecao(objetoSelecionado.colecao) }}</q-item-label>
                </q-item-section>
              </q-item>

              <!-- URI -->
              <q-item>
                <q-item-section>
                  <q-item-label overline>URI</q-item-label>
                  <q-item-label class="text-break">{{ objetoSelecionado.uri }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Seção de Mídia (comentada por enquanto) -->
          <!-- <div v-if="midiaObjeto.length > 0" class="q-mb-lg">
            ... código da seção de mídia ...
          </div> -->
        </q-card-section>

        <!-- Rodapé -->
        <q-card-actions align="right" class="bg-grey-2">
          <q-btn 
            flat 
            color="primary" 
            label="Fechar" 
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import axios from 'axios';
import apiConfig from 'src/apiConfig';
import { Notify } from 'quasar';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

interface Midia {
  uri: string;
  url: string;
  tipo: 'imagem' | 'pdf' | 'video';
  nome: string;
  mimeType?: string;
}

const loading = ref(false);
const objetos = ref<any[]>([]);
const colecaoAtual = ref<any>(null);
const mostrarDetalhes = ref(false);
const objetoSelecionado = ref<any>(null);
const midiaObjeto = ref<Midia[]>([]);
const debugVisible = ref(false);
const showDebug = ref(true); // Você pode mudar para false em produção

function toggleDebug() {
  debugVisible.value = !debugVisible.value;
}

onMounted(async () => {
  try {
    const colecaoParam = route.params.colecao as string;
    if (colecaoParam) {
      colecaoAtual.value = JSON.parse(decodeURIComponent(colecaoParam));
      console.log('Coleção carregada:', colecaoAtual.value);
      await carregarObjetos();
    }
  } catch (error) {
    console.error('Erro ao inicializar página:', error);
    notificarErro('Erro ao carregar a coleção');
  }
});

async function carregarObjetos() {
  if (!authStore.get?.repositorio_conectado?.uri || !colecaoAtual.value?.uri) {
    console.log('Faltam dados:', {
      repositorio: authStore.get?.repositorio_conectado?.uri,
      colecao: colecaoAtual.value?.uri
    });
    return;
  }

  loading.value = true;
  try {
    const payload = {
      keyword: '',
      repository: authStore.get.repositorio_conectado.uri,
      class: colecaoAtual.value.uri,
      orderby: 'label'
    };

    console.log('Enviando requisição com:', payload);

    const response = await axios.post(
      `${apiConfig.baseURL}${apiConfig.endpoints.objectapi}/listar_objetos`,
      payload
    );

    if (response.data?.results?.bindings) {
      // Filtro mais rigoroso para objetos da coleção atual
      const objetosFiltrados = response.data.results.bindings.filter((item: any) => {
        // Se o objeto tem uma coleção definida, deve ser a coleção atual
        if (item.colecao?.value) {
          return item.colecao.value === colecaoAtual.value.uri;
        }
        // Se não tem coleção definida, verificamos os tipos
        if (item.tipos?.value) {
          const tipos = item.tipos.value.split(',').map((t: string) => t.trim());
          // Verifica se algum dos tipos corresponde à coleção atual
          return tipos.some((tipo: string) => 
            tipo.includes(colecaoAtual.value.uri) || 
            tipo.endsWith('#' + colecaoAtual.value.nome)
          );
        }
        return false; // Se não tem nem coleção nem tipos, não incluir
      });

      console.log(`Filtrado ${objetosFiltrados.length} objetos de ${response.data.results.bindings.length} total`);

      objetos.value = objetosFiltrados.map((item: any) => ({
        uri: item.obj?.value || '',
        nome: item.titulo?.value || formatarNomeObjeto(item.obj?.value || ''),
        descricao: item.descricao?.value || '',
        resumo: item.resumo?.value || '',
        tipos: item.tipos?.value || '',
        colecao: item.colecao?.value || ''
      })).filter(obj => obj.uri);

      console.log('Objetos mapeados para a coleção:', colecaoAtual.value.nome);
      console.log('Total de objetos:', objetos.value.length);
    }
  } catch (error) {
    console.error('Erro ao carregar objetos:', error);
    notificarErro('Erro ao carregar objetos da coleção');
    objetos.value = [];
  } finally {
    loading.value = false;
  }
}

function formatarNomeObjeto(uri: string): string {
  const parts = uri.split(/[/#]/);
  return parts[parts.length - 1] || uri;
}

function voltarParaCatalogo() {
  router.push('/catalogo');
}

async function abrirDetalhesObjeto(objeto: any) {
  objetoSelecionado.value = objeto;
  mostrarDetalhes.value = true;
  midiaObjeto.value = [];
}

function notificarErro(mensagem: string) {
  Notify.create({
    type: 'negative',
    message: mensagem,
    position: 'top'
  });
}

function formatarTipos(tipos: string): string {
  if (!tipos) return 'Nenhum tipo';
  const tipoArray = tipos.split(',').map(t => t.trim());
  return tipoArray.join(', ');
}

function formatarNomeColecao(colecao: string): string {
  if (!colecao) return 'Nenhuma coleção';
  const colecaoAtual = colecao.split('#').pop();
  return colecaoAtual || colecao;
}
</script>

<style scoped>
.catalogo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.objeto-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.objeto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detalhe-dialog {
  min-width: 80vw;
  max-width: 1200px;
}

.debug-info {
  background: #f5f5f5;
  border-radius: 4px;
}

.text-break {
  word-break: break-all;
}

@media (max-width: 600px) {
  .detalhe-dialog {
    width: 100vw;
  }
}

.scroll {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.scroll::-webkit-scrollbar {
  width: 8px;
}

.scroll::-webkit-scrollbar-track {
  background: transparent;
}

.scroll::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}
</style> 