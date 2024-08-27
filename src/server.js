require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albums = require('./api/musics/albums');
const songs = require('./api/musics/songs');
const AlbumsService = require('./services/postgres/AlbumService');
const SongsService = require('./services/postgres/SongService');
const MusicValidator = require('./validator/musics');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
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

  const plugins = [
    {
      plugin: albums,
      options: { service: albumsService, validator: MusicValidator },
    },
    {
      plugin: songs,
      options: { service: songsService, validator: MusicValidator },
    },
  ];

  await server.register(plugins);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

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
};

init();
