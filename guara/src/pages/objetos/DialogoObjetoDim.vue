<script setup lang="ts">
import { ref, onBeforeMount, watchEffect } from 'vue';

import {
  ListaTipoDim,
  Dimensao,
  ObjetoDimensional,
  DimMapping,
  mostrarPopUpObjetoDim,
  ObjetoDigital,
  mostrarPopUpRelacoes,
} from './manter-objeto';
import {
  gravarObjetoDim,
  id_novo_objeto_dim_gravado,
  pesquisarObjetosDim,
} from 'src/services/api-objeto-dim';
import { useDadosObjetoFisico } from 'src/stores/objeto-fisico';
import { textoAposUltimoChar } from '../funcoes';
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
  coordenadas: '',
  lat: '',
  lon: '',
  fim: '',
  inicio: '',
});
watchEffect(() => {
  if (mostrarPopUpObjetoDim.value) {
    carregar();
  }
});
function carregar() {
  if (objeto.value.id != '') {
    console.log('passou aqui');
    return;
  }
  if (useObjetoStore.getObjetoDim.id) {
    objeto.value = { ...useObjetoStore.getObjetoDim };
    tipoSelecionado.value = DimMapping(
      textoAposUltimoChar(objeto.value.tipo, '#')
    );
  }
}

function gravar() {
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
  useObjetoStore.setObjeto(objeto);
  mostrarPopUpRelacoes.value = true;
}
function novo() {
  objeto.value.titulo = '';
  objeto.value.descricao = '';
  objeto.value.resumo = '';
  objeto.value.id = '';
}
onBeforeMount(() => {
  console.log('montando');
});
</script>

<template>
  <q-dialog v-model="mostrarPopUpObjetoDim" class="q-pa-md scroll" persistent>
    <q-card
      style="width: 90vw; height: 90vw; max-width: 90vw; max-height: 90vh"
    >
      <q-toolbar>
        <q-toolbar-title v-if="!objeto.id || objeto.id == ''"
          >Criar {{ tipoSelecionado.tipo }}
        </q-toolbar-title>
        <q-toolbar-title v-else
          >{{ tipoSelecionado.tipo }} - {{ objeto.titulo }}
        </q-toolbar-title>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <q-card-section>
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
          title="Uma descrição pormenorizada do evento com local,
          marcos históricos, fatos e figuras importantes etc"
        />
        <q-input
          v-model="objeto.resumo"
          label="Resumo"
          outlined
          title="uma versão resumida para o usuário ter uma visão geral"
          autogrow
        />
        <q-input
          v-if="tipoSelecionado.tipo.toLowerCase() == 'lugar'"
          v-model="objeto.coordenadas"
          label="Coordenadas (latitude,longitude)"
          outlined
          title="uma versão resumida para o usuário ter uma visão geral"
        >
          <template v-slot:append>
            <q-btn icon="pin_drop" @click="irParaMapa" flat size="smaller" />
          </template>
        </q-input>
        <q-input
          v-if="tipoSelecionado.tipo.toLowerCase() == 'evento'"
          v-model="objeto.inicio"
          label="Data de Início"
          outlined
          title="uma data inicial ou um período inicial aproximado"
        />
        <q-input
          v-if="tipoSelecionado.tipo.toLowerCase() == 'evento'"
          v-model="objeto.fim"
          label="Data de Encerramento"
          outlined
          title="uma data inicial ou um período final aproximado"
        />
      </q-card-section>

      <q-card-actions>
        <q-btn-group flat push>
          <q-btn @click="gravar" label="Salvar Objeto" color="green-8" />
          <q-btn @click="novo" label="Novo objeto" color="blue-8" />
          <q-btn
            @click="irParaRelacoes"
            label="Adicionar relações"
            color="orange-8"
            v-if="objeto.id && objeto.id != ''"
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
