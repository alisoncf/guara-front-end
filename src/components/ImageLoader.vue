<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="row">
          <div class="col">
            <q-input type="file" @change="onFileChange" multiple />
          </div>
          <div class="col">
            <div v-if="images.length > 0">
              <q-carousel v-model="currentImageIndex" arrows animated infinite>
                <q-carousel-slide
                  v-for="(image, index) in images"
                  :key="index"
                  :name="index"
                >
                  <img :src="image" class="full-width" />
                </q-carousel-slide>
              </q-carousel>
              <div class="row justify-center q-mt-md">
                <q-btn @click="prevImage" label="Previous" />
                <q-btn @click="nextImage" label="Next" />
              </div>
            </div>
            <div v-else>
              <p>No images uploaded yet</p>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      images: [],
      currentImageIndex: 0,
    };
  },
  methods: {
    onFileChange(event) {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.images.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    },
    prevImage() {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    },
    nextImage() {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.images.length;
    },
  },
};
</script>

<style>
.full-width {
  width: 100%;
  height: auto;
}
</style>
