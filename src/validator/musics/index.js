const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, SongPayloadSchema } = require('./schema');

/*const NotesValidator = {
    validateNotePayload: (payload) => {
        const validationResult = NotePayloadSchema.validate(payload);
        if(validationResult.error){
            throw new InvariantError(validationResult.error.message);
        }
    }
};*/

const AlbumValidator = {
    validateAlbumPayload: (payload) => {
        const validationResult = AlbumPayloadSchema.validate(payload);
        if(validationResult.error){
            throw new InvariantError(validationResult.error.message);
        }
    }
};

const SongValidator = {
    validateSongPayload: (payload) => {
        const validationResult = SongPayloadSchema.validate(payload);
        if(validationResult.error){
            throw new InvariantError(validationResult.error.message);
        }
    }
};

//module.exports = NotesValidator;
module.exports = {AlbumValidator, SongValidator};