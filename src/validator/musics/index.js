const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, SongPayloadSchema } = require('./schema');

const validatePayload = (payload, schema) => {
  const validationResult = schema.validate(payload);
  if (validationResult.error) {
    throw new InvariantError(validationResult.error.message);
  }
};

const MusicValidator = {
  validateAlbumPayload: (payload) => validatePayload(payload, AlbumPayloadSchema),
  validateSongPayload: (payload) => validatePayload(payload, SongPayloadSchema),
};

module.exports = MusicValidator;
