<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth-store';
import { useRouter } from 'vue-router';
import { Auth, Repositorio } from './tipos';
import { onBeforeMount, ref } from 'vue';
import { listarRepositorios } from 'src/services/api';
import { Notify } from 'quasar';

const router = useRouter();
const store = useAuthStore();

const listaRepositorios = ref([] as Repositorio[]);
const repositorioPreview = ref<Repositorio | null>(null);

const projectUrl = 'https://guara.ueg.br';
const githubUrl = 'https://github.com/alisoncf/guara-front-end';

const destaques = [
  {
    icon: 'category',
    title: 'Objetos e Coleções',
    text: 'Catalogue acervos e itens patrimoniais com descrições ricas, imagens e metadados estruturados.',
  },
  {
    icon: 'account_tree',
    title: 'Organização e Vocabulário',
    text: 'Defina a estrutura do espaço de memória e utilize vocabulários e ontologias para dar consistência aos dados.',
  },
  {
    icon: 'public',
    title: 'Rede de Repositórios',
    text: 'Conecte-se a repositórios amigos e amplie o alcance e a pesquisa sobre o patrimônio documentado.',
  },
];

async function listarRepo() {
  listaRepositorios.value = await listarRepositorios('');
  if (listaRepositorios.value.length > 0) {
    repositorioPreview.value = listaRepositorios.value[0];
  }
}
function goToLogin() {
  router.push('/login');
}
function goToLogout() {
  router.push('/logout');
}
function irParaColecoes() {
  router.push('/abrir-colecoes');
}
function selecionarRepositorio(repo: Repositorio) {
  const auth = ref({} as Auth);
  auth.value.isLoggedIn = false;
  auth.value.user = '';
  auth.value.repositorio_conectado = repo;
  store.set(auth.value);
  Notify.create({
    message: `Repositório "${repo.nome}" selecionado.`,
    color: 'primary',
    position: 'top',
  });
  router.push('/abrir-colecoes');
}
onBeforeMount(() => {
  listarRepo();
});
</script>

