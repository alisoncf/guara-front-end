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
  { name: 'subject', label: 'Sujeito', align: 'left', field: row => row.subject },
  { name: 'predicate', label: 'Predicado', align: 'left', field: row => row.predicate },
  { name: 'object', label: 'Objeto', align: 'left', field: row => row.object }
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
    const response = await axios.get(`http://localhost:5000/search`, {
      params: {
        keyword: keyword.value,
        type: activeTab.value
      }
    });
    rows.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
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
