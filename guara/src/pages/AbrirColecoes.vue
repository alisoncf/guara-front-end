<template>
  <q-page class="flex flex-center q-pa-md q-my-lg" style="min-height: 80vh;">
    <q-card class="full-width">
      <q-tabs
        v-model="activeTab"
        class="text-teal"
        align="justify"
        active-color="teal"
        indicator-color="teal"
      >
        <q-tab name="quem" label="Quem" />
        <q-tab name="o-que" label="O quê" />
        <q-tab name="onde" label="Onde" />
        <q-tab name="quando" label="Quando" />
      </q-tabs>

      <q-separator />

      <q-card-section>
        <q-input
          outlined
          dense
          v-model="keyword"
          :label="activeTabLabel"
          @keyup.enter="search"
        />
        <q-btn @click="search" color="teal" label="Pesquisar" icon="search" class="q-ml-md" />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          class="full-height"
          striped
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';



const keyword = ref('');
const rows = ref([]);
const activeTab = ref('quem');
const columns = [
  { name: 'objeto', label: 'Objeto', align: 'left', field: row => row.obj.value },
  { name: 'titulo', label: 'Título', align: 'left', field: row => row.titulo.value },
  { name: 'tipo', label: 'Tipo', align: 'left', field: row => row.tipo.value },
  { name: 'resumo', label: 'Resumo', align: 'left', field: row => row.resumo.value }
];

const activeTabLabel = computed(() => {
  switch (activeTab.value) {
    case 'quem':
      return 'Palavra-chave (Quem)';
    case 'o-que':
      return 'Palavra-chave (O quê)';
    case 'onde':
      return 'Palavra-chave (Onde)';
    case 'quando':
      return 'Palavra-chave (Quando)';
    default:
      return 'Palavra-chave';
  }
});

async function search() {
  try {
    const response = await axios.post('http://localhost:5000/objectapi/listar_objetos', {
      keyword: keyword.value,
      type: activeTab.value
    });

    //rows.value = response.data;
    // Mapear os resultados para um formato adequado para a q-table
    // Mapear os resultados para um formato adequado para a q-table
    rows.value = response.data.results.bindings.map(item => ({
      obj: { type: item.obj.type, value: item.obj.value },
      titulo: { type: item.titulo.type, value: item.titulo.value },
      resumo: { type: item.resumo.type, value: item.resumo.value },
      tipo: { type: item.tipo.type, value: item.tipo.value }
    }));
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

</script>

<style scoped>
.q-page {
  min-height: 80vh; /* Ajuste a altura mínima conforme necessário */
}
.q-card {
  width: 100%;
}
.q-table {
  height: calc(100vh - 150px); /* Ajuste a altura da tabela conforme necessário */
  background-color: white; /* Fundo branco para a tabela */
  color: black; /* Cor do texto preta */
}
.q-table th,
.q-table td {
  background-color: white; /* Fundo branco para as células */
  color: black; /* Cor do texto preta */
}
.q-table tbody tr:nth-child(odd) td {
  background-color: #f0f0f0; /* Cor de fundo para linhas ímpares */
}
.q-table tbody tr:nth-child(even) td {
  background-color: white; /* Cor de fundo para linhas pares */
}
</style>
