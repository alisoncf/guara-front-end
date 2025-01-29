import { watch, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import { listarClasses } from 'src/services/api';

export default {
  setup() {
    const authStore = useAuthStore();

    // Monitorar alterações no URI do repositório
    watch(
      () => authStore.get.repositorio_conectado.uri, // Observa o URI do repositório
      (newUri) => {
        if (newUri) {
          console.log('Repositório carregado:', newUri);
          listarClasses('algum_keyword') // Chamando listarClasses
            .then((classes) => {
              console.log('Classes carregadas:', classes);
            })
            .catch((error) => {
              console.error('Erro ao listar classes:', error);
            });
        }
      }
    );

    // Garante que a lógica seja executada ao montar o componente
    onMounted(() => {
      const uri = authStore.get.repositorio_conectado.uri;
      if (uri) {
        console.log('Repositório já definido ao montar:', uri);
        listarClasses('algum_keyword')
          .then((classes) => {
            console.log('Classes carregadas:', classes);
          })
          .catch((error) => {
            console.error('Erro ao listar classes:', error);
          });
      } else {
        console.log('Aguardando repositório ser definido...');
      }
    });
  },
};
