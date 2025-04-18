<script setup lang="ts">
import { ref, computed } from 'vue';

import {
  mostrarPopUpObjetoDim,
  mostrarPopUpObjetoFis,
  ObjetoDimensional,
  ObjetoFisico,
} from '../objetos/manter-objeto';

import { useRouter } from 'vue-router';
import { useDadosObjetoFisico } from '../../stores/objeto-fisico';
import { pesquisarObjetosDim } from 'src/services/api-objeto-dim';
import {
  deletarObjetoFisico,
  pesquisarObjetosFisicos,
} from 'src/services/objeto-fisico-api';
import { colunasDim, colunasFisico } from './funcoes-funcoes';
import DialogoObjetoDim from '../objetos/DialogoObjetoDim.vue';
import { textoAposUltimoChar } from '../funcoes';
import DialogoObjetoFis from '../objetos/DialogoObjetoFis.vue';

const router = useRouter();

const useObjetoStore = useDadosObjetoFisico();
const keyword = ref(useObjetoStore.getKeyword); // Carrega a última pesquisa
const listaObj = ref(useObjetoStore.getLista); // Mantém a lista carregada
const listaObjDim = ref([] as ObjetoDimensional[]);

const aba = ref<string>('fisicos');

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
function buscar() {
  aba.value == 'fisicos' ? pesquisarFis() : pesquisarDim();
}
async function pesquisarDim() {
  const obj = ref({} as ObjetoDimensional);
  obj.value.descricao = keyword.value;
  listaObjDim.value = await pesquisarObjetosDim(obj.value);
  console.log(listaObjDim.value);
}

async function pesquisarFis() {
  const obj = ref({} as ObjetoFisico);
  obj.value.descricao = keyword.value;
  listaObj.value = await pesquisarObjetosFisicos(obj.value);
  useObjetoStore.setLista(listaObj); // Salva no store
  useObjetoStore.setKeyword(keyword.value); // Salva a palavra-chave
}

function irParaNovo() {
  const obj = ref({ id: '', titulo: '' } as ObjetoFisico);
  useObjetoStore.setObjeto(obj);
  mostrarPopUpObjetoFis.value = true;
}
function irParaNovoDim() {
  const obj = ref({ id: '', titulo: '' } as ObjetoFisico);
  useObjetoStore.setObjeto(obj);
  //  router.push('/criar-objeto-dim');
  mostrarPopUpObjetoDim.value = true;
}

function irParaEditar(obj: ObjetoFisico) {
  if (aba.value == 'fisicos') {
    useObjetoStore.setObjeto(obj);
    mostrarPopUpObjetoFis.value = true;
  } else {
    useObjetoStore.setObjetoDim(obj);

    mostrarPopUpObjetoDim.value = true;
  }
}

function deletarObjeto(obj: ObjetoFisico) {
  deletarObjetoFisico(obj);
  pesquisarFis();
}
function irParaMidias(obj: ObjetoFisico) {
  useObjetoStore.setObjeto(obj);
  router.push(`/objetos/${obj.id}/midias`);
}
function Upload(id: string) {
  router.push('upload-midias/:' + id);
}
</script>

<template>
  <div class="q-pa-sm">
    <q-tabs
      v-model="aba"
      class="text-teal"
      align="justify"
      active-color="teal"
      indicator-color="teal"
    >
      <q-tab name="fisicos" label="Físicos" />
      <q-tab name="dimensionais" label="Dimensionais" />
    </q-tabs>
    <q-card>
      <q-card-section>
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-xs-6 col-md-6 col-lg-8">
            <q-input
              outlined
              dense
              v-model="keyword"
              :label="labelTipo"
              @keyup.enter="buscar()"
            />
          </div>
          <div class="col-xs-6 col-md-6 col-lg-4">
            <q-btn
              @click="buscar"
              color="teal"
              label="Pesquisar"
              icon="search"
              class="q-ml-md"
            />
          </div>
        </div>

        <q-table
          v-if="aba == 'fisicos'"
          :rows="listaObj"
          :columns="colunasFisico"
          row-key="id"
          striped
          title="Objetos físicos do Acervo"
          wrap-cells
        >
          <template v-slot:body-cell-#="{ rowIndex }">
            <q-td>{{ rowIndex + 1 }}</q-td>
          </template>

          <template v-slot:body-cell-acoes="props">
            <q-td :props="props">
              <q-btn dense flat icon="more_vert">
                <q-menu fit dense>
                  <q-list dense style="min-width: 100px">
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaEditar(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="edit" />
                      </q-item-section>
                      <q-item-section>Editar</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaMidias(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="photo" />
                      </q-item-section>
                      <q-item-section>Mídias</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      clickable
                      v-close-popup
                      @click="deletarObjeto(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="delete_forever" color="red-7" />
                      </q-item-section>
                      <q-item-section>Excluir</q-item-section>
                    </q-item>
                  </q-list></q-menu
                >
              </q-btn>
            </q-td>
          </template>
        </q-table>
        <q-table
          v-if="aba == 'dimensionais'"
          :rows="listaObjDim"
          :columns="colunasDim"
          row-key="id"
          striped
          title="Objetos dimensionais do Acervo"
          wrap-cells
        >
          <template v-slot:body-cell-#="{ rowIndex }">
            <q-td>{{ rowIndex + 1 }}</q-td>
          </template>
          <template v-slot:body-cell-dimensao="props">
            <q-td :props="props">{{
              textoAposUltimoChar(props.row.dimensao, '#')
            }}</q-td>
          </template>
          <template v-slot:body-cell-acoes="props">
            <q-td :props="props">
              <q-btn
                dense
                color="blue-9"
                icon="edit"
                title="Editar o objeto digital"
                @click="irParaEditar(props.row)"
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
                title="excluir definitivamente este objeto"
                @click="deletarObjeto(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-card-section>
        <q-btn-group flat push>
          <q-btn
            v-if="aba == 'fisicos'"
            @click="irParaNovo"
            color="primary"
            label="Criar Objeto Físico"
          />
          <q-btn
            v-if="aba == 'dimensionais'"
            @click="irParaNovoDim"
            color="green-8"
            label="Criar Objeto Dimensional"
          />
          <q-btn @click="router.go(-1)" label="Voltar" color="secondary" />
        </q-btn-group>
      </q-card-section>
    </q-card>

    <template>
      <DialogoObjetoDim />
      <DialogoObjetoFis />
    </template>
  </div>
</template>
