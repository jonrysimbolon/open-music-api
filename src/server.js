require('dotenv').config();

const Hapi = require('@hapi/hapi');
const musics = require('./api/musics');
const MusicsService = require('./services/postgres/MusicsService');
const MusicsValidator = require('./validator/musics');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const musicsService = new MusicsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: notes,
    options: {
      service: musicsService,
      validator: MusicsValidator,
    },
  });

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request

    const { response } = request;
    
    /*if (response.isBoom) {
      console.error(response); // munculkan error berikut line yang terdampak
    }*/

    // penangangan client error secara internal
    if(response instanceof ClientError){
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