<template>
  <div class="guara-home">
    <!-- HERO -->
    <section class="hero">
      <q-btn
        :icon="store.user ? 'logout' : 'login'"
        round
        flat
        color="white"
        @click="store.user ? goToLogout() : goToLogin()"
        class="hero-admin-btn"
        size="md"
        :aria-label="store.user ? 'Sair' : 'Acesso administrativo'"
      >
        <q-tooltip>{{ store.user ? 'Sair' : 'Acesso administrativo' }}</q-tooltip>
      </q-btn>

      <div class="hero-content">
        <q-avatar size="140px" class="hero-logo">
          <img src="../assets/guara.png" alt="Guará" />
        </q-avatar>

        <h1 class="hero-title">Guará</h1>
        <p class="hero-subtitle">Sistema de Informação Patrimonial</p>

        <p class="hero-description">
          Batizado em homenagem ao lobo-guará, símbolo do Cerrado brasileiro,
          o Guará é uma plataforma para documentar, organizar e preservar
          acervos patrimoniais. Cataloga objetos e coleções, estrutura
          vocabulários e ontologias, e conecta-se a uma rede de repositórios
          amigos — levando a memória institucional a mais gente.
        </p>

        <div class="hero-actions">
          <q-btn
            unelevated
            rounded
            icon="explore"
            label="Explorar coleções"
            size="md"
            class="q-px-md btn-hero-primary"
            @click="irParaColecoes"
          />
          <q-btn
            outline
            rounded
            color="white"
            icon="language"
            label="Site do projeto"
            size="md"
            class="q-px-md"
            :href="projectUrl"
            target="_blank"
            rel="noopener"
          />
          <q-btn
            outline
            rounded
            color="white"
            size="md"
            class="q-px-md"
            :href="githubUrl"
            target="_blank"
            rel="noopener"
          >
            <svg
              viewBox="0 0 16 16"
              width="18"
              height="18"
              class="q-mr-sm"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07
                -1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82
                a7.55 7.55 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15
                0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2
                0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
            GitHub
          </q-btn>
        </div>
      </div>
    </section>

    <!-- ESCOLHA DE REPOSITÓRIO -->
    <section v-if="!store.user" class="repo-picker">
      <div class="repo-picker-inner">
        <div class="repo-picker-intro">
          <div class="repo-picker-badge">Comece por aqui</div>
          <div class="text-h5 text-weight-bold">Escolha um repositório</div>
          <p class="text-body2 text-grey-8">
            O Guará reúne o acervo de diferentes instituições. Selecione um
            repositório na lista para conhecer sua descrição e começar a
            explorar as coleções e objetos daquele acervo.
          </p>
        </div>

        <div v-if="listaRepositorios.length > 0" class="repo-picker-body">
          <div class="repo-picker-list">
            <div
              v-for="repo in listaRepositorios"
              :key="repo.uri"
              class="repo-mini-card"
              :class="{
                'repo-mini-card--active': repositorioPreview?.uri === repo.uri,
              }"
              @click="repositorioPreview = repo"
            >
              <q-avatar size="34px" class="repo-mini-icon">
                <q-icon name="storage" size="18px" color="white" />
              </q-avatar>
              <div class="repo-mini-nome">{{ repo.nome }}</div>
              <q-icon name="chevron_right" size="18px" class="repo-mini-chevron" />
            </div>
          </div>

          <div class="repo-picker-detail" v-if="repositorioPreview">
            <q-icon name="storage" size="22px" color="primary" />
            <div class="text-subtitle1 text-weight-bold q-mt-sm">
              {{ repositorioPreview.nome }}
            </div>
            <p class="text-body2 text-grey-8 repo-picker-detail-desc">
              {{ repositorioPreview.descricao }}
            </p>
            <q-btn
              unelevated
              rounded
              color="primary"
              icon-right="arrow_forward"
              label="Explorar este repositório"
              @click="selecionarRepositorio(repositorioPreview)"
            />
          </div>
        </div>

        <div v-else class="text-body2 text-grey-7 text-center q-pa-md">
          Carregando repositórios disponíveis…
        </div>
      </div>
    </section>

    <!-- DESTAQUES -->
    <section class="features">
      <div class="features-grid">
        <q-card v-for="item in destaques" :key="item.title" flat class="feature-card">
          <q-card-section class="column items-center text-center">
            <q-avatar size="56px" class="feature-icon">
              <q-icon :name="item.icon" size="28px" color="white" />
            </q-avatar>
            <div class="text-subtitle1 text-weight-bold q-mt-sm">
              {{ item.title }}
            </div>
            <div class="text-body2 text-grey-8 q-mt-xs">
              {{ item.text }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </section>

    <!-- ÁREA ADMINISTRATIVA -->
    <section v-if="store.user" class="repos">
      <div class="q-pa-md flex column items-center">
        <q-card class="q-pa-md" style="max-width: 400px; width: 100%">
          <q-card-section>
            <div class="text-subtitle1">Usuário conectado: {{ store.user }}</div>
            <div v-if="store.repositorio_conectado" class="q-mt-sm">
              Repositório: {{ store.repositorio_conectado.nome }}
            </div>
            <div v-if="store.repositorio_conectado" class="q-mt-sm">
              URI: {{ store.repositorio_conectado.uri }} token
              {{ store.token }} validade {{ store.validade }}
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Logout" color="primary" @click="goToLogout" flat />
          </q-card-actions>
        </q-card>
      </div>
    </section>
  </div>
</template>

<style scoped>
.guara-home {
  --night-deep: #0b1533;
  --night-mid: #16255a;
  --night-light: #24379c;
  --guara-orange: #f4941e;
  --guara-gold: #ffd77a;
}

/* HERO */
.hero {
  position: relative;
  overflow: hidden;
  padding: 56px 24px 64px;
  text-align: center;
  color: #fff;
  background:
    radial-gradient(circle at 82% 18%, rgba(255, 215, 122, 0.28), transparent 42%),
    radial-gradient(circle at 12% 85%, rgba(244, 148, 30, 0.18), transparent 45%),
    linear-gradient(135deg, var(--night-deep) 0%, var(--night-mid) 55%, var(--night-light) 100%);
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 20% 30%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1.5px 1.5px at 65% 15%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 40% 60%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1.5px 1.5px at 85% 45%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1px 1px at 92% 75%, rgba(255, 255, 255, 0.4), transparent),
    radial-gradient(1px 1px at 10% 65%, rgba(255, 255, 255, 0.4), transparent);
  opacity: 0.8;
  pointer-events: none;
}
.hero-admin-btn {
  position: absolute;
  top: 16px;
  right: 16px;
}
.hero-content {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
}
.hero-logo {
  background: #fff;
  box-shadow:
    0 0 0 4px rgba(244, 148, 30, 0.55),
    0 10px 30px rgba(0, 0, 0, 0.45);
}
.hero-title {
  margin: 20px 0 0;
  font-size: clamp(2.2rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--guara-orange);
  text-shadow: 0 2px 16px rgba(244, 148, 30, 0.35);
}
.hero-subtitle {
  margin: 4px 0 0;
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
}
.hero-description {
  margin: 20px auto 0;
  max-width: 620px;
  line-height: 1.7;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.88);
}
.hero-actions {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.btn-hero-primary {
  background: var(--guara-orange);
  color: #1a1200;
  font-weight: 600;
}
.btn-hero-primary:hover {
  background: var(--guara-gold);
}

/* DESTAQUES */
.features {
  background: #f7f7fb;
  padding: 48px 24px;
}
.features-grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
.feature-card {
  background: #fff;
  border-radius: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(11, 21, 51, 0.12);
}
.feature-icon {
  background: linear-gradient(135deg, var(--night-mid), var(--guara-orange));
}

/* ESCOLHA DE REPOSITÓRIO */
.repo-picker {
  background: #fff;
  padding: 48px 24px;
  border-bottom: 1px solid #edeef3;
}
.repo-picker-inner {
  max-width: 1000px;
  margin: 0 auto;
}
.repo-picker-intro {
  text-align: center;
  max-width: 620px;
  margin: 0 auto 28px;
}
.repo-picker-badge {
  display: inline-block;
  margin-bottom: 10px;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(244, 148, 30, 0.12);
  color: #c96a0a;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.repo-picker-body {
  display: flex;
  align-items: stretch;
  gap: 20px;
  flex-wrap: wrap;
}
.repo-picker-list {
  flex: 1 1 260px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f7f7fb;
  border-radius: 12px;
  padding: 10px;
}
.repo-mini-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #ebebf2;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.repo-mini-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(11, 21, 51, 0.1);
}
.repo-mini-card--active {
  border-color: var(--guara-orange);
  background: rgba(244, 148, 30, 0.08);
}
.repo-mini-icon {
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--night-mid), var(--guara-orange));
}
.repo-mini-nome {
  flex: 1 1 auto;
  min-width: 0;
  font-weight: 600;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.repo-mini-chevron {
  flex-shrink: 0;
  color: #b8b8c4;
}
.repo-picker-detail {
  flex: 2 1 360px;
  background: #fff;
  border: 1px solid #ebebf2;
  border-radius: 12px;
  padding: 24px;
}
.repo-picker-detail-desc {
  min-height: 3em;
}

/* ÁREA ADMINISTRATIVA */
.repos {
  padding: 40px 24px 56px;
  background: #fff;
}
</style>
