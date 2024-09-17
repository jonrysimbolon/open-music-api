const InvariantError = require('../../exceptions/InvariantError');
const {
  PostPlaylistsPayloadSchema,
  PostPlaylistByPlaylistsIdPayloadSchema,
} = require('./schema');

const PlaylistsValidator = {
  validatePostPlaylistsPayload: (payload) => {
    const validationResult = PostPlaylistsPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostPlaylistsByIdPayload: (payload) => {
    const validationResult = PostPlaylistByPlaylistsIdPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
