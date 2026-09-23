// src/apiConfig.js

const baseOnto = 'http://guara.ueg.br/ontologias/v1/objetos#';

// O navegador sempre fala com a MESMA origem do front (nunca direto com o
// backend) - isso evita CORS por completo. Quem faz a ponte de verdade é
// o servidor: o Nginx, em produção (ver nginx.conf.template e a variável
// BACKEND_URL no docker-compose.yml), e o dev server do Vite, em
// desenvolvimento (ver devServer.proxy no quasar.config.js).
const baseURL = '/api';

const apiConfig = {
  baseURL,
  endpoints: {
    classapi: '/classapi',
    recomendacao: {
      sugerir: baseURL + '/recomendacao/sugerir',
    },
    upload: '/uploadapi/upload',
    remove_file: '/uploadapi/remove',
    sparqapi: '/sparqapi',
    objectapi: '/objectapi',
    class: { list: baseURL + '/classapi/list' },
    repositorio: {
      create: baseURL + '/repositorios/create',
      uploadAvatar: baseURL + '/repositorios/upload_avatar',
      // TODO: /repositorios não tem rota de update ainda - editar um
      // repositório existente segue quebrado até isso ser implementado.
      update: baseURL + '/repo_handler/update',
    },
    dimensional: {
      create: baseURL + '/dim/create',
      list: baseURL + '/dim/list',
      listAll: baseURL + '/dim/listall',
      delete: baseURL + '/dim/delete',
      update: baseURL + '/dim/update',
    },
    relacao: {
      add: baseURL + '/relation/add',
      remove: baseURL + '/relation/remove',
      update: baseURL + '/relation/update',
      list: baseURL + '/relation/list',
    },
    fisico: {
      create: baseURL + '/fis/create',
      list: baseURL + '/fis/list',
      delete: baseURL + '/fis/delete',
      update: baseURL + '/fis/update',
    },
    midias: {
      list: baseURL + '/midias/list',
      upload: baseURL + '/uploadapi/upload',
      getFile: baseURL + '/uploadapi/midias',
    },
    cidadeai: baseURL +'/ia/cidades',
    eventoai: baseURL +'/ia/eventos',

    listar_repo: baseURL + '/repositorios/list',
    login: baseURL + '/acesso/login',
    addUser: baseURL + '/acesso/add_user',
  },
  dimension: {
    Pessoa: baseOnto + 'Pessoa',
    Tempo: baseOnto + 'Tempo',
    Lugar: baseOnto + 'Lugar',
    Evento: baseOnto + 'Evento',
  },
  properties: {
    quem: baseOnto + 'quem',
    onde: baseOnto + 'onde',
    quando: baseOnto + 'quando',
    oque: baseOnto + 'oque',
    associetedMedia: 'http://schema.org/associatedMedia',
    colecao: baseOnto + 'colecao',
    temRelacao: baseOnto + 'temRelacao',
  },

};

export default apiConfig;
