require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albums = require('./api/musics/albums');
const songs = require('./api/musics/songs');
//const { AlbumsService, SongsService } = require('./services/postgres');
const AlbumsService = require('./services/postgres/AlbumService');
const SongsService = require('./services/postgres/SongService');
const { AlbumValidator, SongValidator } = require('./validator/musics');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  //const musicsService = new MusicsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

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
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumValidator,
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongValidator,
    },
  });

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request

    const { response } = request;

    /*if (response.isBoom) {
      console.error(response); // munculkan error berikut line yang terdampak
    }*/

    // penangangan client error secara internal
    if (response instanceof ClientError) {
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
