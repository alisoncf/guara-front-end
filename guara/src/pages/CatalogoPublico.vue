<template>
  <div class="catalogo-container">
    <!-- Seletor de Acervo -->
    <div class="acervo-selector">
      <h2>Catálogo</h2>
      <q-select
        v-model="acervoSelecionado"
        :options="acervos"
        label="Selecione o Acervo"
        class="q-mb-md"
        style="max-width: 300px; margin: 0 auto;"
      />
    </div>

    <!-- Lista de Itens do Catálogo -->
    <div class="catalogo-list" v-if="acervoSelecionado">
      <!-- Loading -->
      <div v-if="loading" class="text-center">
        <q-spinner-dots color="primary" size="40px" />
        <p>Carregando catálogo...</p>
      </div>

      <!-- Lista de itens -->
      <div v-else class="row q-col-gutter-md">
        <div v-for="item in catalogoItems" :key="item.id" class="col-12 col-md-6 col-lg-4">
          <q-card class="catalogo-item">
            <q-img
              :src="item.imagem || 'default-image.jpg'"
              style="height: 200px"
            />
            <q-card-section>
              <div class="text-h6">{{ item.titulo }}</div>
              <div class="text-subtitle2">{{ item.descricao }}</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="primary" label="Ver Detalhes" @click="verDetalhes(item.id)" />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Mensagem quando não há itens -->
      <div v-if="!loading && catalogoItems.length === 0" class="text-center q-pa-md">
        <p>Nenhum item encontrado neste acervo.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const acervoSelecionado = ref(null);
const acervos = ref([]);
const catalogoItems = ref([]);

// Função para carregar os acervos disponíveis
async function carregarAcervos() {
  try {
    // Aqui você deve implementar a chamada à sua API
    // const response = await api.get('/acervos');
    // acervos.value = response.data;
    
    // Exemplo temporário:
    acervos.value = [
      { label: 'Acervo 1', value: '1' },
      { label: 'Acervo 2', value: '2' },
    ];
  } catch (error) {
    console.error('Erro ao carregar acervos:', error);
  }
}

// Função para carregar itens do catálogo
async function carregarCatalogo(acervoId: string) {
  loading.value = true;
  try {
    // Aqui você deve implementar a chamada à sua API
    // const response = await api.get(`/catalogo/${acervoId}`);
    // catalogoItems.value = response.data;
    
    // Exemplo temporário:
    catalogoItems.value = [
      {
        id: '1',
        titulo: 'Item 1',
        descricao: 'Descrição do item 1',
        imagem: null
      },
      // ... mais itens
    ];
  } catch (error) {
    console.error('Erro ao carregar catálogo:', error);
  } finally {
    loading.value = false;
  }
}

// Watch para mudanças no acervo selecionado
watch(acervoSelecionado, (newValue) => {
  if (newValue) {
    carregarCatalogo(newValue.value);
  } else {
    catalogoItems.value = [];
  }
});

// Função para ver detalhes de um item
function verDetalhes(itemId: string) {
  router.push(`/catalogo/item/${itemId}`);
}

// Carregar acervos quando a página for montada
onMounted(() => {
  carregarAcervos();
});
</script>

<style scoped>
.catalogo-container {
  padding: 2rem;
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
</style> 