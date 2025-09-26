<template>
  <div v-if="object" class="row q-col-gutter-xl">
    <div class="col-12">
      <h1 class="text-h4 text-weight-bold">
        {{ object.titulo }}
      </h1>
      <p v-if="object.resumo" class="text-subtitle1 text-grey-7">
        {{ object.resumo }}
      </p>

      <q-separator class="q-my-lg" />

      <div v-if="object.descricao" class="q-mt-lg">
        <h5 class="text-h5 text-weight-medium">Descrição</h5>
        <p class="text-body1 q-mt-sm" style="text-align: justify">
          {{ object.descricao }}
        </p>
      </div>

      <div class="q-mt-xl">
        <h5 class="text-h5 text-weight-medium">Detalhes</h5>
        <q-list bordered separator class="q-mt-sm rounded-borders">
          <q-item v-if="object.colecao">
            <q-item-section>
              <q-item-label caption>Coleção</q-item-label>
              <q-item-label>{{ object.colecao.split('#').pop() }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="object.tipo">
            <q-item-section>
              <q-item-label caption>Tipo Dimensional</q-item-label>
              <q-item-label>{{ object.tipo }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="object.tiposFisicos && object.tiposFisicos.length > 0">
            <q-item-section>
              <q-item-label caption>Tipos Físicos</q-item-label>
              <q-item-label>
                <q-chip v-for="tipo in object.tiposFisicos" :key="tipo" :label="tipo.split('#').pop()" color="secondary" text-color="white" size="sm" class="q-mr-sm" />
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MappedObject } from 'src/types/apiTypes';

defineProps<{
  object: MappedObject | null
}>();
</script>
