<template>
  <q-card
    class="collection-card cursor-pointer"
    flat
    bordered
    @click="$emit('click')"
  >
    <q-img :src="collection.image || 'https://placehold.co/400x300/cccccc/ffffff?text=Sem+Imagem'" :ratio="16 / 9">
      <template v-slot:error>
        <div class="absolute-full flex flex-center bg-grey-4 text-white">
          Imagem Indisponível
        </div>
      </template>
    </q-img>

    <q-card-section>
      <div class="text-h6 text-weight-bold text-grey-9 ellipsis">
        {{ collection.label }}
      </div>
      <p class="text-body2 text-grey-7 q-mt-sm ellipsis-3-lines">
        {{ collection.description }}
      </p>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { OntologyClass } from 'src/types/apiTypes';

// Define as propriedades que o componente espera receber
defineProps<{
  collection: OntologyClass
}>();

// Define os eventos que o componente pode emitir
defineEmits(['click']);
</script>

<style lang="scss" scoped>
.collection-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}
.collection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 60px; /* Ajuste conforme o tamanho da sua fonte */
}
</style>
