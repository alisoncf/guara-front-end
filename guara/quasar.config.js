const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  const isProduction = ctx.prod; // ou use process.env.NODE_ENV === 'production'

  return {
    build: {
      // Suas outras configurações de build
    },

    devServer: {
      https: isProduction ? {
        key: 'C:/home/certificado/key.pem',
        cert: 'C:/home/certificado/cert.pem'
      } : false,
      port: 9000,
      proxy: {
        '/classapi': {
          target: 'https://localhost:5000',
          changeOrigin: true,
          secure: false
        },
        '/sparqapi': {
          target: 'https://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      },
      open: true
    },

    framework: {
      config: {},
      lang: 'pt-br',
      iconSet: 'material-icons',
      plugins: ['Notify']
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
