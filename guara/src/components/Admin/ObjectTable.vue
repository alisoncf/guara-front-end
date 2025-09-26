<template>
  <q-table
    :rows="objects"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :pagination="{ rowsPerPage: 15 }"
    flat
    bordered
  >
    <template v-slot:body-cell-titulo="props">
      <q-td :props="props">
        <div class="text-weight-medium">{{ props.row.titulo }}</div>
        <div class="text-caption text-grey ellipsis">{{ props.row.resumo }}</div>
      </q-td>
    </template>

    <template v-slot:body-cell-colecao="props">
      <q-td :props="props">
        <q-chip
          v-if="props.row.colecao"
          :label="props.row.colecao.split('#').pop()"
          color="primary"
          text-color="white"
          size="sm"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <div class="row q-gutter-xs">
          <q-btn flat round color="primary" icon="edit" size="sm" @click="$emit('edit', props.row)" title="Editar" />
          <q-btn flat round color="secondary" icon="visibility" size="sm" @click="$emit('view', props.row)" title="Visualizar" />
          <q-btn flat round color="info" icon="link" size="sm" @click="$emit('relations', props.row)" title="Gerenciar Relações" />
          <q-btn flat round color="negative" icon="delete" size="sm" @click="$emit('delete', props.row)" title="Excluir" />
        </div>
      </q-td>
    </template>

    <template v-slot:no-data>
      <div class="full-width row flex-center q-pa-lg text-grey">
        <q-icon name="inventory_2" size="48px" />
        <div class="q-mt-sm">Nenhum objeto encontrado.</div>
      </div>
    </template>
  </q-table>
</template>

<script setup>
defineProps({
  objects: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit', 'view', 'relations', 'delete']);

const columns = [
  { name: 'titulo', label: 'Título / Resumo', field: 'titulo', align: 'left', sortable: true },
  { name: 'colecao', label: 'Coleção', field: 'colecao', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
];
</script>
