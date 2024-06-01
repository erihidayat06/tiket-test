const Joi = require("joi");

const promotionValidate = Joi.object({
  title: Joi.string().max(100).required().messages({
    "string.max": "Judul Tidak boleh lebih dari 100 karakter",
    "any.required": "Judul tidak boleh kosong",
  }),
  image: Joi.string(),
  fill: Joi.string(),
});

module.exports = promotionValidate;
