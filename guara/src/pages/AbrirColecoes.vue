<template>
  <q-page class="flex flex-center">
    <q-card class="max-w-md">
      <q-card-section>
        <q-input
          outlined
          dense
          v-model="keyword"
          label="Palavra-chave"
          @keyup.enter="search"
        />
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const keyword = ref('');
const rows = ref([]);
const columns = [
  { name: 'subject', label: 'Sujeito' },
  { name: 'predicate', label: 'Predicado' },
  { name: 'object', label: 'Objeto' }
];

function search() {
  // Aqui você pode fazer a consulta ao banco de dados em grafos
  // com base na palavra-chave inserida na caixa de texto "keyword"
  // e atualizar os dados da tabela "rows" com os resultados da consulta
  // Por enquanto, vamos apenas simular alguns resultados
  rows.value = [
    { id: 1, subject: 'Sujeito 1', predicate: 'Predicado 1', object: 'Objeto 1' },
    { id: 2, subject: 'Sujeito 2', predicate: 'Predicado 2', object: 'Objeto 2' },
    { id: 3, subject: 'Sujeito 3', predicate: 'Predicado 3', object: 'Objeto 3' }
  ];
}
</script>
