<template>
  <q-page class="q-pa-md">
    <div v-if="user" class="row q-col-gutter-lg">
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">Meu Perfil</div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4 text-center">
                <q-avatar size="120px" class="q-mb-md">
                  <q-img
                    :src="user.avatar || 'https://placehold.co/200x200/cccccc/ffffff?text=Avatar'"
                    :alt="user.username"
                  />
                </q-avatar>
                <div class="text-h6">{{ user.username }}</div>
                <div class="text-subtitle2 text-grey">{{ user.email }}</div>
                <q-chip
                  :label="user.permission"
                  :color="getPermissionColor(user.permission)"
                  text-color="white"
                  class="q-mt-sm"
                />
              </div>

              <div class="col-12 col-md-8">
                <q-form @submit="updateProfile" class="q-gutter-md">
                  <q-input
                    v-model="profileForm.name"
                    label="Nome Completo"
                    outlined
                    :rules="[(val) => !!val || 'Nome é obrigatório']"
                  />
                  <q-input
                    v-model="profileForm.email"
                    label="Email"
                    type="email"
                    outlined
                    :rules="[(val) => !!val || 'Email é obrigatório']"
                  />
                  <q-input
                    v-model="profileForm.bio"
                    label="Biografia"
                    type="textarea"
                    rows="3"
                    outlined
                    hint="Breve descrição sobre você (funcionalidade futura)"
                  />
                  <div>
                    <q-btn label="Salvar Alterações" type="submit" color="primary" :loading="saving" />
                  </div>
                </q-form>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Alterar Senha</div>
            <q-form @submit="changePassword" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input v-model="passwordForm.currentPassword" label="Senha Atual" type="password" outlined :rules="[(val) => !!val || 'Senha atual é obrigatória']"/>
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="passwordForm.newPassword" label="Nova Senha" type="password" outlined :rules="[(val) => !!val || 'Nova senha é obrigatória']"/>
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="passwordForm.confirmPassword" label="Confirmar Nova Senha" type="password" outlined :rules="[(val) => !!val || 'Confirmação é obrigatória', (val) => val === passwordForm.newPassword || 'Senhas não coincidem']"/>
                </div>
              </div>
              <q-btn label="Alterar Senha" type="submit" color="secondary" :loading="changingPassword" />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Minhas Estatísticas</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6 text-center q-pa-sm">
                <div class="text-h4 text-primary">{{ stats.objectsCreated }}</div>
                <div class="text-caption">Objetos Criados (mock)</div>
              </div>
              <div class="col-6 text-center q-pa-sm">
                <div class="text-h4 text-secondary">{{ stats.collectionsManaged }}</div>
                <div class="text-caption">Repositórios Gerenciados</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Meus Repositórios</div>
            <div v-if="myRepositories.length > 0">
              <q-list bordered separator>
                <q-item v-for="repo in myRepositories" :key="repo.uri" clickable v-ripple @click="selectRepository(repo)">
                  <q-item-section avatar>
                    <q-icon name="folder" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ repo.nome }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-else class="text-center text-grey q-pa-md">
              Nenhum repositório associado.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div v-else class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
      <p class="q-mt-md">Carregando dados do usuário...</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth-store';
import { useRepositoryStore } from 'stores/repository-store';
import { storeToRefs } from 'pinia';
import { Notify } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const repositoryStore = useRepositoryStore();

const { user } = storeToRefs(authStore);
const { myRepositories } = storeToRefs(repositoryStore);

const saving = ref(false);
const changingPassword = ref(false);

const profileForm = ref({ name: '', email: '', bio: '' });
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });

// As estatísticas agora são uma computed property
const stats = computed(() => ({
  objectsCreated: 0, // Manter como mock, pois não temos essa info da API
  collectionsManaged: myRepositories.value.length, // Dado real
}));

function getPermissionColor(permission) {
  const colors = { admin: 'red', editor: 'blue', leitor: 'green' };
  return colors[permission] || 'grey';
}

function resetForm() {
  if (user.value) {
    profileForm.value = {
      name: user.value.username || '',
      email: user.value.email || '',
      bio: '', // Este campo não vem da API atualmente
    };
  }
}

async function updateProfile() {
  saving.value = true;
  // TODO: Implementar a chamada para a API/Serviço de atualização de perfil quando estiver disponível.
  Notify.create({
    type: 'info',
    message: 'Funcionalidade de atualização de perfil ainda não implementada no backend.',
  });
  // Exemplo: await userService.updateProfile(profileForm.value);
  saving.value = false;
}

async function changePassword() {
  changingPassword.value = true;
  // TODO: Implementar a chamada para a API/Serviço de alteração de senha quando estiver disponível.
  Notify.create({
    type: 'info',
    message: 'Funcionalidade de alteração de senha ainda não implementada no backend.',
  });
  // Exemplo: await authService.changePassword(passwordForm.value);
  changingPassword.value = false;
}

// Ao clicar em um repositório, o seleciona como ativo e volta ao dashboard
function selectRepository(repo) {
  repositoryStore.selectRepository(repo.uri);
  Notify.create({
    type: 'positive',
    message: `Repositório '${repo.nome}' selecionado como ativo.`,
  });
  router.push('/admin/dashboard');
}

onMounted(() => {
  resetForm();

  // Se os repositórios do usuário ainda não foram carregados, busca-os.
  if (myRepositories.value.length === 0) {
    repositoryStore.fetchMine();
  }
});
</script>
