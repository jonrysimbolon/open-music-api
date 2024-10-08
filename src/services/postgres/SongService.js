const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { songMapDBToModel, songIdMapDbToId } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING song_id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].song_id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows.map(songIdMapDbToId)[0].songId;
  }

  async getSongs({ title, performer }) {
    let queryText = 'SELECT song_id, title, performer FROM songs';
    const queryValues = [];

    if (title) {
      queryText += ' WHERE title ILIKE $1';
      queryValues.push(`%${title}%`);
    }

    if (performer) {
      if (title) {
        queryText += ` AND performer ILIKE $${queryValues.length + 1}`;
      } else {
        queryText += ` WHERE performer ILIKE $${queryValues.length + 1}`;
      }
      queryValues.push(`%${performer}%`);
    }

    const result = await this._pool.query({
      text: queryText,
      values: queryValues,
    });

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows.map(songMapDBToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE song_id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows.map(songMapDBToModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE song_id = $7 RETURNING song_id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE song_id = $1 RETURNING song_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus, Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
