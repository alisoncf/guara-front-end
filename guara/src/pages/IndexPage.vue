<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>Guará: Sistema RDF para Centros de Memória</h1>
      <p>Uma plataforma inovadora para gerenciar e explorar informações sobre patrimônio cultural.</p>
      <q-btn color="primary" @click="goToCollections">Explorar Coleções</q-btn>
    </div>
    <div class="info-section">
      <h2>Sobre o Projeto Guará</h2>
      <p>O Guará é um sistema de informação baseado em RDF projetado para centros de memória. Ele permite a organização e a exploração de coleções de patrimônio cultural de maneira eficiente e integrada.</p>
      <q-btn flat @click="goToMemorySpaces">Informações do Espaço de Memória</q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goToCollections() {
  router.push('/abrir-colecoes');
}

function goToMemorySpaces() {
  router.push('/informacoes-espaco');
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  text-align: center;
}

.hero-section {
  background: url('../assets/hero-background.jpg') no-repeat center center;
  background-size: cover;
  padding: 50px;
  color: white;
}

.hero-section h1 {
  font-size: 2.5rem;
}

.hero-section p {
  font-size: 1.25rem;
  margin: 20px 0;
}

.info-section {
  margin-top: 40px;
}

.info-section h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.info-section p {
  font-size: 1.25rem;
  margin-bottom: 20px;
}
</style>
