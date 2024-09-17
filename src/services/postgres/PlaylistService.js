const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { playlistMapDbToModel, songHalfMapDbToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async addSongToPlaylist({ playlistId, songId, credentialId }) {
    const id = nanoid(16);

    const querySong = {
      text: 'SELECT song_id FROM songs WHERE song_id = $1',
      values: [songId],
    };

    const resultSong = await this._pool.query(querySong);

    if (!resultSong.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    const queryPlaylistSong = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(queryPlaylistSong);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal diinput ke playlist');
    }

    await this.addPlaylistIdActivities(playlistId, songId, credentialId, 'add');

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner = $1',
      values: [owner],
    };
    let result = await this._pool.query(query);

    if (!result.rows.length) {
      result = await this.getPlaylistsCollaboration(owner);
    }
    return result.rows.map(playlistMapDbToModel);
  }

  async getPlaylistsCollaboration(owner) {
    const query = {
      text: 'select playlists.id, playlists.name, users.username as owner from collaborations JOIN playlists ON collaborations.playlist_id = playlists.id JOIN users ON playlists.owner = users.id where collaborations.user_id = $1',
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result;
  }

  async getSongsInsidePlaylists(playlistId, owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username, songs.song_id, songs.title, songs.performer FROM playlist_songs JOIN playlists ON playlist_songs.playlist_id = playlists.id JOIN users ON playlists.owner = users.id JOIN songs ON playlist_songs.song_id = songs.song_id WHERE playlists.id = $1 AND playlists.owner = $2',
      values: [playlistId, owner],
    };
    let results = await this._pool.query(query);

    if (!results.rows.length) {
      results = await this.getSongsInsidePlaylistsCollaboration(playlistId, owner);
    }

    const playlist = {
      id: results.rows[0].id,
      name: results.rows[0].name,
      username: results.rows[0].username,
      songs: results.rows.map(songHalfMapDbToModel),
    };
    return playlist;
  }

  async getSongsInsidePlaylistsCollaboration(playlistId, owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username, songs.song_id, songs.title, songs.performer FROM collaborations JOIN playlist_songs ON collaborations.playlist_id = playlist_songs.playlist_id JOIN playlists ON collaborations.playlist_id = playlists.id JOIN users ON playlists.owner = users.id JOIN songs ON playlist_songs.song_id = songs.song_id WHERE collaborations.playlist_id = $1 AND collaborations.user_id = $2',
      values: [playlistId, owner],
    };
    const results = await this._pool.query(query);

    if (results.rows.length === 0) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return results;
  }

  async addPlaylistIdActivities(playlistId, songId, userId, action) {
    const id = nanoid(16);

    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };
    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Playlist activity gagal diinput');
    }

    return result.rows;
  }

  async getPlaylistIdActivities(playlistId) {
    const query = {
      text: 'SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities JOIN playlists ON playlist_song_activities.playlist_id = playlists.id JOIN users ON playlist_song_activities.user_id = users.id JOIN songs ON playlist_song_activities.song_id = songs.song_id WHERE playlists.id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Playlist activity tidak ditemukan');
    }

    return result.rows;
  }

  async deleteSongsInsidePlaylistById(playlistId, songId, credentialId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(
        'Song gagal dihapus dari playlist, Id tidak ditemukan',
      );
    }

    await this.addPlaylistIdActivities(
      playlistId,
      songId,
      credentialId,
      'delete',
    );
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus, Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistService;
