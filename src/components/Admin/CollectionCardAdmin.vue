<template>
  <q-card
    class="collection-card"
    clickable
    v-ripple
    flat
    bordered
    @click="$emit('view', collection)"
  >
    <q-img
      :src="collection.image || 'https://placehold.co/600x400/cccccc/ffffff?text=Sem+Imagem'"
      height="150px"
      class="rounded-borders"
    >
      <template v-slot:error>
        <div class="absolute-full flex flex-center bg-grey-4 text-white">
          Sem Imagem
        </div>
      </template>
    </q-img>
    <q-card-section>
      <div class="text-h6 ellipsis">{{ collection.nome }}</div>
      <div class="text-subtitle2 text-grey ellipsis-2-lines">{{ collection.descricao }}</div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn
        flat
        color="primary"
        label="Gerenciar"
        @click.stop="$emit('manage', collection)"
      />
      <q-btn
        flat
        color="secondary"
        label="Ver"
        @click.stop="$emit('view', collection)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps({
  collection: {
    type: Object,
    required: true
  }
});

defineEmits(['manage', 'view']);
</script>

<style scoped>
.collection-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.collection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.q-card-section {
  flex-grow: 1;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 40px; /* Ajuste conforme o tamanho da sua fonte */
}
</style>
