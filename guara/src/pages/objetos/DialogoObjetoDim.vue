<script setup lang="ts">
import { ref, onBeforeMount, watchEffect } from 'vue';

import {
  ListaTipoDim,
  Dimensao,
  dimensaoFiltroInicialRelacoes,
  ObjetoDimensional,
  objetoDimensionalVazio,
  DimMapping,
  mostrarPopUpObjetoDim,
  mostrarPopUpRelacoes,
  somenteLeituraObjeto,
  usuarioAdminLogado,
} from './manter-objeto';
import {
  gravarObjetoDim,
  id_novo_objeto_dim_gravado,

} from 'src/services/api-objeto-dim';
import { useDadosObjetoFisico } from 'src/stores/objeto-fisico';
import { textoAposUltimoChar } from '../funcoes';
const useObjetoStore = useDadosObjetoFisico();
const listaDim = ListaTipoDim();
const tipoSelecionado = ref(DimMapping('pessoa') as Dimensao);
const abaObjeto = ref<'basicos' | 'outros'>('basicos');
const objeto = ref<ObjetoDimensional>(objetoDimensionalVazio());
watchEffect(() => {
  if (mostrarPopUpObjetoDim.value) {
    abaObjeto.value = 'basicos';
    carregar();
  }
});
function carregar() {
  const idNoStore = useObjetoStore.getObjetoDim.id || '';
  if (objeto.value.id === idNoStore) {
    return;
  }
  if (idNoStore) {
    objeto.value = { ...useObjetoStore.getObjetoDim };
    tipoSelecionado.value = DimMapping(
      textoAposUltimoChar(objeto.value.tipo, '#')
    );
  } else {
    objeto.value = objetoDimensionalVazio();
    tipoSelecionado.value = DimMapping('pessoa');
  }
}

function liberarEdicao() {
  somenteLeituraObjeto.value = false;
}
function gravar() {
  if (somenteLeituraObjeto.value) {
    return;
  }
  objeto.value.tipo = tipoSelecionado.value;
  gravarObjetoDim(objeto.value);

  if (objeto.value.id == '') {
    objeto.value.id = id_novo_objeto_dim_gravado.value;
    useObjetoStore.setObjetoDim(objeto);
  } else {
  }
}
function irParaMapa() {
  const coordenadas = objeto.value.coordenadas; // Ex: "-16.6809,-49.2534"
  if (coordenadas) {
    const url = `https://www.google.com/maps?q=${encodeURIComponent(
      coordenadas
    )}`;
    window.open(url, '_blank');
  } else {
    console.warn('Coordenadas não encontradas');
  }
}
function irParaRelacoes() {
  if (somenteLeituraObjeto.value) {
    return;
  }
  useObjetoStore.setObjeto(objeto);
  mostrarPopUpRelacoes.value = true;
}
function novo() {
  if (somenteLeituraObjeto.value) {
    return;
  }
  objeto.value.titulo = '';
  objeto.value.descricao = '';
  objeto.value.resumo = '';
  objeto.value.id = '';
}
function iconeDimensao(tipo: string): string {
  switch (tipo.toLowerCase()) {
    case 'pessoa':
      return 'person';
    case 'lugar':
      return 'place';
    case 'evento':
      return 'event';
    case 'tempo':
      return 'schedule';
    default:
      return 'category';
  }
}
function irParaRelacaoDimensao(dim: Dimensao) {
  dimensaoFiltroInicialRelacoes.value = dim;
  useObjetoStore.setObjeto(objeto.value);
  mostrarPopUpRelacoes.value = true;
}
onBeforeMount(() => {
  console.log('montando');
});
</script>

