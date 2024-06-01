const Joi = require("joi");

const genreValidate = Joi.object({
  name_genre: Joi.string().max(100).required().messages({
    "string.max": "nama gendre maxsimal 100 kata",
    "any.required": "Nama gendre tidak boleh kosong",
  }),
});

module.exports = genreValidate;
