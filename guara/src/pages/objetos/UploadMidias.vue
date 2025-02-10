<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <q-input type="file" multiple @change="handleFileUpload" />
      </q-card-section>
      <q-card-section>
        <div v-if="uploadedFiles.length" class="thumbnails-container">
          <q-btn
            icon="chevron_left"
            @click="prevImage"
            :disable="currentIndex === 0"
          />
          <img
            :src="uploadedFiles[currentIndex]"
            alt="Thumbnail"
            class="thumbnail"
          />
          <q-btn
            icon="chevron_right"
            @click="nextImage"
            :disable="currentIndex === uploadedFiles.length - 1"
          />
        </div>
        <div v-else>Nenhuma imagem carregada.</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const id = route.params.id; // Obtém o ID do objeto da rota

const uploadedFiles = ref([]);
const currentIndex = ref(0);

const handleFileUpload = (event) => {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedFiles.value.push(e.target.result);
    };
    reader.readAsDataURL(files[i]);
  }
};

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const nextImage = () => {
  if (currentIndex.value < uploadedFiles.value.length - 1) {
    currentIndex.value++;
  }
};

// Você pode usar o ID conforme necessário no componente
console.log('Objeto ID:', id);
</script>

<style>
.thumbnails-container {
  display: flex;
  align-items: center;
}

.thumbnail {
  max-width: 300px;
  max-height: 300px;
  margin: 0 10px;
}
</style>
