const Joi = require("joi");

// Definisikan skema Joi untuk validasi pengguna
const movieValidate = Joi.object({
  name_film: Joi.string().max(100).required().messages({
    "string.max": "Nama film tidak boleh lebih dari 100 karakter.",
    "any.required": "Nama film tidak boleh kosong.",
  }),

  picture_lama: Joi.string().allow("").optional(),

  trailer: Joi.string().required().messages({
    "any.required": "Trailer tidak boleh kosong.",
  }),
  deskripsi: Joi.string().required().messages({
    "any.required": "Deskripsi tidak boleh kosong.",
  }),
  durasi: Joi.string().required().messages({
    "any.required": "Durasi tidak boleh kosong.",
  }),
  sutradara: Joi.string().required().messages({
    "any.required": "Sutradara tidak boleh kosong.",
  }),
  rate_age: Joi.string().required().messages({
    "any.required": "Rate age tidak boleh kosong.",
  }),
  broadcast_date: Joi.date().required().messages({
    "any.required": "Broadcast date tidak boleh kosong.",
    "date.base": "Broadcast date harus berupa tanggal yang valid.",
  }),
  end_of_show: Joi.date().required().messages({
    "any.required": "End of show tidak boleh kosong.",
    "date.base": "End of show harus berupa tanggal yang valid.",
  }),
  id_genre: Joi.number().required().messages({
    "any.required": "ID genre tidak boleh kosong.",
    "number.base": "ID genre harus berupa angka.",
  }),
});

module.exports = movieValidate;
