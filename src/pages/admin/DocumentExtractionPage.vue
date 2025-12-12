<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" to="/admin/dashboard" class="q-mr-md" />
      <div>
        <h4 class="q-my-none">Extração de Texto (Oculus)</h4>
        <p class="text-grey q-mt-sm q-mb-none">
          Faça upload de documentos (PDF, Imagens) para extrair texto e identificar entidades automaticamente.
        </p>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Enviar Documento</div>
            <q-file
              v-model="file"
              label="Selecione o arquivo"
              outlined
              counter
              accept=".pdf, .jpg, .jpeg, .png"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-btn
              label="Processar Documento"
              color="primary"
              class="full-width q-mt-md"
              :loading="processing"
              :disable="!file"
              @click="handleProcess"
            />
          </q-card-section>
        </q-card>

        <q-banner v-if="error" class="bg-negative text-white q-mt-md rounded-borders">
          {{ error }}
        </q-banner>
      </div>

      <div class="col-12 col-md-8">
        <div v-if="result" class="q-gutter-y-md">

          <q-card class="bg-green-1">
            <q-card-section>
              <div class="text-h6 text-positive">
                <q-icon name="check_circle" /> Processamento Concluído
              </div>
              <div class="q-mt-sm">
                <strong>Arquivo:</strong> {{ result.filename }} <br>
                <strong>Status:</strong> {{ result.status }}
              </div>
            </q-card-section>
          </q-card>

          <q-card v-if="result.data?.texto_extraido_amostra">
            <q-card-section>
              <div class="text-h6">Amostra do Texto Extraído</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="bg-grey-1" style="max-height: 300px; overflow-y: auto;">
              <pre style="white-space: pre-wrap; font-family: inherit;">{{ result.data.texto_extraido_amostra }}</pre>
            </q-card-section>
          </q-card>

          <q-card v-if="result.data?.itens_catalogados && result.data.itens_catalogados.length > 0">
            <q-card-section>
              <div class="text-h6">Itens Identificados ({{ result.data.itens_catalogados.length }})</div>
              <p class="text-caption">Objetos que podem ser catalogados a partir deste documento.</p>
            </q-card-section>
            <q-separator />
            <q-list separator>
              <q-item v-for="(item, index) in result.data.itens_catalogados" :key="index">
                <q-item-section avatar>
                  <q-icon name="smart_button" color="secondary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ item.entry_type }}</q-item-label>
                  <q-item-label caption>
                    <div v-for="(val, key) in item.properties" :key="key">
                      <strong>{{ key }}:</strong> {{ val }}
                    </div>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <div v-else class="text-center text-grey q-pa-md">
            Nenhuma entidade foi identificada automaticamente neste documento.
          </div>

        </div>

        <div v-else-if="!processing" class="text-center text-grey q-pa-xl border-dashed">
          <q-icon name="description" size="4em" color="grey-4" />
          <p class="text-h6 q-mt-md">Os resultados da extração aparecerão aqui.</p>
        </div>

        <div v-else class="text-center q-pa-xl">
          <q-spinner-gears color="primary" size="4em" />
          <p class="text-h6 q-mt-md">O Oculus está lendo seu documento...</p>
          <p class="text-caption">Isso pode levar alguns instantes dependendo do tamanho do arquivo.</p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { processDocument } from 'src/services/documentService';

const file = ref(null);
const processing = ref(false);
const result = ref(null);
const error = ref(null);

async function handleProcess() {
  if (!file.value) return;

  processing.value = true;
  error.value = null;
  result.value = null;

  try {
    const data = await processDocument(file.value);
    result.value = data;
  } catch (err) {
    error.value = 'Falha ao processar o documento. Verifique se o serviço Oculus está online.';
  } finally {
    processing.value = false;
  }
}
</script>

<style scoped>
.border-dashed {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
}
</style>
