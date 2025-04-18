// src/apiConfig.js

const isProduction = process.env.NODE_ENV === 'production';
const baseOnto = 'http://guara.ueg.br/ontologias/v1/objetos#';
const apiConfig = {
  baseURL: isProduction ? 'https://localhost:5000' : 'http://localhost:5000',
  endpoints: {
    classapi: '/classapi',
    upload: '/uploadapi/upload',
    remove_file: '/uploadapi/remove',
    sparqapi: '/sparqapi',
    objectapi: '/objectapi',
    dimensional: {
      create: '/dim/create',
      list: '/dim/list',
      delete: '/dim/delete',
      update: '/dim/update',
    },
    listar_arquivos: '/objectapi/listar_arquivos',
    listar_repo: '/repositorios/listar_repositorios',
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
