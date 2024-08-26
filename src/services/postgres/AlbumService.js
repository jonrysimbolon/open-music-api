const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { albumMapDBToModel, albumIdMapDbToId } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO album VALUES($1, $2, $3) RETURNING album_id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].album_id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows.map(albumIdMapDbToId)[0].albumId;
  }

  /*async getAlbumById(id) { // for get five stars: must available songs on end of object 
    const query = {
      text: 'SELECT * FROM album WHERE album_id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows.map(albumMapDBToModel)[0];
  }*/

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM album WHERE album_id = $1',
      values: [id],
    };

    const querySongs = {
      text: 'SELECT song_id AS id, name AS title, performer FROM songs WHERE albumId = $1',
      values: [id],
    };

    const resultAlbum = await this._pool.query(queryAlbum);
    const resultSongs = await this._pool.query(querySongs);

    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = resultAlbum.rows.map(albumMapDBToModel)[0];
    album.songs = resultSongs.rows;

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE album SET name = $1, year = $2 WHERE album_id = $3 RETURNING album_id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM album WHERE album_id = $1 RETURNING album_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus, Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
