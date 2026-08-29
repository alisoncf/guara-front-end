<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import {
  Dimensao,
  ListaTipoDim,
  mostrarPopUpGrafoRelacoes,
  mostrarPopUpMidias,
  mostrarPopUpObjetoDim,
  mostrarPopUpObjetoFis,
  mostrarPopUpRelacoes,
  ObjetoDimensional,
  objetoDimensionalVazio,
  ObjetoFisico,
  somenteLeituraObjeto,
  usuarioAdminLogado,
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
import { textoAposUltimoChar, truncarTexto } from '../funcoes';
import DialogoObjetoFis from '../objetos/DialogoObjetoFis.vue';
import ComponenteMidia from '../objetos/ComponenteMidia.vue';
import ComponenteRelacao from '../objetos/ComponenteRelacao.vue';
import ComponenteAddRelacao from '../objetos/ComponenteAddRelacao.vue';
import ComponenteGrafoRelacoes from '../objetos/ComponenteGrafoRelacoes.vue';

const router = useRouter();

const useObjetoStore = useDadosObjetoFisico();
const keyword = ref(useObjetoStore.getKeyword); // Carrega a última pesquisa
const listaObj = ref(useObjetoStore.getLista); // Mantém a lista carregada
const listaObjDim = ref(useObjetoStore.getListaDim); // Mantém a lista carregada

const listaDimensoes = ListaTipoDim();
const dimensoesSelecionadas = ref<Dimensao[]>([...listaDimensoes]);

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
function dimensaoSelecionada(dim: Dimensao) {
  return dimensoesSelecionadas.value.some((d) => d.tipo === dim.tipo);
}
function alternarDimensao(dim: Dimensao) {
  if (dimensaoSelecionada(dim)) {
    dimensoesSelecionadas.value = dimensoesSelecionadas.value.filter(
      (d) => d.tipo !== dim.tipo
    );
  } else {
    dimensoesSelecionadas.value.push(dim);
  }
  pesquisarDim();
}
async function pesquisarDim() {
  let resultado: ObjetoDimensional[] = [];
  if (dimensoesSelecionadas.value.length !== 0) {
    if (dimensoesSelecionadas.value.length === listaDimensoes.length) {
      const obj = ref({} as ObjetoDimensional);
      obj.value.descricao = keyword.value;
      resultado = await pesquisarObjetosDim(obj.value);
    } else {
      const resultados = await Promise.all(
        dimensoesSelecionadas.value.map((dim) => {
          const obj = ref({} as ObjetoDimensional);
          obj.value.descricao = keyword.value;
          obj.value.tipo = dim;
          return pesquisarObjetosDim(obj.value);
        })
      );
      resultado = resultados.flat();
    }
  }
  listaObjDim.value = resultado;
  useObjetoStore.setListaDim(resultado); // Salva no store
  useObjetoStore.setKeyword(keyword.value); // Salva a palavra-chave
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
  useObjetoStore.limparObjeto;
  useObjetoStore.setObjeto(obj);
  somenteLeituraObjeto.value = false;
  mostrarPopUpObjetoFis.value = true;
}
function irParaNovoDim() {
  const objVazio = objetoDimensionalVazio();
  useObjetoStore.setObjetoDim(objVazio);
  useObjetoStore.setObjeto(objVazio);
  somenteLeituraObjeto.value = false;
  mostrarPopUpObjetoDim.value = true;
}

function abrirObjeto(obj: ObjetoFisico, somenteLeitura: boolean) {
  somenteLeituraObjeto.value = somenteLeitura;
  if (aba.value == 'fisicos') {
    useObjetoStore.setObjeto(obj);
    mostrarPopUpObjetoFis.value = true;
  } else {
    useObjetoStore.setObjetoDim(obj);
    useObjetoStore.setObjeto(obj);
    mostrarPopUpObjetoDim.value = true;
  }
}
function irParaEditar(obj: ObjetoFisico) {
  abrirObjeto(obj, false);
}
function irParaVisualizar(obj: ObjetoFisico) {
  abrirObjeto(obj, true);
}

function deletarObjeto(obj: ObjetoFisico) {
  deletarObjetoFisico(obj);
  pesquisarFis();
}
function irParaMidias(obj: ObjetoFisico) {
  useObjetoStore.setObjeto(obj);

  mostrarPopUpMidias.value = true;
}
function irParaRelacoes(obj: ObjetoFisico) {
  useObjetoStore.setObjeto(obj);
  mostrarPopUpRelacoes.value = true;
}
function irParaGrafo(obj: ObjetoFisico) {
  useObjetoStore.setObjeto(obj);
  mostrarPopUpGrafoRelacoes.value = true;
}
function Upload(id: string) {
  router.push('upload-midias/:' + id);
}

// Recarrega a lista automaticamente ao trocar de aba, sem precisar clicar em "Pesquisar"
watch(aba, () => {
  buscar();
});
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
              :option-label="labelTipo"
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

        <div v-if="aba == 'dimensionais'" class="q-mb-md">
          <div class="text-caption text-grey-8 q-mb-xs">
            Filtrar por dimensão
          </div>
          <q-chip
            v-for="dim in listaDimensoes"
            :key="dim.tipo"
            clickable
            :outline="!dimensaoSelecionada(dim)"
            :color="dimensaoSelecionada(dim) ? 'teal' : 'grey-6'"
            :text-color="dimensaoSelecionada(dim) ? 'white' : 'grey-8'"
            :icon="dimensaoSelecionada(dim) ? 'check' : undefined"
            @click="alternarDimensao(dim)"
          >
            {{ dim.tipo }}
          </q-chip>
        </div>

        <q-table
          v-if="aba == 'fisicos'"
          :rows="listaObj"
          :columns="colunasFisico"
          row-key="id"
          striped
          title="Objetos físicos do Acervo"
          wrap-cells
          class="tabela-clicavel"
          @row-click="(evt, row) => irParaVisualizar(row)"
        >
          <template v-slot:body-cell-#="{ rowIndex }">
            <q-td>{{ rowIndex + 1 }}</q-td>
          </template>
          <template v-slot:body-cell-id="props">
            <q-td style="font-size: 10px">{{ props.row.id }}</q-td>
          </template>
          <template v-slot:body-cell-acoes="props">
            <q-td :props="props" @click.stop>
              <q-btn dense flat icon="more_vert">
                <q-menu fit dense>
                  <q-list dense style="min-width: 100px">
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaVisualizar(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="visibility" />
                      </q-item-section>
                      <q-item-section>Visualizar</q-item-section>
                    </q-item>
                    <q-item
                      v-if="usuarioAdminLogado"
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
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaRelacoes(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="hub" />
                      </q-item-section>
                      <q-item-section>Relações</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaGrafo(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="account_tree" />
                      </q-item-section>
                      <q-item-section>Grafo</q-item-section>
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
          class="tabela-clicavel"
          @row-click="(evt, row) => irParaVisualizar(row)"
        >
          <template v-slot:body-cell-#="{ rowIndex }">
            <q-td>{{ rowIndex + 1 }}</q-td>
          </template>
          <template v-slot:body-cell-id="props">
            <q-td style="font-size: 10px">{{ props.row.id }}</q-td>
          </template>
          <template v-slot:body-cell-resumo="props">
            <q-td>{{ truncarTexto(props.row.resumo, 150) }}</q-td>
          </template>
          <template v-slot:body-cell-dimensao="props">
            <q-td :props="props">{{
              textoAposUltimoChar(props.row.dimensao, '#')
            }}</q-td>
          </template>
          <template v-slot:body-cell-acoes="props">
            <q-td :props="props" @click.stop>
              <q-btn dense flat icon="more_vert">
                <q-menu fit dense>
                  <q-list dense style="min-width: 100px">
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaVisualizar(props.row)"
                    >
                      <q-item-section avatar>
                        <q-avatar icon="visibility" />
                      </q-item-section>
                      <q-item-section>Visualizar</q-item-section>
                    </q-item>
                    <q-item
                      v-if="usuarioAdminLogado"
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
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaRelacoes(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="hub" />
                      </q-item-section>
                      <q-item-section>Relações</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="irParaGrafo(props.row)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="account_tree" />
                      </q-item-section>
                      <q-item-section>Grafo</q-item-section>
                    </q-item>
                    <q-item
                      v-if="1 > 1"
                      clickable
                      v-close-popup
                      @click="Upload(props.row.id)"
                    >
                      <q-item-section avatar flat>
                        <q-avatar icon="upload" />
                      </q-item-section>
                      <q-item-section>Upload</q-item-section>
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
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-card-section>
        <q-btn-group flat push>
          <q-btn
            v-if="aba == 'fisicos' && usuarioAdminLogado"
            @click="irParaNovo"
            color="primary"
            label="Criar Objeto Físico"
          />
          <q-btn
            v-if="aba == 'dimensionais' && usuarioAdminLogado"
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

      <ComponenteMidia />
      <ComponenteRelacao />
      <ComponenteAddRelacao />
      <ComponenteGrafoRelacoes />
    </template>
  </div>
</template>

<style scoped>
.tabela-clicavel :deep(tbody tr) {
  cursor: pointer;
}
.tabela-clicavel :deep(tbody tr:hover) {
  background: rgba(0, 150, 136, 0.06);
}
</style>