<template>
  <q-dialog v-model="mostrarPopUpObjetoDim" class="q-pa-md scroll" persistent>
    <q-card class="dialogo-objeto-dim">
      <q-toolbar>
        <q-toolbar-title v-if="!objeto.id || objeto.id == ''"
          >Criar {{ tipoSelecionado.tipo }}
        </q-toolbar-title>
        <q-toolbar-title v-else
          >{{ tipoSelecionado.tipo }} - {{ objeto.titulo }}
        </q-toolbar-title>
        <q-badge
          v-if="somenteLeituraObjeto"
          color="grey-7"
          label="Somente visualização"
          class="q-mr-md"
        />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <div class="dialogo-objeto-dim-corpo">
      <q-card-section class="dialogo-objeto-dim-conteudo">
        <q-tabs
          v-model="abaObjeto"
          class="text-teal"
          align="justify"
          active-color="teal"
          indicator-color="teal"
          dense
        >
          <q-tab name="basicos" label="Dados básicos" />
          <q-tab name="outros" label="Outros dados" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="abaObjeto" animated>
          <q-tab-panel name="basicos">
            <div class="q-gutter-x-md">
              <label>Dimensão/Tipo</label>
              <q-select
                v-model="tipoSelecionado"
                outlined
                :options="listaDim"
                option-label="tipo"
                label="tipo"
                fill-input
                clearable
                :disable="somenteLeituraObjeto"
              ></q-select>
            </div>

            <q-input
              v-model="objeto.titulo"
              outlined
              label="Título/nome do objeto"
              :readonly="somenteLeituraObjeto"
            />
            <q-input
              v-model="objeto.descricao"
              label="Descrição"
              autogrow
              outlined
              title="Uma descrição pormenorizada do evento com local,
          marcos históricos, fatos e figuras importantes etc"
              :readonly="somenteLeituraObjeto"
            />
            <q-input
              v-model="objeto.resumo"
              label="Resumo"
              outlined
              title="uma versão resumida para o usuário ter uma visão geral"
              autogrow
              :readonly="somenteLeituraObjeto"
            />
            <q-input
              v-if="tipoSelecionado.tipo.toLowerCase() == 'lugar'"
              v-model="objeto.coordenadas"
              label="Coordenadas (latitude,longitude)"
              outlined
              title="uma versão resumida para o usuário ter uma visão geral"
              :readonly="somenteLeituraObjeto"
            >
              <template v-slot:append>
                <q-btn
                  icon="pin_drop"
                  @click="irParaMapa"
                  flat
                  size="smaller"
                />
              </template>
            </q-input>
            <q-input
              v-if="tipoSelecionado.tipo.toLowerCase() == 'evento'"
              v-model="objeto.inicio"
              label="Data de Início"
              outlined
              title="uma data inicial ou um período inicial aproximado"
              :readonly="somenteLeituraObjeto"
            />
            <q-input
              v-if="tipoSelecionado.tipo.toLowerCase() == 'evento'"
              v-model="objeto.fim"
              label="Data de Encerramento"
              outlined
              title="uma data inicial ou um período final aproximado"
              :readonly="somenteLeituraObjeto"
            />
          </q-tab-panel>
          <q-tab-panel name="outros">
            <div class="text-grey-7 q-pa-md text-center">
              Nenhum dado de vocabulário disponível ainda.
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <div class="dialogo-objeto-dim-lateral">
        <q-btn
          v-for="dim in listaDim"
          :key="dim.tipo"
          round
          flat
          color="grey-8"
          :icon="iconeDimensao(dim.tipo)"
          :disable="!objeto.id || objeto.id == ''"
          @click="irParaRelacaoDimensao(dim)"
        >
          <q-tooltip>
            {{
              !objeto.id || objeto.id == ''
                ? 'Salve o objeto para ver relações'
                : 'Relações de ' + dim.tipo
            }}
          </q-tooltip>
        </q-btn>
      </div>
      </div>

      <q-card-actions class="botoes-fixos">
        <q-btn-group flat push>
          <q-btn
            @click="gravar"
            label="Salvar Objeto"
            color="green-8"
            v-if="!somenteLeituraObjeto"
          />
          <q-btn
            @click="novo"
            label="Novo objeto"
            color="blue-8"
            v-if="!somenteLeituraObjeto"
          />
          <q-btn
            @click="irParaRelacoes"
            label="Adicionar relações"
            color="orange-8"
            v-if="objeto.id && objeto.id != '' && !somenteLeituraObjeto"
          />
          <q-btn
            @click="liberarEdicao"
            label="Editar"
            color="orange-8"
            v-if="
              objeto.id && objeto.id != '' && somenteLeituraObjeto && usuarioAdminLogado
            "
          />

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

<style scoped>
.dialogo-objeto-dim {
  width: 90vw;
  max-width: 90vw;
  height: 85vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.dialogo-objeto-dim-corpo {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: row;
}
.dialogo-objeto-dim-conteudo {
  flex: 1 1 auto;
  min-width: 0;
  overflow-y: auto;
}
.dialogo-objeto-dim-lateral {
  flex: 0 0 auto;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 8px;
  border-left: 1px solid #e0e0e0;
  background: #fafafa;
}
.botoes-fixos {
  flex: 0 0 auto;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}
</style>
