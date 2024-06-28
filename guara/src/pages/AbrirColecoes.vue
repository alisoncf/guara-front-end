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
        <q-tab name="fisicos" label="Físicos" />
        <q-tab name="dimensionais" label="Dimensionais" />
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
          :rows="listaObj"
          :columns="columns"
          row-key="id"
          class="full-height"
          striped
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import type { ObjetoFisico } from './tipos'; // Certifique-se de que esta importação está correta
import { Coluna } from './tipos';

const keyword = ref<string>('');

const listaObj = ref<ObjetoFisico[]>([]);

const activeTab = ref<string>('fisicos');
const columns = [
  { name: 'objeto', label: 'Objeto',  align: 'left',    field: 'id'  },
    { name: 'titulo',   label: 'Título', align: 'left',  field: 'titulo' },
  { name: 'tipo', label: 'Tipo', align: 'left',   field: 'tipo_id' },
  { name: 'resumo', label: 'Resumo', align: 'left',  field: 'resumo' }
] as Coluna[];

const activeTabLabel = computed(() => {
  switch (activeTab.value) {
    case 'fisicos':
      return 'Palavra-chave (Objetos físicos)';
    case 'dimensionais':
      return 'Palavra-chave (Objetos dimensionais)';
    default:
      return 'Palavra-chave';
  }
});

async function search() {
  try {
    const response =
    await axios.post('http://localhost:5000/objectapi/listar_objetos', {
      keyword: keyword.value,
      type: activeTab.value
    });

    listaObj.value = response.data.results.bindings.map((item: any) => ({
      obj: item.obj.value,
      titulo: item.titulo.value,
      resumo: item.resumo.value,
      tipo: item.tipo.value,
      id: textoAposUltimoChar(item.obj.value,'/'),
      tipo_id: textoAposUltimoChar(item.tipo.value,'#')
    })) as ObjetoFisico[];

    console.log(listaObj.value);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

function textoAposUltimoChar(texto: string, char: string) {
    const ultimaBarraIndex = texto.lastIndexOf(char);
    if (ultimaBarraIndex === -1) {
        return texto;
    }
    return texto.substring(ultimaBarraIndex + 1);
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
.body-2 {
  font-size: 14px !important; /* Tamanho da fonte menor */
}
</style>
