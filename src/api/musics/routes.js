const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler,
  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongsHandler, // must have this for 5 stars => 1. ?title-> mencari lagu berdasarkan judul, 2. ?performer-> mencari lagu berdasarkan performer.
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongsByIdHandler,
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler,
  },
];

module.exports = routes;
