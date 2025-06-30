<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-lg">
      <!-- Informações do perfil -->
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">Meu Perfil</div>

            <div class="row q-col-gutter-md">
              <!-- Avatar e informações básicas -->
              <div class="col-12 col-md-4 text-center">
                <q-avatar size="120px" class="q-mb-md">
                  <q-img
                    :src="
                      user?.avatar ||
                      'https://placehold.co/200x200/cccccc/ffffff?text=Avatar'
                    "
                    :alt="user?.name"
                  />
                </q-avatar>
                <div class="text-h6">{{ user?.name }}</div>
                <div class="text-subtitle2 text-grey">{{ user?.email }}</div>
                <q-chip
                  :label="user?.permission"
                  :color="getPermissionColor(user?.permission)"
                  text-color="white"
                  class="q-mt-sm"
                />
              </div>

              <!-- Detalhes do perfil -->
              <div class="col-12 col-md-8">
                <q-form @submit="updateProfile" class="q-gutter-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="profileForm.name"
                        label="Nome Completo"
                        outlined
                        :rules="[(val) => !!val || 'Nome é obrigatório']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="profileForm.email"
                        label="Email"
                        type="email"
                        outlined
                        :rules="[(val) => !!val || 'Email é obrigatório']"
                      />
                    </div>
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="profileForm.phone"
                        label="Telefone"
                        outlined
                        mask="(##) #####-####"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="profileForm.institution"
                        label="Instituição"
                        outlined
                      />
                    </div>
                  </div>

                  <q-input
                    v-model="profileForm.bio"
                    label="Biografia"
                    type="textarea"
                    rows="3"
                    outlined
                    hint="Breve descrição sobre você"
                  />

                  <div class="row q-gutter-md">
                    <q-btn
                      label="Salvar Alterações"
                      type="submit"
                      color="primary"
                      :loading="saving"
                    />
                    <q-btn label="Cancelar" color="grey" @click="resetForm" />
                  </div>
                </q-form>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Alterar senha -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Alterar Senha</div>

            <q-form @submit="changePassword" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="passwordForm.currentPassword"
                    label="Senha Atual"
                    type="password"
                    outlined
                    :rules="[(val) => !!val || 'Senha atual é obrigatória']"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="passwordForm.newPassword"
                    label="Nova Senha"
                    type="password"
                    outlined
                    :rules="[(val) => !!val || 'Nova senha é obrigatória']"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="passwordForm.confirmPassword"
                    label="Confirmar Nova Senha"
                    type="password"
                    outlined
                    :rules="[
                      (val) => !!val || 'Confirmação é obrigatória',
                      (val) =>
                        val === passwordForm.newPassword ||
                        'Senhas não coincidem',
                    ]"
                  />
                </div>
              </div>

              <q-btn
                label="Alterar Senha"
                type="submit"
                color="secondary"
                :loading="changingPassword"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sidebar com estatísticas e ações -->
      <div class="col-12 col-lg-4">
        <!-- Estatísticas do usuário -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Minhas Estatísticas</div>

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="text-center q-pa-sm">
                  <div class="text-h4 text-primary">
                    {{ stats.objectsCreated }}
                  </div>
                  <div class="text-caption">Objetos Criados</div>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center q-pa-sm">
                  <div class="text-h4 text-secondary">
                    {{ stats.collectionsManaged }}
                  </div>
                  <div class="text-caption">Coleções Gerenciadas</div>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center q-pa-sm">
                  <div class="text-h4 text-accent">{{ stats.lastLogin }}</div>
                  <div class="text-caption">Último Login</div>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center q-pa-sm">
                  <div class="text-h4 text-positive">
                    {{ stats.daysActive }}
                  </div>
                  <div class="text-caption">Dias Ativo</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Repositórios associados -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Meus Repositórios</div>

            <div v-if="user?.repositorios && user.repositorios.length > 0">
              <q-list>
                <q-item
                  v-for="repo in user.repositorios"
                  :key="repo"
                  clickable
                  @click="viewRepository(repo)"
                >
                  <q-item-section avatar>
                    <q-icon name="folder" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ repo }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-else class="text-center text-grey q-pa-md">
              Nenhum repositório associado
            </div>
          </q-card-section>
        </q-card>

        <!-- Ações rápidas -->
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Ações Rápidas</div>

            <div class="q-gutter-sm">
              <q-btn
                label="Voltar ao Dashboard"
                icon="dashboard"
                color="primary"
                class="full-width"
                @click="$router.push('/admin/dashboard')"
              />
              <q-btn
                label="Ver Site Público"
                icon="public"
                color="secondary"
                class="full-width"
                @click="$router.push('/')"
              />
              <q-btn
                label="Logout"
                icon="logout"
                color="negative"
                class="full-width"
                @click="handleLogout"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth-store';
import { Notify } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();

// Estado
const saving = ref(false);
const changingPassword = ref(false);

// Computed
const user = computed(() => authStore.user);

// Formulários
const profileForm = ref({
  name: '',
  email: '',
  phone: '',
  institution: '',
  bio: '',
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// Estatísticas mockadas
const stats = ref({
  objectsCreated: 0,
  collectionsManaged: 0,
  lastLogin: 'Hoje',
  daysActive: 0,
});

// Métodos
function getPermissionColor(permission) {
  switch (permission) {
    case 'admin':
      return 'red';
    case 'editor':
      return 'blue';
    case 'leitor':
      return 'green';
    default:
      return 'grey';
  }
}

function resetForm() {
  profileForm.value = {
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: '',
    institution: '',
    bio: '',
  };
}

async function updateProfile() {
  saving.value = true;
  try {
    // Aqui você implementaria a chamada para atualizar o perfil
    // await userService.updateProfile(profileForm.value);

    Notify.create({
      type: 'positive',
      message: 'Perfil atualizado com sucesso!',
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao atualizar perfil: ' + error.message,
    });
  } finally {
    saving.value = false;
  }
}

async function changePassword() {
  changingPassword.value = true;
  try {
    // Aqui você implementaria a chamada para alterar a senha
    // await authService.changePassword(passwordForm.value);

    Notify.create({
      type: 'positive',
      message: 'Senha alterada com sucesso!',
    });

    // Limpar formulário
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao alterar senha: ' + error.message,
    });
  } finally {
    changingPassword.value = false;
  }
}

function viewRepository(repoName) {
  // Implementar navegação para o repositório específico
  console.log('Visualizar repositório:', repoName);
  // router.push(`/admin/repository/${repoName}`);
}

function handleLogout() {
  authStore.logout();
  router.push('/');
  Notify.create({
    type: 'info',
    message: 'Logout realizado com sucesso!',
  });
}

// Lifecycle
onMounted(() => {
  resetForm();

  // Carregar estatísticas (mockadas por enquanto)
  stats.value = {
    objectsCreated: 15,
    collectionsManaged: user.value?.repositorios?.length || 0,
    lastLogin: 'Hoje',
    daysActive: 30,
  };
});
</script>
