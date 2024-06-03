const Joi = require("joi");

const pictureValidate = Joi.object({
  name_pictures: Joi.string().max(100).required().messages({
    "string.max": "Nama picture tidak boleh lebih dari 100 karakter",
    "any.required": "Nama picture tidak boleh kosong",
  }),
  picture: Joi.string(),
  picture_lama: Joi.string(),
  id_movie: Joi.number().required().messages({
    "any.required": "movie tidak boleh kosong",
  }),
});

module.exports = pictureValidate;
