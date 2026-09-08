const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  const isProduction = ctx.prod; // ou use process.env.NODE_ENV === 'production'

  return {
    build: {
      // Suas outras configurações de build
      extendViteConf(viteConf) {
        // Dentro do Docker (bind mount no Windows), eventos nativos de
        // sistema de arquivos nem sempre atravessam a fronteira do
        // container - sem isso, o watcher do Vite fica "mudo" e o
        // hot-reload não funciona. CHOKIDAR_USEPOLLING sozinho não é
        // suficiente nesta versão do Vite; setar usePolling aqui é a
        // forma garantida de funcionar.
        if (process.env.DOCKER_DEV) {
          viteConf.server = viteConf.server || {};
          viteConf.server.watch = {
            usePolling: true,
            interval: 300,
          };
        }
      },
    },

    devServer: {
      https: isProduction ? {
        key: 'C:/home/certificado/key.pem',
        cert: 'C:/home/certificado/cert.pem'
      } : false,
      host: '0.0.0.0', // permite acessar o dev server de fora do container Docker
      port: 9000,
      proxy: {
        // O front sempre chama caminhos relativos "/api/...";
        // o dev server repassa pro backend real, removendo o prefixo.
        // DEV_BACKEND_URL permite trocar o alvo sem editar este arquivo -
        // útil pois, dentro do container Docker, "localhost" aponta pro
        // próprio container, não pro backend rodando no seu Windows
        // (nesse caso use http://host.docker.internal:5000, já configurado
        // em docker-compose-dev.yml).
        '/api': {
          target: process.env.DEV_BACKEND_URL || 'https://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      open: !process.env.DOCKER_DEV // não tenta abrir navegador de dentro do container
    },

    framework: {
      config: {},
      lang: 'pt-BR',
      iconSet: 'material-icons',
      plugins: ['Dialog','Notify']
    },

    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],
    // Outras configurações do Quasar...
  };
});
