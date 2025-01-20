<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import axios from 'axios';
import { ObjetoFisico } from './objetos/manter-objeto';
import { Coluna } from './tipos';
import { useRouter } from 'vue-router';
import { useDadosObjetoFisico } from '../stores/objeto-fisico';
import { pesquisarObjetosFisicos } from 'src/services/api';

const router = useRouter();

const keyword = ref<string>('');

const listaObj = ref([] as ObjetoFisico[]);
const useObjetoStore = useDadosObjetoFisico();

const activeTab = ref<string>('fisicos');
const columns = [
  { name: '#', label: 'Objeto', align: 'left' },
  { name: 'titulo', label: 'Título', align: 'left', field: 'titulo' },
  { name: 'tipo de coleção', label: 'Tipo', align: 'left', field: row => row.tipoFisicoAbreviado.join(", ") },
  { name: 'resumo', label: 'Resumo', align: 'left', field: 'resumo' },
  { name: 'acoes', label: 'Ações', align: 'center' },
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
  const obj = ref({} as ObjetoFisico);
  obj.value.descricao=keyword.value;
  listaObj.value = await pesquisarObjetosFisicos(obj.value);
}



function irParaNovo() {
  router.push('/criar-objeto');
}
function irParaMidias(obj: ObjetoFisico) {
  useObjetoStore.set(obj);
  router.push(`/objetos/${obj.id}/midias`);
}
function Upload(id: string) {
  router.push('upload-midias/:' + id);
}
</script>

<template>
  <q-page class="flex flex-top q-pa-md q-my-lg">
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
        <q-btn
          @click="search"
          color="teal"
          label="Pesquisar"
          icon="search"
          class="q-ml-md"
        />
        <q-btn @click="irParaNovo" color="primary" label="Criar novo objeto" />
      </q-card-section>

      <q-card-section >
        <q-table
          :rows="listaObj"
          :columns="columns"
          row-key="id"
          striped
          title="Objetos digitais do Acervo"
          class="tabela-classes"
        >
          <template v-slot:body-cell-#="{ rowIndex }">
            <q-td>{{ rowIndex + 1 }}</q-td>
          </template>

          <template v-slot:body-cell-acoes="props">
            <q-td :props="props">
              <q-btn
                dense
                color="blue-9"
                icon="edit"
                title="alterar a classe"
              />
              <q-btn
                dense
                color="purple-6 "
                icon="format_list_bulleted"
                title="ir para as mídias deste objeto"
                @click="irParaMidias(props.row)"
              />
              <q-btn
                v-if="1 > 1"
                dense
                color="red-6 "
                icon="edit"
                title="ir para as mídias deste objeto"
                @click="Upload(props.row.id)"
              />
              <q-btn
                dense
                color="red-7"
                icon="delete"
                title="excluir definitivamente essa classe"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

