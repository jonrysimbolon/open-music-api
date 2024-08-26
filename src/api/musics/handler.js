class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongsByIdHandler = this.getSongsByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumId } =
      request.payload;
    const songId = await this._service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });
    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  /*async getSongsHandler() {  // must have this for 5 stars => 1. ?title-> mencari lagu berdasarkan judul, 2. ?performer-> mencari lagu berdasarkan performer.
    const songs = await this._service.getSong();
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }*/

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;

    let queryText =
      'SELECT song_id AS id, name AS title, performer FROM songs WHERE 1=1';
    const queryValues = [];

    if (title) {
      queryText += ' AND name ILIKE $1';
      queryValues.push(`%${title}%`);
    }

    if (performer) {
      queryText += ` AND performer ILIKE $${queryValues.length + 1}`;
      queryValues.push(`%${performer}%`);
    }

    const result = await this._pool.query({
      text: queryText,
      values: queryValues,
    });

    return {
      status: 'success',
      data: {
        songs: result.rows,
      },
    };
  }

  async getSongsByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
