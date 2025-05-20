// src/apiConfig.js

const isProduction = process.env.NODE_ENV === 'production';
const baseOnto = 'http://guara.ueg.br/ontologias/v1/objetos#';
const baseURL = isProduction
  ? 'https://localhost:5000'
  : 'http://localhost:5000';
const apiConfig = {
  baseURL: isProduction ? 'https://localhost:5000' : 'http://localhost:5000',
  endpoints: {
    classapi: '/classapi',
    upload: '/uploadapi/upload',
    remove_file: '/uploadapi/remove',
    sparqapi: '/sparqapi',
    objectapi: '/objectapi',
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
    },

    listar_repo: '/sparqapi',
    login: '/acesso/login',
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
