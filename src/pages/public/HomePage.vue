<template>
  <q-page class="q-pa-md">
    <HomeGraph />
  </q-page>
</template>

<script setup lang="ts">
// Importa o novo componente
import HomeGraph from 'components/public/HomeGraph.vue';

defineOptions({
  name: 'HomePage'
});
</script>
