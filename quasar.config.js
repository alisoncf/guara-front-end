// Arquivo: quasar.config.js

import { configure } from 'quasar/wrappers';
import path from 'path';

export default configure(function (ctx) {
  const isProduction = ctx.prod;

  return {
    build: {
      alias: {
        src: path.resolve(__dirname, './src'),
      }
    },

    devServer: {
      https: isProduction ? {
        key: 'C:/home/certificado/key.pem',
        cert: 'C:/home/certificado/cert.pem'
      } : false,
      port: 9000,
      proxy: {
        '/relation': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        },
        '/repositorios': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        },
        '/classapi': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        },
        '/sparqapi': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        },
        '/dim': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        },
        '/acesso': {
          target: 'http://localhost:5000',
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
      plugins: ['Dialog','Notify']
    },

    extras: [
      'roboto-font',
      'material-icons',
    ],
  };
});
