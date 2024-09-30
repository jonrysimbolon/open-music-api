const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, albumService, validator) {
    this._service = service;
    this._albumService = albumService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    const filename = await this._service.writeFile(cover, cover.hapi);
    const coverPath = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    this._validator.validateImageHeaders(cover.hapi.headers);

    await this._albumService.editCoverById(id, coverPath);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
