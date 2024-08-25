const Joi = require('joi');

/*const NotePayloadSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
});*/

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().require(),
  year: Joi.number().required(),
});

const SongPayloadSchema = Joi.object({
  title: Joi.string().require(),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().optional(),
  albumId: Joi.string().optional(),
});

//module.exports = { NotePayloadSchema };
module.exports = { AlbumPayloadSchema, SongPayloadSchema };
