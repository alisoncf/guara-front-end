<template>
  <div class="home-container">
    <CollectionBubbleChart />
  </div>
</template>

<script setup lang="ts">
import CollectionBubbleChart from 'src/components/CollectionBubbleChart.vue';
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
</style>
