<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watchEffect, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import {
  mostrarPopUpAddRelacao,
  mostrarPopUpMidias,
  mostrarPopUpRelacoes,
  ObjetoFisico,
  Relacao,
  Tripla,
} from './manter-objeto';
import apiConfig from 'src/apiConfig';
import { Dialog, Notify } from 'quasar';
import { colunasDim, colunasRelacaoFis } from '../colecoes/funcoes-funcoes';
import { pesquisarRelacoes } from 'src/services/api-objeto-dim';
import { mapearPropriedade, textoAposUltimoChar } from '../funcoes';

const objetoId = ref({} as string); // Ajuste conforme necessário
const objetoStore = useDadosObjetoFisico();
const aba = ref<string>('fisicos');
const listaRelacoesDoObjeto = ref([] as Tripla[]);
const labelTipo = computed(() => {
  switch (aba.value) {
    case 'fisicos':
      return 'Palavra-chave (Objetos físicos)';
    case 'dimensionais':
      return 'Palavra-chave (Objetos dimensionais)';
    default:
      return 'Palavra-chave';
  }
});

const objetoSelecionado = ref({} as ObjetoFisico);

const useFileUpload = ref([true] as any);
const thumbnails = ref([] as any);
const router = useRouter();
const mostrar_excluidos = ref(false);

async function buscarRelacoes() {
  objetoId.value = objetoStore.getObjeto.obj;
  objetoSelecionado.value = objetoStore.getObjeto;
  listaRelacoesDoObjeto.value = await pesquisarRelacoes(objetoId.value);
  console.log(listaRelacoesDoObjeto.value);
}
watchEffect(() => {
  if (mostrarPopUpRelacoes.value) {
    buscarRelacoes();
  }
});
onMounted(() => {
  //
});

onBeforeMount(() => {
  //
});
</script>

<template>
  <q-dialog v-model="mostrarPopUpRelacoes" class="q-pa-md scroll" persistent>
    <q-card style="width: 80vw; max-width: 90vw; max-height: 90vh">
      <q-toolbar>
        <q-toolbar-title>Gerenciar Relações</q-toolbar-title>
        <q-btn
          icon="close"
          label="fechar"
          @click="mostrarPopUpRelacoes = false"
          flat
        />
      </q-toolbar>
      <div>
        <q-card class="q-pa-md">
          <div class="row">
            <div class="col-6">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold">Título:</q-item-label>
                  <q-item-label>{{ objetoSelecionado.titulo }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-6">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold">Id:</q-item-label>
                  <q-item-label>{{ objetoSelecionado.id }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
          <q-card-section>
            <q-table
              title="Relações"
              :rows="listaRelacoesDoObjeto"
              :columns="colunasRelacaoFis"
              wrap-cells
            >
              <template v-slot:body-cell-#="{ rowIndex }">
                <q-td>{{ rowIndex + 1 }}</q-td>
              </template>
              <template v-slot:body-cell-acoes="props">
                <q-td>
                  <q-btn
                    v-if="props.row.propriedade_abreviada == 'onde'"
                    icon="place"
                    flat
                  ></q-btn>
                </q-td>
              </template>
            </q-table>
            <q-btn
              label="Adicionar Relação"
              color="primary"
              @click="mostrarPopUpAddRelacao = true"
            />
          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </q-dialog>
</template>
