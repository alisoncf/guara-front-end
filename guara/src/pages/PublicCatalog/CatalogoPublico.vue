<template>
  <div class="catalogo-container">
    <!-- Select do Repositório -->
    <div class="q-mb-lg">
      <div class="text-h5 q-mb-md">Selecione um repositório</div>
      <q-select
        v-model="repositorioSelecionado"
        :options="repositorios"
        option-label="nome"
        option-value="uri"
        label="Repositório"
        :loading="loadingRepositorios"
        emit-value
        map-options
        :disable="loadingRepositorios"
        @update:model-value="selecionarAcervo"
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.nome }}</q-item-label>
              <q-item-label caption>{{ scope.opt.descricao }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <!-- Seção de coleções -->
    <template v-if="authStore.get?.repositorio_conectado">
      <q-separator class="q-my-lg" />
      
      <div class="text-h5 q-mb-lg">
        Coleções
        <q-badge
          v-if="!loadingColecoes"
          color="primary"
          class="q-ml-sm"
        >
          {{ colecoes.length }}
        </q-badge>
      </div>

      <div v-if="loadingColecoes" class="text-center q-pa-md">
        <q-spinner color="primary" size="2em" />
        <div class="q-mt-sm">Carregando coleções...</div>
      </div>

      <div v-else-if="colecoes.length === 0" class="text-center q-pa-md">
        <q-icon name="info" size="2em" color="grey" />
        <div class="text-grey q-mt-sm">Nenhuma coleção encontrada</div>
      </div>

      <div v-else class="q-mt-md">
        <q-list bordered separator>
          <q-item 
            v-for="colecao in colecoes" 
            :key="colecao.uri"
            clickable
            v-ripple
            @click="navegarParaColecao(colecao)"
          >
            <q-item-section>
              <q-item-label>{{ colecao.nome }}</q-item-label>
              <q-item-label caption v-if="colecao.descricao">
                {{ colecao.descricao }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { listarRepositorios } from 'src/services/api-repo';
import { Notify } from 'quasar';
import axios from 'axios';
import apiConfig from 'src/apiConfig';
import { textoAposUltimoChar } from 'src/pages/funcoes';

const router = useRouter();
const authStore = useAuthStore();

interface Colecao {
  uri: string;
  nome: string;
  descricao: string;
}

const repositorios = ref([]);
const repositorioSelecionado = ref(null);
const colecoes = ref<Colecao[]>([]);
const loadingRepositorios = ref(false);
const loadingColecoes = ref(false);

// Carregar repositórios quando o componente for montado
onMounted(async () => {
  await carregarRepositorios();
});

async function carregarRepositorios() {
  loadingRepositorios.value = true;
  try {
    repositorios.value = await listarRepositorios();
    console.log('Repositórios carregados:', repositorios.value);
  } catch (error) {
    console.error('Erro ao carregar repositórios:', error);
    notificarErro('Erro ao carregar repositórios');
  } finally {
    loadingRepositorios.value = false;
  }
}

async function selecionarAcervo(uri: string) {
  try {
    const repositorio = repositorios.value.find(r => r.uri === uri);
    if (!repositorio) {
      throw new Error('Repositório não encontrado');
    }

    authStore.set({
      ...authStore.get,
      repositorio_conectado: repositorio
    });

    await carregarColecoes();
  } catch (error) {
    console.error('Erro ao selecionar acervo:', error);
    notificarErro('Erro ao selecionar acervo');
  }
}

async function carregarColecoes() {
  if (!authStore.get?.repositorio_conectado?.uri) {
    console.log('Nenhum repositório conectado');
    return;
  }
  
  loadingColecoes.value = true;
  try {
    console.log('Carregando coleções para repositório:', authStore.get.repositorio_conectado.uri);
    
    const response = await axios.post(
      `${apiConfig.baseURL}${apiConfig.endpoints.classapi}/listar_classes`,
      {
        keyword: '',
        repository: authStore.get.repositorio_conectado.uri,
        orderby: 'subclassof'
      }
    );

    console.log('Resposta da API:', response.data);

    if (response.data?.results?.bindings) {
      colecoes.value = response.data.results.bindings.map((item: any) => ({
        uri: item.class?.value || '',
        nome: item.label?.value || formatarNomeColecao(item.class?.value || ''),
        descricao: item.description?.value || ''
      }));

      console.log('Coleções carregadas:', colecoes.value);
    } else {
      throw new Error('Formato de resposta inválido');
    }
  } catch (error) {
    console.error('Erro detalhado ao carregar coleções:', error);
    notificarErro('Erro ao carregar coleções');
    colecoes.value = [];
  } finally {
    loadingColecoes.value = false;
  }
}

function navegarParaColecao(colecao: Colecao) {
  const colecaoParam = encodeURIComponent(JSON.stringify(colecao));
  router.push(`/colecao/${colecaoParam}`);
}

function formatarNomeColecao(uri: string): string {
  return textoAposUltimoChar(uri, '#') || uri;
}

function notificarErro(mensagem: string) {
  Notify.create({
    type: 'negative',
    message: mensagem,
    position: 'top'
  });
}
</script>

<style scoped>
.catalogo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.q-page-container {
  padding-top: 50px; /* Ajuste conforme necessário */
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
  max-width: 600px;
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

.colecao-card {
  transition: transform 0.2s;
}

.colecao-card:hover {
  transform: translateY(-5px);
}
</style> 