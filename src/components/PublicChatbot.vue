<template>
  <div class="chatbot-container">
    <q-btn
      v-if="!open"
      round
      color="primary"
      icon="chat_bubble"
      size="lg"
      class="fixed-bottom-right q-ma-md shadow-10 z-top"
      @click="toggleChat"
    >
      <q-tooltip anchor="center left" self="center right">Assistente Virtual</q-tooltip>
    </q-btn>

    <transition
      appear
      enter-active-class="animated slideInUp"
      leave-active-class="animated slideOutDown"
    >
      <q-card
        v-if="open"
        class="fixed-bottom-right q-ma-md z-top shadow-10 column"
        style="width: 380px; height: 500px; max-width: 90vw;"
      >
        <q-bar class="bg-primary text-white">
          <q-icon name="smart_toy" />
          <div class="text-weight-bold q-ml-sm">Guará Assistente</div>
          <q-space />
          <q-btn dense flat icon="close" @click="toggleChat" />
        </q-bar>

        <div class="col q-pa-md scroll bg-grey-1" ref="chatScroll">

          <div v-if="!currentRepoName" class="q-pa-sm q-mb-md bg-warning text-white rounded-borders text-center text-caption">
            <q-icon name="warning" />
            Selecione um acervo na página "Acervo" para habilitar o chat.
          </div>

          <div v-for="(msg, idx) in messages" :key="idx" class="q-mb-md">
            <div :class="msg.from === 'user' ? 'row justify-end' : 'row justify-start'">
              <div
                class="q-pa-sm rounded-borders"
                :class="msg.from === 'user' ? 'bg-primary text-white' : 'bg-white text-grey-9 shadow-1'"
                style="max-width: 85%; white-space: pre-wrap; word-break: break-word;"
              >
                <div v-if="msg.from === 'bot'" class="text-caption text-grey-6 q-mb-xs">Guará</div>
                {{ msg.text }}

                <div v-if="msg.sources && msg.sources.length" class="q-mt-sm q-pt-sm" style="border-top: 1px solid #eee">
                  <div class="text-caption text-weight-bold">Fontes:</div>
                  <ul class="q-pl-md q-my-none text-caption">
                    <li v-for="(src, i) in msg.sources" :key="i">
                      {{ src.item_title || 'Item sem título' }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="row justify-start q-mb-md">
            <q-spinner-dots color="primary" size="2em" />
          </div>
        </div>

        <q-separator />

        <q-form @submit.prevent="sendMessage" class="bg-white q-pa-sm">
          <q-input
            v-model="input"
            dense
            outlined
            placeholder="Digite sua pergunta..."
            :disable="loading || !currentRepoName"
            autofocus
          >
            <template v-slot:after>
              <q-btn
                round
                dense
                flat
                icon="send"
                color="primary"
                @click="sendMessage"
                :disable="!input.trim() || loading"
              />
            </template>
          </q-input>
        </q-form>
      </q-card>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';
import { useRepositoryStore } from 'stores/repository-store';
import { sendMessageToChatbot } from 'src/services/chatbotService';

const repositoryStore = useRepositoryStore();
const open = ref(false);
const input = ref('');
const loading = ref(false);
const messages = ref([
  { from: 'bot', text: 'Olá! Selecione um acervo e pergunte-me algo sobre os objetos catalogados.' }
]);
const chatScroll = ref(null);

// Computa o nome/ID do repositório para enviar à API
const currentRepoName = computed(() => {
  if (!repositoryStore.currentRepository) return null;
  const uriParts = repositoryStore.currentRepository.uri.split('#');
  return uriParts.length > 1 ? uriParts[1] : uriParts[0].split('/').pop();
});

function toggleChat() {
  open.value = !open.value;
  if (open.value) {
    scrollToBottom();
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
  // Evita envio vazio ou duplo clique
  if (loading.value || !input.value.trim() || !currentRepoName.value) return;

  const userMsg = input.value;
  messages.value.push({ from: 'user', text: userMsg });
  input.value = '';
  loading.value = true;
  scrollToBottom();

  try {
    const data = await sendMessageToChatbot(userMsg, currentRepoName.value);

    messages.value.push({
      from: 'bot',
      text: data.reply || 'Não encontrei uma resposta no contexto atual.',
      sources: data.sources
    });
  } catch (e) {
    console.error(e);
    messages.value.push({
      from: 'bot',
      text: 'Desculpe, ocorreu um erro ao comunicar com a MemoriA. Tente novamente mais tarde.',
    });
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}
</script>

<style scoped>
.z-top {
  z-index: 9999;
}
/* Garante que o input não fique colado no fundo do card */
.q-form {
  border-top: 1px solid #ddd;
}
</style>
