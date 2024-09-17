const Joi = require('joi');

const PostPlaylistsPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostPlaylistByPlaylistsIdPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistsPayloadSchema,
  PostPlaylistByPlaylistsIdPayloadSchema,
};
