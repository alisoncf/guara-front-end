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
        <q-btn @click="irParaNovo" color="primary" label="Criar novo objeto" />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          :rows="listaObj"
          :columns="columns"
          row-key="id"

          striped
          title="Objetos digitais do Acervo">
          <template v-slot:body-cell-#="{ rowIndex }">
            <q-td>{{ rowIndex + 1 }}</q-td>
          </template>

          <template v-slot:body-cell-acoes="props">
            <q-td :props="props" >
              <q-btn dense color="blue-9" icon="edit"  title="alterar a classe"/>
              <q-btn dense color="purple-6 "
              icon="format_list_bulleted"  title="ir para as mídias deste objeto" />
              <q-btn dense color="red-7" icon="delete"  title="excluir definitivamente essa classe" />
            </q-td>
          </template>
        </q-table>

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
  { name: '#', label: 'Objeto',  align: 'left' },
  { name: 'titulo',   label: 'Título', align: 'left',  field: 'titulo' },
  { name: 'tipo', label: 'Tipo', align: 'left',   field: 'tipo_id' },
  { name: 'resumo', label: 'Resumo', align: 'left',  field: 'resumo' },
  { name: 'acoes', label: 'Ações', align: 'center' }
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
function irParaNovo() {
  console.log('novo')
}
</script>
<style src="./Estilo.css"></style>
