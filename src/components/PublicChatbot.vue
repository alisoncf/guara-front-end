<template>
  <div>
    <!-- Botão flutuante -->
    <q-btn
      round
      color="primary"
      icon="chat"
      class="fixed bottom-6 right-6 z-max"
      @click="toggleChat"
      v-if="!open"
    />

    <!-- Janela do chat -->
    <q-card
      v-if="open"
      class="fixed bottom-6 right-6 z-max"
      style="width: 350px; max-width: 95vw; min-height: 420px"
    >
      <q-bar>
        <div class="text-bold">Assistente Virtual</div>
        <q-space />
        <q-btn dense flat icon="close" @click="toggleChat" />
      </q-bar>
      <q-separator />
      <div
        class="q-pa-sm"
        style="height: 320px; overflow-y: auto"
        ref="chatScroll"
      >
        <div v-for="(msg, idx) in messages" :key="idx" class="q-mb-sm">
          <div
            :class="msg.from === 'user' ? 'text-right' : 'text-left'"
            style="white-space: pre-line"
          >
            <q-chip
              :color="msg.from === 'user' ? 'primary' : 'grey-3'"
              :text-color="msg.from === 'user' ? 'white' : 'black'"
              class="q-mb-xs"
              :class="msg.from === 'user' ? 'float-right' : 'float-left'"
            >
              {{ msg.text }}
            </q-chip>
          </div>
        </div>
      </div>
      <q-separator />
      <q-form @submit.prevent="sendMessage">
        <div class="row no-wrap q-pa-sm">
          <q-input
            v-model="input"
            dense
            outlined
            placeholder="Digite sua mensagem..."
            class="col"
            @keyup.enter="sendMessage"
            :disable="loading"
          />
          <q-btn
            icon="send"
            color="primary"
            flat
            round
            :loading="loading"
            @click="sendMessage"
            :disable="!input"
          />
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { appConfig } from 'src/config/appConfig';

const open = ref(false);
const input = ref('');
const loading = ref(false);
const messages = ref([{ from: 'bot', text: 'Olá! Como posso ajudar?' }]);
const chatScroll = ref(null);

function toggleChat() {
  open.value = !open.value;
  if (open.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatScroll.value) {
      chatScroll.value.scrollTop = chatScroll.value.scrollHeight;
    }
  });
}

async function sendMessage() {
  if (!input.value.trim()) return;
  const userMsg = input.value;
  messages.value.push({ from: 'user', text: userMsg });
  input.value = '';
  loading.value = true;
  scrollToBottom();

  try {
    // Usa a URL centralizada do appConfig
    const response = await fetch(appConfig.chatbotApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg }),
    });
    const data = await response.json();
    messages.value.push({
      from: 'bot',
      text: data.reply || 'Desculpe, não entendi.',
    });
  } catch (e) {
    messages.value.push({
      from: 'bot',
      text: 'Erro ao conectar ao assistente.',
    });
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}
</script>

<style scoped>
/* Ajuste para mobile */
@media (max-width: 500px) {
  .fixed.bottom-6.right-6 {
    right: 2vw !important;
    bottom: 2vw !important;
    width: 98vw !important;
    min-width: 0 !important;
  }
}
</style>
