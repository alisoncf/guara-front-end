// src/apiConfig.js

const isProduction = process.env.NODE_ENV === 'production';

const apiConfig = {
  baseURL: isProduction ? 'https://localhost:5000' : 'http://localhost:5000',
  endpoints: {
    classapi: '/classapi',
    sparqapi: '/sparqapi',
    objectapi: '/objectapi'
  }
};

export default apiConfig;
