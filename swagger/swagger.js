const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'CSE341 Event Calendar API',
    description: 'API documentation for Event Calendar project',
    version: '1.0.0'
  },
  host: 'localhost:8080',
  schemes: ['http']
};

const outputFile = './swagger/swagger.json';
const endpointsFiles = ['./src/routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
