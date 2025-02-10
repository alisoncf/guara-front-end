// src/apiConfig.js

const isProduction = process.env.NODE_ENV === 'production';

const apiConfig = {
  baseURL: isProduction ? 'https://localhost:5000' : 'http://localhost:5000',
  endpoints: {
    classapi: '/classapi',
    upload: '/uploadapi',
    sparqapi: '/sparqapi',
    objectapi: '/objectapi',
    listar_repo:  '/repositorios/listar_repositorios',
    login: '/acesso/login'

  }

};


export default apiConfig;
