const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const {
  albumMapDBToModel,
  albumIdMapDbToId,
  songHalfMapDbToModel,
} = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING album_id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].album_id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    await this._cacheService.delete(`album:${id}`);
    return result.rows.map(albumIdMapDbToId)[0].albumId;
  }

  async getAlbumWithId(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE album_id = $1',
      values: [id],
    };

    const resultAlbum = await this._pool.query(queryAlbum);

    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return resultAlbum;
  }

  async getAlbumById(id) {
    try {
      const album = await this._cacheService.get(`album:${id}`);
      return {
        isCache: true,
        album: JSON.parse(album),
      };
    } catch (error) {
      const resultAlbum = await this.getAlbumWithId(id);

      const querySongs = {
        text: 'SELECT song_id, title, performer FROM songs WHERE album_id = $1',
        values: [id],
      };

      const resultSongs = await this._pool.query(querySongs);

      const album = resultAlbum.rows.map(albumMapDBToModel)[0];

      album.songs = resultSongs.rows.length
        ? resultSongs.rows.map(songHalfMapDbToModel)
        : [];

      await this._cacheService.set(
        `album:${id}`,
        JSON.stringify(album),
      );
      return {
        isCache: false,
        album,
      };
    }
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE album_id = $3 RETURNING album_id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
    await this._cacheService.delete(`album:${id}`);
  }

  async editCoverById(id, coverPath) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE album_id = $2 RETURNING album_id',
      values: [coverPath, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui cover. Id tidak ditemukan');
    }
    await this._cacheService.delete(`album:${id}`);
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE album_id = $1 RETURNING album_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus, Id tidak ditemukan');
    }
    await this._cacheService.delete(`album:${id}`);
  }

  async addLikeAlbumById({ albumId, credentialId }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING album_id',
      values: [id, credentialId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].album_id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getCountLikeById(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      return {
        isCache: true,
        likes: JSON.parse(result),
      };
    } catch (error) {
      const queryCountAlbumLikes = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(queryCountAlbumLikes);
      await this._cacheService.set(
        `likes:${albumId}`,
        JSON.stringify(result.rows.length),
      );
      return {
        isCache: false,
        likes: result.rows.length,
      };
    }
  }

  async checkUserLikeAlbum({ albumId, credentialId }) {
    const queryCountAlbumLikes = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, credentialId],
    };

    const result = await this._pool.query(queryCountAlbumLikes);

    if (result.rows.length) {
      throw new InvariantError(
        'User tidak boleh menyukai album lebih dari 1 kali',
      );
    }
  }

  async deleteLikeAlbumById(albumId, credentialId) {
    const queryDeleteLikeAlbum = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, credentialId],
    };

    await this._pool.query(queryDeleteLikeAlbum);
    await this._cacheService.delete(`likes:${albumId}`);
  }
}

module.exports = AlbumsService;
