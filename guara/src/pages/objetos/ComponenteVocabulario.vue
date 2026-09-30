<script setup lang="ts">
import { CampoVocabulario } from './vocabularioSchema';

// Genérico de propósito: não conhece "ISBN", "DataMorte" nem nenhum campo
// específico, e não sabe de qual domínio (tipo físico, dimensão, o que
// vier depois) os campos vieram - só desenha o que o chamador já filtrou
// e mandou em `campos` (ver vocabularioFisico.ts / vocabularioDimensional.ts).
// Reaproveitável em qualquer diálogo que precise de "outros dados" vindos
// de um vocabulário por tipo.
const props = defineProps<{
  modelValue?: Record<string, string>;
  // Campos já filtrados pro(s) tipo(s) do objeto (camposParaTipos(),
  // camposParaTiposDimensao(), ou o que outro domínio vier a usar).
  campos: CampoVocabulario[];
  // Só usado pra decidir a mensagem "nenhum tipo escolhido ainda" -
  // tanto faz se são tipoFisico ou tipo de dimensão.
  tipos: string[];
  somenteLeitura?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', valor: Record<string, string>): void;
}>();

function valorDoCampo(chave: string): string {
  return props.modelValue?.[chave] ?? '';
}
function atualizarCampo(chave: string, valor: string) {
  emit('update:modelValue', { ...(props.modelValue || {}), [chave]: valor });
}
</script>

<template>
  <div v-if="tipos.length === 0" class="text-grey-7 q-pa-md text-center">
    Escolha ao menos um tipo na aba "Dados básicos" pra ver os campos
    específicos daquele tipo.
  </div>
  <div v-else-if="campos.length === 0" class="text-grey-7 q-pa-md text-center">
    Nenhum campo adicional definido pro(s) tipo(s) escolhido(s) ainda.
  </div>
  <div v-else class="q-gutter-y-md">
    <q-input
      v-for="campo in campos"
      :key="campo.chave"
      :model-value="valorDoCampo(campo.chave)"
      @update:model-value="(v) => atualizarCampo(campo.chave, String(v ?? ''))"
      :label="campo.rotulo"
      :hint="campo.ajuda"
      :type="campo.tipoDado === 'numero' ? 'number' : campo.tipoDado === 'data' ? 'date' : 'text'"
      :autogrow="campo.tipoDado === 'textarea'"
      outlined
      :readonly="somenteLeitura"
    />
  </div>
</template>
