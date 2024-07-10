<template>
  <div class="home-container">
    <div class="project-section">
      <div class="info">
        <div class="vertical-line"></div>
        <div class="content">
          <h2>Projeto Guará</h2>
          <p>O Guará é um sistema de informação baseado em RDF projetado para centros de memória. Ele permite a organização e a exploração de coleções de patrimônio cultural de maneira eficiente e integrada.</p>
          <q-btn flat @click="goToMemorySpaces">Informações do Espaço de Memória</q-btn>
        </div>
      </div>
    </div>
    <div class="hero-section">
      <q-btn color="primary" @click="goToCollections">Explorar Coleções</q-btn>
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
  padding: 5px;
}

.project-section {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.info {
  display: flex;
  align-items: center;
}

.vertical-line {
  width: 1px;
  background-color: #0b0a0b;
  forced-color-adjust: auto;

  margin-right: 5px;
}

.content {
  text-align: left;
}

.content h2 {
  font-size: 2.0rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.content p {
  font-size: 1.00rem;
  margin-bottom: 20px;
}

.hero-section {
  background: url('../assets/hero-background.jpg') no-repeat center center;
  background-size: cover;
  padding: 5px;
  color: rgb(128, 119, 119);
  text-align: left;
}

.hero-section h1 {
  font-size: 3rem;
  font-weight: 700;
}

.hero-section p {
  font-size: 1.5rem;
  margin: 20px 0;
}

.q-btn {
  font-size: 1rem;
}
</style>
