<script setup lang="ts">
import { ref, onBeforeMount, watchEffect } from 'vue';

import {
  ListaTipoDim,
  Dimensao,
  ObjetoDimensional,
  DimMapping,
  mostrarPopUpObjetoDim,
} from './manter-objeto';
import { gravarObjetoDim } from 'src/services/api-objeto-dim';
import { useDadosObjetoFisico } from 'src/stores/objeto-fisico';
const useObjetoStore = useDadosObjetoFisico();
const listaDim = ListaTipoDim();
const tipoSelecionado = ref(DimMapping('pessoa') as Dimensao);
const objeto = ref<ObjetoDimensional>({
  id: '',
  obj: '',
  resumo: '',
  associatedMedia: [],
  assunto: '',
  dataCriacao: '',
  dataModificacao: '',
  descricao: '',
  onde: [],
  oque: [],
  quando: [],
  quem: [],
  repositorio: '',
  temRelacao: [],
  tipo: { tipo: '', uri: '' },
  titulo: '',
});
watchEffect(() => {
  if (mostrarPopUpObjetoDim.value) {
    carregar();
  }
});
function carregar() {
  if (useObjetoStore.getObjetoDim.id) {
    objeto.value = { ...useObjetoStore.getObjetoDim };
  }
}

function gravar() {
  objeto.value.tipo = tipoSelecionado.value;
  gravarObjetoDim(objeto.value);
}

onBeforeMount(() => {
  //fazer algo
});
</script>

<template>
  <q-dialog v-model="mostrarPopUpObjetoDim" class="q-pa-md scroll" persistent>
    <q-card style="width: 80vw; max-width: 90vw; max-height: 90vh">
      <q-toolbar>
        <q-toolbar-title>Criar {{ tipoSelecionado.tipo }}</q-toolbar-title>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <q-card-section>
        <div class="q-gutter-x-md">
          <label>Tipo de Objeto</label>
          <q-select
            v-model="tipoSelecionado"
            outlined
            :options="listaDim"
            option-label="tipo"
            label="tipo"
            fill-input
            clearable
          ></q-select>
        </div>

        <q-input
          v-model="objeto.titulo"
          outlined
          label="Título/nome do objeto"
        />
        <q-input
          v-model="objeto.descricao"
          label="Descrição"
          autogrow
          outlined
          title="uma descrição sucinta do objeto digital"
        />
        <q-input
          v-model="objeto.resumo"
          label="Resumo"
          outlined
          title="um resumo com detalhes e informações importantes sobre o objeto"
          autogrow
        />
      </q-card-section>

      <q-card-actions>
        <q-btn-group flat push>
          <q-btn @click="gravar" label="Salvar Objeto" color="green-8" />
          <q-btn
            label="Voltar"
            @click="mostrarPopUpObjetoDim = false"
            color="secondary"
            outlined
          />
        </q-btn-group>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
