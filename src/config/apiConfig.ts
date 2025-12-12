// src/config/apiConfig.ts

// A URL base da sua API. Centralizada aqui.
const baseURL = process.env.DEV
  ? 'http://localhost:5000' // URL para desenvolvimento
  : 'https://sua-api-em-producao.com'; // URL para produção

//API MemoriA
const memoriaBaseURL = process.env.DEV
  ? 'http://localhost:5080'
  : 'https://sua-api-memoria-prod.com';

// Prefixo base para as URIs da sua ontologia
const baseOnto = 'http://guara.ueg.br/ontologias/v1/objetos#';

const apiConfig = {
  // URL base para a instância do axios usar
  baseURL,
  memoriaBaseURL,

  // Endpoints relativos. O axios irá concatená-los com a baseURL.
  endpoints: {
    login: '/acesso/login',
    addUser: '/acesso/add_user',

    repositorios: {
      list: '/repositorios/listar_repositorios',
      createDataset: '/repositorios/create_dataset',
      addRepo: '/repositorios/adicionar_repo',
      myRepos: '/repositorios/meus_repos',
    },

    graph: {
      mainData: '/graph/main_data',
    },

    classapi: {
      list: '/classapi/list',
      add: '/classapi/adicionar_classe',
      update: '/classapi/alterar_classe',
      delete: '/classapi/excluir_classe',
    },

    dimensional: {
      create: '/dim/create',
      list: '/dim/list',
      listAll: '/dim/listall',
      delete: '/dim/delete',
      update: '/dim/update',
    },

    fisico: {
      create: '/fis/create',
      list: '/fis/list',
      delete: '/fis/delete',
      update: '/fis/update',
    },

    relacao: {
      add: '/relation/adicionar_relacao',
      remove: '/relation/remover_relacao_especifica',
      list: '/relation/list',
      updateProperties: '/relation/update_properties',
      deleteAll: '/relation/delete_all_relations',
    },

    midias: {
      listByObject: '/midias/list', // Endpoint para listar mídias de um objeto
      upload: '/uploadapi/upload',
      remove: '/uploadapi/remove',
    },

    memoria: {
      chatbot: '/api/v1/chatbot',
      health: '/api/v1/health',
      oculusStatus: '/api/v1/status/oculus',
      processDocument: '/api/v1/documents/process'
    }
  },

  // URIs completas para os tipos dimensionais da sua ontologia
  dimensionTypes: {
    Pessoa: baseOnto + 'Pessoa',
    Tempo: baseOnto + 'Tempo',
    Lugar: baseOnto + 'Lugar',
    Evento: baseOnto + 'Evento',
  },

  // URIs completas para propriedades frequentemente usadas
  properties: {
    quem: baseOnto + 'quem',
    onde: baseOnto + 'onde',
    quando: baseOnto + 'quando',
    oque: baseOnto + 'oque',
    associatedMedia: 'http://schema.org/associatedMedia',
    colecao: baseOnto + 'colecao',
    temRelacao: baseOnto + 'temRelacao',
  },
};

export default apiConfig;
