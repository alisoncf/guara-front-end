<template>
  <div class="visualizar-item q-pa-md">
    <q-card flat bordered>
      <!-- Cabeçalho -->
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ item?.titulo || 'Sem título' }}</div>
        <div class="text-subtitle2" v-if="item?.tipoFisicoAbreviado?.length">
          {{ item.tipoFisicoAbreviado.join(', ') }}
        </div>
      </q-card-section>

      <!-- Loading -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
        <p>Carregando detalhes do item...</p>
      </div>

      <template v-else-if="item">
        <!-- Informações principais -->
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Coluna da esquerda -->
            <div class="col-12 col-md-8">
              <div class="text-h6">Descrição</div>
              <p>{{ item.descricao || item.resumo || 'Sem descrição disponível' }}</p>

              <div class="text-h6 q-mt-md">Detalhes</div>
              <q-list>
                <q-item v-if="item.colecao">
                  <q-item-section>
                    <q-item-label caption>Coleção</q-item-label>
                    <q-item-label>{{ formatarNomeColecao(item.colecao) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="item.dataCriacao">
                  <q-item-section>
                    <q-item-label caption>Data de Criação</q-item-label>
                    <q-item-label>{{ formatarData(item.dataCriacao) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="temDimensoes">
                  <q-item-section>
                    <q-item-label caption>Dimensões</q-item-label>
                    <q-item-label>
                      {{ formatarDimensoes(item) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="item.material">
                  <q-item-section>
                    <q-item-label caption>Material</q-item-label>
                    <q-item-label>{{ item.material }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Coluna da direita -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Mídias Associadas</div>
                  <div v-if="item.associatedMedia?.length" class="q-mt-sm">
                    <!-- Lista de mídias -->
                    <div v-for="(media, index) in item.associatedMedia" :key="index">
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
      </template>

      <!-- Botões de ação -->
      <q-card-actions align="right">
        <q-btn
          flat
          color="secondary"
          icon="arrow_back"
          label="Voltar"
          @click="router.back()"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { pesquisarObjetosFisicos } from 'src/services/objeto-fisico-api';
import { useAuthStore } from 'src/stores/auth-store';
import { Notify } from 'quasar';
import { ObjetoFisico } from './objetos/manter-objeto';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const item = ref<ObjetoFisico | null>(null);

// Computed properties
const temDimensoes = computed(() => {
  return item.value?.altura || item.value?.largura || item.value?.profundidade || item.value?.peso;
});

// Funções auxiliares
function formatarNomeColecao(colecao: string): string {
  return colecao.split('#').pop() || colecao;
}

function formatarData(data: string): string {
  if (!data) return '';
  return new Date(data).toLocaleDateString();
}

function formatarDimensoes(item: ObjetoFisico): string {
  const dimensoes = [];
  if (item.altura) dimensoes.push(`Altura: ${item.altura}cm`);
  if (item.largura) dimensoes.push(`Largura: ${item.largura}cm`);
  if (item.profundidade) dimensoes.push(`Profundidade: ${item.profundidade}cm`);
  if (item.peso) dimensoes.push(`Peso: ${item.peso}g`);
  return dimensoes.join(' | ') || 'Não informadas';
}

// Carregar dados do item
async function carregarItem() {
  const itemId = route.params.id as string;
  if (!itemId) {
    notificarErro('ID do item não fornecido');
    router.push('/catalogo');
    return;
  }

  try {
    loading.value = true;
    console.log('Buscando item com ID:', itemId);
    
    // Verifica se há um repositório conectado
    if (!authStore.get?.repositorio_conectado) {
      notificarErro('Nenhum repositório selecionado');
      router.push('/catalogo');
      return;
    }

    const response = await pesquisarObjetosFisicos({
      id: itemId,
      repositorio: authStore.get.repositorio_conectado
    });

    console.log('Resposta da busca:', response);

    if (response && response.length > 0) {
      item.value = response[0];
    } else {
      notificarErro('Item não encontrado');
      router.push('/catalogo');
    }
  } catch (error) {
    console.error('Erro ao carregar item:', error);
    notificarErro('Erro ao carregar detalhes do item');
    router.push('/catalogo');
  } finally {
    loading.value = false;
  }
}

function notificarErro(mensagem: string) {
  Notify.create({
    type: 'negative',
    message: mensagem,
    timeout: 3000
  });
}

onMounted(() => {
  carregarItem();
});
</script>

<style scoped>
.visualizar-item {
  max-width: 1200px;
  margin: 0 auto;
}

.text-h6 {
  margin-bottom: 1rem;
}

.q-card {
  height: 100%;
}
</style> 