const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistService, validator) {
    this._playlistService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    const { id: owner } = request.auth.credentials;

    this._validator.validatePostPlaylistsPayload(request.payload);

    const { name } = request.payload;

    const playlistId = await this._playlistService.addPlaylist({
      name,
      owner,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._playlistService.getPlaylists(owner);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async postPlaylistIdSongsHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    this._validator.validatePostPlaylistsByIdPayload(request.payload);
    const { songId } = request.payload;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    const playlistSongId = await this._playlistService.addSongToPlaylist({
      playlistId,
      songId,
      credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Song berhasil diinput ke playlist',
      data: {
        playlistSongId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistIdActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    const activities = await this._playlistService.getPlaylistIdActivities(
      playlistId,
    );
    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }

  async getPlaylistIdSongsHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._playlistService.getSongsInsidePlaylists(
      playlistId,
      credentialId,
    );

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistService.deletePlaylistById(playlistId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async deletePlaylistIdSongsHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    this._validator.validatePostPlaylistsByIdPayload(request.payload);

    const { songId } = request.payload;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistService.deleteSongsInsidePlaylistById(playlistId, songId, credentialId);
    return {
      status: 'success',
      message: 'Songs berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
